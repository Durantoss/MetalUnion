import WebSocket, { WebSocketServer } from 'ws';
import type { Server } from 'http';
import { storage } from './storage';
import { MessageEncryption } from './encryption';

/**
 * Complete WebSocket Real-Time Messaging Examples
 * Demonstrates comprehensive real-time functionality
 */

interface WebSocketMessage {
  type: 'message' | 'typing' | 'read_receipt' | 'delivery_receipt' | 'user_status' | 'connection_test';
  data: any;
  conversationId?: string;
  messageId?: string;
  userId?: string;
  timestamp?: string;
}

interface ConnectedUser {
  userId: string;
  socket: WebSocket;
  lastSeen: Date;
  isTyping: boolean;
  activeConversations: Set<string>;
}

/**
 * Enhanced WebSocket Examples with Complete Functionality
 */
export class WebSocketExamples {
  private wss: WebSocketServer;
  private userConnections = new Map<string, Set<WebSocket>>();
  private socketToUser = new Map<WebSocket, string>();
  private typingUsers = new Map<string, Set<string>>(); // conversationId -> Set of userIds
  private connectionStats = {
    totalConnections: 0,
    activeConnections: 0,
    messagesExchanged: 0,
    encryptedMessages: 0
  };

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws-examples'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🚀 WebSocket Examples server initialized on /ws-examples');
    
    // Periodic cleanup and stats logging
    setInterval(this.cleanupConnections.bind(this), 30000);
    setInterval(this.logStats.bind(this), 60000);
  }

  private handleConnection(ws: WebSocket, request: any) {
    this.connectionStats.totalConnections++;
    this.connectionStats.activeConnections++;
    
    console.log(`📱 New WebSocket connection (Total: ${this.connectionStats.activeConnections})`);

    // Send welcome message with examples
    this.sendWelcomeMessage(ws);

    ws.on('message', (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    ws.on('close', () => {
      this.handleDisconnection(ws);
      this.connectionStats.activeConnections--;
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });
  }

  private sendWelcomeMessage(ws: WebSocket) {
    const welcomeMessage = {
      type: 'welcome',
      data: {
        message: 'Welcome to MoshUnion WebSocket Examples! 🤘',
        features: [
          'Real-time messaging with end-to-end encryption',
          'Typing indicators and read receipts',
          'User presence and status updates',
          'Connection testing and monitoring',
          'Message delivery confirmations'
        ],
        availableCommands: [
          '/auth <userId> - Authenticate with user ID',
          '/encrypt <message> - Test message encryption',
          '/typing <conversationId> - Test typing indicator',
          '/status <online|offline> - Update user status',
          '/stats - Get connection statistics'
        ],
        stats: this.connectionStats
      }
    };
    
    ws.send(JSON.stringify(welcomeMessage));
  }

  private async handleMessage(ws: WebSocket, message: WebSocketMessage) {
    const { type, data } = message;

    switch (type) {
      case 'connection_test':
        await this.handleConnectionTest(ws, data);
        break;
      case 'message':
        await this.handleNewMessage(ws, message);
        break;
      case 'typing':
        await this.handleTypingIndicator(ws, message);
        break;
      case 'read_receipt':
        await this.handleReadReceipt(ws, message);
        break;
      case 'delivery_receipt':
        await this.handleDeliveryReceipt(ws, message);
        break;
      case 'user_status':
        await this.handleUserStatus(ws, message);
        break;
      default:
        // Handle special commands for testing
        if (data?.command) {
          await this.handleCommand(ws, data.command, data.args);
        } else {
          console.log('Unknown message type:', type);
        }
    }
  }

  private async handleConnectionTest(ws: WebSocket, data: any) {
    const testResult = {
      type: 'connection_test_result',
      data: {
        timestamp: new Date().toISOString(),
        latency: Date.now() - (data.clientTimestamp || Date.now()),
        server: 'MoshUnion WebSocket Examples',
        status: 'connected',
        activeConnections: this.connectionStats.activeConnections,
        echo: data.testMessage || 'No test message provided'
      }
    };
    
    ws.send(JSON.stringify(testResult));
  }

  private async handleNewMessage(ws: WebSocket, message: WebSocketMessage) {
    try {
      const { conversationId, content, recipientId, encrypt = true } = message.data;
      const senderId = this.socketToUser.get(ws);
      
      if (!senderId) {
        this.sendError(ws, 'Authentication required');
        return;
      }

      this.connectionStats.messagesExchanged++;
      
      let finalContent = content;
      let encryptionData = null;

      // Demonstrate encryption if requested
      if (encrypt) {
        try {
          // Get recipient's encryption keys
          const recipientKeys = await storage.getEncryptionKeys();
          if (recipientKeys) {
            const encrypted = MessageEncryption.encryptMessage(content, recipientKeys.publicKey);
            finalContent = encrypted.encryptedData;
            encryptionData = {
              encryptedKey: encrypted.encryptedKey,
              iv: encrypted.iv,
              method: 'RSA-2048 + AES-256-GCM'
            };
            this.connectionStats.encryptedMessages++;
          }
        } catch (encryptError) {
          console.log('Encryption demo failed, sending unencrypted:', encryptError);
        }
      }

      // Create example message object
      const messageObj = {
        id: Date.now().toString(),
        conversationId,
        senderId,
        content: finalContent,
        originalContent: encrypt ? content : undefined,
        encryptionData,
        timestamp: new Date().toISOString(),
        isEncrypted: !!encryptionData,
        messageType: 'text'
      };

      // Send to recipient if online
      const recipientSockets = this.userConnections.get(recipientId);
      if (recipientSockets) {
        const recipientMessage = {
          type: 'new_message',
          data: messageObj
        };
        
        recipientSockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(recipientMessage));
          }
        });

        // Send delivery receipt
        setTimeout(() => {
          this.sendDeliveryReceipt(ws, messageObj.id, senderId);
        }, 100);
      }

      // Confirm to sender
      ws.send(JSON.stringify({
        type: 'message_sent',
        data: {
          ...messageObj,
          delivered: !!recipientSockets,
          deliveredAt: recipientSockets ? new Date().toISOString() : null
        }
      }));

    } catch (error) {
      console.error('Message handling error:', error);
      this.sendError(ws, 'Failed to send message');
    }
  }

  private async handleTypingIndicator(ws: WebSocket, message: WebSocketMessage) {
    const { conversationId, isTyping } = message.data;
    const userId = this.socketToUser.get(ws);
    
    if (!userId || !conversationId) return;

    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }

    const typingSet = this.typingUsers.get(conversationId)!;
    
    if (isTyping) {
      typingSet.add(userId);
    } else {
      typingSet.delete(userId);
    }

    // Broadcast typing status to conversation participants
    const typingMessage = {
      type: 'typing_indicator',
      data: {
        conversationId,
        userId,
        isTyping,
        typingUsers: Array.from(typingSet),
        timestamp: new Date().toISOString()
      }
    };

    // Send to all other users in the conversation
    this.broadcastToConversation(conversationId, typingMessage, userId);
  }

  private async handleReadReceipt(ws: WebSocket, message: WebSocketMessage) {
    const { messageId, conversationId } = message.data;
    const userId = this.socketToUser.get(ws);
    
    if (!userId) return;

    const receiptMessage = {
      type: 'read_receipt',
      data: {
        messageId,
        conversationId,
        readBy: userId,
        readAt: new Date().toISOString()
      }
    };

    // Send read receipt to message sender
    this.broadcastToConversation(conversationId, receiptMessage, userId);
  }

  private async handleDeliveryReceipt(ws: WebSocket, message: WebSocketMessage) {
    const { messageId, conversationId } = message.data;
    const userId = this.socketToUser.get(ws);
    
    if (!userId) return;

    const receiptMessage = {
      type: 'delivery_receipt',
      data: {
        messageId,
        conversationId,
        deliveredTo: userId,
        deliveredAt: new Date().toISOString()
      }
    };

    this.broadcastToConversation(conversationId, receiptMessage, userId);
  }

  private async handleUserStatus(ws: WebSocket, message: WebSocketMessage) {
    const { status } = message.data;
    const userId = this.socketToUser.get(ws);
    
    if (!userId) return;

    const statusMessage = {
      type: 'user_status_update',
      data: {
        userId,
        status,
        timestamp: new Date().toISOString(),
        activeConnections: this.userConnections.get(userId)?.size || 0
      }
    };

    // Broadcast status to all connected users
    this.broadcastToAll(statusMessage, userId);
  }

  private async handleCommand(ws: WebSocket, command: string, args: any[]) {
    const parts = command.split(' ');
    const cmd = parts[0];
    
    switch (cmd) {
      case '/auth':
        this.authenticateUser(ws, parts[1] || args[0]);
        break;
      case '/encrypt':
        await this.testEncryption(ws, parts.slice(1).join(' ') || args.join(' '));
        break;
      case '/typing':
        this.simulateTyping(ws, parts[1] || args[0]);
        break;
      case '/status':
        this.updateStatus(ws, parts[1] || args[0]);
        break;
      case '/stats':
        this.sendStats(ws);
        break;
      default:
        this.sendError(ws, `Unknown command: ${cmd}`);
    }
  }

  private authenticateUser(ws: WebSocket, userId: string) {
    if (!userId) {
      this.sendError(ws, 'User ID required for authentication');
      return;
    }

    // Register user connection
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(ws);
    this.socketToUser.set(ws, userId);

    ws.send(JSON.stringify({
      type: 'auth_success',
      data: {
        userId,
        timestamp: new Date().toISOString(),
        message: `Authenticated as ${userId} 🎸`
      }
    }));

    console.log(`🎸 User ${userId} authenticated via WebSocket`);
  }

  private async testEncryption(ws: WebSocket, message: string) {
    try {
      // Generate demo keys
      const keys = await MessageEncryption.generateKeyPair();
      
      // Encrypt and decrypt
      const encrypted = MessageEncryption.encryptMessage(message, keys.publicKey);
      const decrypted = MessageEncryption.decryptMessage(encrypted, keys.privateKey);
      
      ws.send(JSON.stringify({
        type: 'encryption_test_result',
        data: {
          original: message,
          encrypted: {
            data: encrypted.encryptedData.substring(0, 50) + '...',
            key: encrypted.encryptedKey.substring(0, 50) + '...',
            iv: encrypted.iv
          },
          decrypted,
          success: message === decrypted,
          method: 'RSA-2048 + AES-256-GCM'
        }
      }));
    } catch (error) {
      this.sendError(ws, 'Encryption test failed');
    }
  }

  private simulateTyping(ws: WebSocket, conversationId: string) {
    if (!conversationId) {
      this.sendError(ws, 'Conversation ID required');
      return;
    }

    // Start typing
    this.handleTypingIndicator(ws, {
      type: 'typing',
      data: { conversationId, isTyping: true }
    });

    // Stop typing after 3 seconds
    setTimeout(() => {
      this.handleTypingIndicator(ws, {
        type: 'typing',
        data: { conversationId, isTyping: false }
      });
    }, 3000);
  }

  private updateStatus(ws: WebSocket, status: string) {
    this.handleUserStatus(ws, {
      type: 'user_status',
      data: { status }
    });
  }

  private sendStats(ws: WebSocket) {
    ws.send(JSON.stringify({
      type: 'connection_stats',
      data: {
        ...this.connectionStats,
        connectedUsers: this.userConnections.size,
        activeTypingSessions: this.typingUsers.size,
        timestamp: new Date().toISOString()
      }
    }));
  }

  private sendDeliveryReceipt(ws: WebSocket, messageId: string, senderId: string) {
    ws.send(JSON.stringify({
      type: 'delivery_receipt',
      data: {
        messageId,
        deliveredTo: senderId,
        deliveredAt: new Date().toISOString()
      }
    }));
  }

  private broadcastToConversation(conversationId: string, message: any, excludeUserId?: string) {
    // In a real implementation, you'd get conversation participants from database
    // For demo purposes, broadcast to all connected users except sender
    this.userConnections.forEach((sockets, userId) => {
      if (userId !== excludeUserId) {
        sockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
          }
        });
      }
    });
  }

  private broadcastToAll(message: any, excludeUserId?: string) {
    this.userConnections.forEach((sockets, userId) => {
      if (userId !== excludeUserId) {
        sockets.forEach(socket => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
          }
        });
      }
    });
  }

  private sendError(ws: WebSocket, error: string) {
    ws.send(JSON.stringify({
      type: 'error',
      data: { error, timestamp: new Date().toISOString() }
    }));
  }

  private handleDisconnection(ws: WebSocket) {
    const userId = this.socketToUser.get(ws);
    if (userId) {
      const userSockets = this.userConnections.get(userId);
      if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          this.userConnections.delete(userId);
          
          // Broadcast user offline status
          this.broadcastToAll({
            type: 'user_status_update',
            data: {
              userId,
              status: 'offline',
              timestamp: new Date().toISOString()
            }
          }, userId);
        }
      }
      this.socketToUser.delete(ws);
    }
  }

  private cleanupConnections() {
    // Remove closed connections
    this.userConnections.forEach((sockets, userId) => {
      const activeSockets = new Set<WebSocket>();
      sockets.forEach(socket => {
        if (socket.readyState === WebSocket.OPEN) {
          activeSockets.add(socket);
        }
      });
      
      if (activeSockets.size === 0) {
        this.userConnections.delete(userId);
      } else {
        this.userConnections.set(userId, activeSockets);
      }
    });

    // Clean up typing indicators
    this.typingUsers.forEach((users, conversationId) => {
      if (users.size === 0) {
        this.typingUsers.delete(conversationId);
      }
    });
  }

  private logStats() {
    // WebSocket Examples Stats tracking (disabled for production)
    // Stats: connectedUsers: ${this.userConnections.size}, activeTypingSessions: ${this.typingUsers.size}
  }
}