import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { MessageEncryption } from './encryption';
import { DoubleRatchetService } from './doubleRatchetService';
import type { DirectMessage, InsertDirectMessage } from '@shared/schema';

interface WebSocketMessage {
  type: 'message' | 'typing' | 'read_receipt' | 'delivery_receipt' | 'user_status' | 'auth' | 'encrypted_message';
  data: any;
  conversationId?: string;
  messageId?: string;
  userId?: string;
  password?: string; // For Double Ratchet encryption
}

interface ConnectedUser {
  userId: string;
  socket: WebSocket;
  lastSeen: Date;
}

/**
 * Real-time WebSocket server for messaging system
 */
export class MessagingWebSocketServer {
  private wss: WebSocketServer;
  private connectedUsers = new Map<string, ConnectedUser>();
  private userConnections = new Map<string, Set<WebSocket>>();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      clientTracking: true
    });

    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      // New WebSocket connection established

      // Handle authentication and user identification
      let userId: string | null = null;
      let isAuthenticated = false;

      ws.on('message', async (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          
          // Handle authentication
          if (message.type === 'auth' && message.data.userId) {
            userId = message.data.userId;
            isAuthenticated = true;
            
            // Register user connection
            this.registerUserConnection(userId!, ws);
            
            // Send confirmation
            ws.send(JSON.stringify({
              type: 'auth_success',
              data: { 
                userId,
                encryptionEnabled: true,
                algorithm: 'Double Ratchet + Ed25519 + X25519 + AES-256'
              }
            }));
            
            // Notify user's contacts about online status
            await this.broadcastUserStatus(userId!, 'online');
            
            console.log(`User ${userId} authenticated via WebSocket with encryption`);
            return;
          }

          // Require authentication for all other messages
          if (!isAuthenticated || !userId) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: 'Authentication required' }
            }));
            return;
          }

          // Handle different message types
          await this.handleMessage(message, userId, ws);
          
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            data: { message: 'Invalid message format' }
          }));
        }
      });

      ws.on('close', async () => {
        if (userId) {
          this.unregisterUserConnection(userId, ws);
          await this.broadcastUserStatus(userId, 'offline');
          console.log(`User ${userId} disconnected`);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      ws.on('close', () => clearInterval(pingInterval));
    });
  }

  private async handleMessage(message: WebSocketMessage, userId: string, ws: WebSocket) {
    switch (message.type) {
      case 'message':
        await this.handleNewMessage(message, userId);
        break;
      
      case 'encrypted_message':
        await this.handleEncryptedMessage(message, userId);
        break;
      
      case 'typing':
        await this.handleTypingIndicator(message, userId);
        break;
      
      case 'read_receipt':
        await this.handleReadReceipt(message, userId);
        break;
      
      case 'delivery_receipt':
        await this.handleDeliveryReceipt(message, userId);
        break;
      
      default:
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Unknown message type' }
        }));
    }
  }

  /**
   * Handle encrypted message using Double Ratchet
   */
  private async handleEncryptedMessage(message: WebSocketMessage, senderId: string) {
    try {
      const { conversationId, data, password } = message;
      
      if (!conversationId || !data || !password) {
        console.error('Missing required fields for encrypted message');
        return;
      }

      // Send encrypted message using Double Ratchet
      const encryptedMessage = await DoubleRatchetService.sendMessage(
        conversationId,
        senderId,
        data.content,
        password
      );

      // Broadcast to all connected users (simplified for demo)
      this.broadcast({
        type: 'encrypted_message_received',
        data: {
          messageId: encryptedMessage.id,
          senderId,
          conversationId,
          timestamp: encryptedMessage.createdAt,
          encrypted: true
        }
      });

      console.log(`Encrypted message sent in conversation ${conversationId}`);
      
    } catch (error) {
      console.error('Error handling encrypted message:', error);
    }
  }

  private async handleNewMessage(message: WebSocketMessage, senderId: string) {
    try {
      const { conversationId, content, messageType = 'text', recipientId } = message.data;
      
      // Get recipient's public key for encryption (simplified for demo)
      const recipientKeys = { id: 'demo-key', publicKey: 'demo-public-key' };

      // Encrypt message content
      const encryptedMessage = MessageEncryption.encryptMessage(content, recipientKeys.publicKey);
      
      // Save message to database
      const directMessage: InsertDirectMessage = {
        conversationId,
        senderId,
        messageType,
        encryptedContent: encryptedMessage.encryptedData,
        encryptionKeyId: recipientKeys.id,
        initializationVector: encryptedMessage.iv
      };

      const savedMessage = await storage.createMessage(directMessage);
      
      // Update conversation last message time
      await storage.updateConversationLastMessage(conversationId);

      // Send to recipient if online
      const recipientSockets = this.userConnections.get(recipientId);
      if (recipientSockets) {
        const messagePayload = {
          type: 'new_message',
          data: {
            id: savedMessage.id,
            conversationId,
            senderId,
            messageType,
            content, // Send decrypted content to recipient
            createdAt: savedMessage.createdAt
          }
        };

        recipientSockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(messagePayload));
          }
        });

        // Send delivery receipt
        await this.handleDeliveryReceipt({
          type: 'delivery_receipt',
          messageId: savedMessage.id,
          userId: recipientId
        } as WebSocketMessage, recipientId);
      }

      // Confirm to sender
      const senderSockets = this.userConnections.get(senderId);
      if (senderSockets) {
        const confirmPayload = {
          type: 'message_sent',
          data: {
            id: savedMessage.id,
            conversationId,
            tempId: message.data.tempId // Client-side temporary ID for optimistic updates
          }
        };

        senderSockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(confirmPayload));
          }
        });
      }

    } catch (error) {
      console.error('Error handling new message:', error);
      // Send error to sender
      const senderSockets = this.userConnections.get(senderId);
      if (senderSockets) {
        senderSockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: 'message_error',
              data: { 
                message: 'Failed to send message',
                tempId: message.data.tempId 
              }
            }));
          }
        });
      }
    }
  }

  private async handleTypingIndicator(message: WebSocketMessage, userId: string) {
    const { conversationId, isTyping, recipientId } = message.data;
    
    // Send typing indicator to recipient
    const recipientSockets = this.userConnections.get(recipientId);
    if (recipientSockets) {
      const typingPayload = {
        type: 'typing_indicator',
        data: {
          conversationId,
          userId,
          isTyping
        }
      };

      recipientSockets.forEach(socket => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(typingPayload));
        }
      });
    }
  }

  private async handleReadReceipt(message: WebSocketMessage, userId: string) {
    const { messageId, conversationId } = message.data;
    
    // Update message as read in database
    await storage.markMessageAsRead(messageId, userId);
    
    // Get message sender
    const directMessage = await storage.getDirectMessage(messageId);
    if (directMessage) {
      // Send read receipt to sender
      const senderSockets = this.userConnections.get(directMessage.senderId);
      if (senderSockets) {
        const receiptPayload = {
          type: 'read_receipt',
          data: {
            messageId,
            conversationId,
            readBy: userId,
            readAt: new Date()
          }
        };

        senderSockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(receiptPayload));
          }
        });
      }
    }
  }

  private async handleDeliveryReceipt(message: WebSocketMessage, userId: string) {
    const { messageId } = message.data;
    
    // Update message as delivered in database
    await storage.markMessageAsDelivered(messageId, userId);
    
    // Send delivery receipt to sender
    const directMessage = await storage.getDirectMessage(messageId);
    if (directMessage) {
      const senderSockets = this.userConnections.get(directMessage.senderId);
      if (senderSockets) {
        const receiptPayload = {
          type: 'delivery_receipt',
          data: {
            messageId,
            deliveredTo: userId,
            deliveredAt: new Date()
          }
        };

        senderSockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(receiptPayload));
          }
        });
      }
    }
  }

  private registerUserConnection(userId: string, ws: WebSocket) {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(ws);
  }

  private unregisterUserConnection(userId: string, ws: WebSocket) {
    const userSockets = this.userConnections.get(userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        this.userConnections.delete(userId);
      }
    }
  }

  private async broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    // Get user's conversation partners
    const conversations = await storage.getUserConversations(userId);
    
    for (const conversation of conversations) {
      const partnerId = conversation.participant1Id === userId 
        ? conversation.participant2Id 
        : conversation.participant1Id;
      
      const partnerSockets = this.userConnections.get(partnerId);
      if (partnerSockets) {
        const statusPayload = {
          type: 'user_status',
          data: {
            userId,
            status,
            lastSeen: new Date()
          }
        };

        partnerSockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(statusPayload));
          }
        });
      }
    }
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userConnections.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId);
  }

  // Send message to specific user
  async sendMessageToUser(userId: string, message: any) {
    const userSockets = this.userConnections.get(userId);
    if (userSockets) {
      userSockets.forEach(socket => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(message));
        }
      });
    }
  }
}