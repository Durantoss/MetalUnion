import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { storage } from './storage';
import { MessageEncryption } from './encryption';

interface WSMessage {
  type: 'auth' | 'send_message' | 'join_conversation' | 'typing' | 'read_receipt' | 'get_conversations' | 'get_messages' | 'ping';
  data: any;
  conversationId?: string;
  messageId?: string;
  timestamp?: string;
}

interface ConnectedUser {
  userId: string;
  socket: WebSocket;
  stagename: string;
  lastSeen: Date;
  activeConversations: Set<string>;
  isAuthenticated: boolean;
}

/**
 * Production-Ready WebSocket Messaging Server
 * Combines real-time messaging with encryption and authentication
 */
export class ProductionMessagingServer {
  private wss: WebSocketServer;
  private connectedUsers = new Map<string, ConnectedUser>();
  private socketToUserId = new Map<WebSocket, string>();
  private conversationSubscriptions = new Map<string, Set<string>>(); // conversationId -> Set of userIds
  
  private stats = {
    totalConnections: 0,
    activeConnections: 0,
    messagesDelivered: 0,
    encryptedMessages: 0
  };

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/messaging-ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🎸 Production Messaging WebSocket server initialized on /messaging-ws');
    
    // Cleanup and stats logging
    setInterval(this.cleanupConnections.bind(this), 30000);
    setInterval(this.logStats.bind(this), 60000);
  }

  private handleConnection(ws: WebSocket, request: any) {
    this.stats.totalConnections++;
    this.stats.activeConnections++;
    
    console.log(`📱 New messaging connection (Active: ${this.stats.activeConnections})`);

    // Send welcome message
    this.sendToSocket(ws, {
      type: 'welcome',
      data: {
        message: 'Connected to MoshUnion messaging! 🤘',
        timestamp: new Date().toISOString()
      }
    });

    ws.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });
  }

  private async handleMessage(ws: WebSocket, message: WSMessage) {
    const { type, data } = message;

    try {
      switch (type) {
        case 'auth':
          await this.handleAuth(ws, data);
          break;
          
        case 'send_message':
          await this.handleSendMessage(ws, data);
          break;
          
        case 'join_conversation':
          await this.handleJoinConversation(ws, data);
          break;
          
        case 'get_conversations':
          await this.handleGetConversations(ws);
          break;
          
        case 'get_messages':
          await this.handleGetMessages(ws, data);
          break;
          
        case 'typing':
          await this.handleTyping(ws, data);
          break;
          
        case 'read_receipt':
          await this.handleReadReceipt(ws, data);
          break;
          
        case 'ping':
          this.sendToSocket(ws, { type: 'pong', data: { timestamp: new Date().toISOString() } });
          break;
          
        default:
          console.log('Unknown message type:', type);
          this.sendError(ws, `Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error(`Error handling ${type}:`, error);
      this.sendError(ws, `Failed to process ${type}`);
    }
  }

  private async handleAuth(ws: WebSocket, data: any) {
    const { userId, stagename } = data;
    
    if (!userId || !stagename) {
      this.sendError(ws, 'Authentication requires userId and stagename');
      return;
    }

    // Create or update user connection
    const user: ConnectedUser = {
      userId,
      socket: ws,
      stagename,
      lastSeen: new Date(),
      activeConversations: new Set(),
      isAuthenticated: true
    };

    this.connectedUsers.set(userId, user);
    this.socketToUserId.set(ws, userId);

    this.sendToSocket(ws, {
      type: 'auth_success',
      data: {
        userId,
        stagename,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`✅ User authenticated: ${stagename} (${userId})`);
  }

  private async handleSendMessage(ws: WebSocket, data: any) {
    const userId = this.socketToUserId.get(ws);
    if (!userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    const { conversationId, content, encrypted = false } = data;
    
    if (!conversationId || !content) {
      this.sendError(ws, 'Message requires conversationId and content');
      return;
    }

    try {
      // Create message in database
      const message = await storage.createMessage({
        conversationId,
        senderId: userId,
        content: encrypted ? data.encryptedContent : content,
        messageType: 'text',
        encrypted,
        timestamp: new Date().toISOString()
      });

      this.stats.messagesDelivered++;
      if (encrypted) this.stats.encryptedMessages++;

      // Send to all participants in conversation
      const conversation = await storage.getConversation(conversationId);
      if (conversation) {
        const participants = [conversation.participant1Id, conversation.participant2Id];
        
        for (const participantId of participants) {
          const user = this.connectedUsers.get(participantId);
          if (user && user.socket.readyState === WebSocket.OPEN) {
            this.sendToSocket(user.socket, {
              type: 'message_received',
              data: {
                id: message.id,
                conversationId,
                senderId: userId,
                content,
                encrypted,
                timestamp: message.timestamp
              }
            });
          }
        }
      }

      // Confirm to sender
      this.sendToSocket(ws, {
        type: 'message_sent',
        data: {
          messageId: message.id,
          conversationId,
          timestamp: message.timestamp
        }
      });

      console.log(`📨 Message sent in conversation ${conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      this.sendError(ws, 'Failed to send message');
    }
  }

  private async handleJoinConversation(ws: WebSocket, data: any) {
    const userId = this.socketToUserId.get(ws);
    if (!userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    const { conversationId } = data;
    if (!conversationId) {
      this.sendError(ws, 'Conversation ID required');
      return;
    }

    const user = this.connectedUsers.get(userId);
    if (user) {
      user.activeConversations.add(conversationId);
      
      // Subscribe to conversation updates
      if (!this.conversationSubscriptions.has(conversationId)) {
        this.conversationSubscriptions.set(conversationId, new Set());
      }
      this.conversationSubscriptions.get(conversationId)!.add(userId);

      this.sendToSocket(ws, {
        type: 'conversation_joined',
        data: { conversationId, timestamp: new Date().toISOString() }
      });

      console.log(`👥 User ${userId} joined conversation ${conversationId}`);
    }
  }

  private async handleGetConversations(ws: WebSocket) {
    const userId = this.socketToUserId.get(ws);
    if (!userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    try {
      const conversations = await storage.getConversations(userId);
      
      this.sendToSocket(ws, {
        type: 'conversations_list',
        data: { conversations }
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      this.sendError(ws, 'Failed to get conversations');
    }
  }

  private async handleGetMessages(ws: WebSocket, data: any) {
    const userId = this.socketToUserId.get(ws);
    if (!userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    const { conversationId, limit = 50, offset = 0 } = data;
    if (!conversationId) {
      this.sendError(ws, 'Conversation ID required');
      return;
    }

    try {
      const messages = await storage.getMessages(conversationId);
      
      this.sendToSocket(ws, {
        type: 'messages_list',
        data: { 
          conversationId,
          messages,
          hasMore: messages.length === limit
        }
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      this.sendError(ws, 'Failed to get messages');
    }
  }

  private async handleTyping(ws: WebSocket, data: any) {
    const userId = this.socketToUserId.get(ws);
    if (!userId) return;

    const { conversationId, isTyping } = data;
    if (!conversationId) return;

    // Broadcast typing status to other participants
    const conversation = await storage.getConversation(conversationId);
    if (conversation) {
      const otherParticipant = conversation.participant1Id === userId 
        ? conversation.participant2Id 
        : conversation.participant1Id;
      
      const otherUser = this.connectedUsers.get(otherParticipant);
      if (otherUser && otherUser.socket.readyState === WebSocket.OPEN) {
        this.sendToSocket(otherUser.socket, {
          type: 'typing_status',
          data: {
            conversationId,
            userId,
            isTyping,
            timestamp: new Date().toISOString()
          }
        });
      }
    }
  }

  private async handleReadReceipt(ws: WebSocket, data: any) {
    const userId = this.socketToUserId.get(ws);
    if (!userId) return;

    const { messageId, conversationId } = data;
    if (!messageId) return;

    try {
      // Mark message as read
      await storage.markMessageAsRead(messageId, userId);

      // Notify sender if online
      const message = await storage.getMessage(messageId);
      if (message) {
        const senderUser = this.connectedUsers.get(message.authorId);
        if (senderUser && senderUser.socket.readyState === WebSocket.OPEN) {
          this.sendToSocket(senderUser.socket, {
            type: 'message_read',
            data: {
              messageId,
              conversationId,
              readBy: userId,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    } catch (error) {
      console.error('Error handling read receipt:', error);
    }
  }

  private handleDisconnection(ws: WebSocket) {
    const userId = this.socketToUserId.get(ws);
    
    if (userId) {
      this.connectedUsers.delete(userId);
      this.socketToUserId.delete(ws);
      
      // Remove from conversation subscriptions
      for (const [conversationId, userIds] of Array.from(this.conversationSubscriptions.entries())) {
        userIds.delete(userId);
        if (userIds.size === 0) {
          this.conversationSubscriptions.delete(conversationId);
        }
      }
      
      console.log(`📱 User ${userId} disconnected`);
    }
    
    this.stats.activeConnections--;
  }

  private sendToSocket(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.sendToSocket(ws, {
      type: 'error',
      data: { message: error, timestamp: new Date().toISOString() }
    });
  }

  private cleanupConnections() {
    // Remove dead connections
    for (const [userId, user] of Array.from(this.connectedUsers.entries())) {
      if (user.socket.readyState !== WebSocket.OPEN) {
        this.connectedUsers.delete(userId);
        this.socketToUserId.delete(user.socket);
        this.stats.activeConnections--;
      }
    }
  }

  private logStats() {
    // Stats logging disabled for production
  }

  // Public method to get server stats
  public getStats() {
    return {
      ...this.stats,
      activeUsers: this.connectedUsers.size,
      activeConversations: this.conversationSubscriptions.size
    };
  }
}