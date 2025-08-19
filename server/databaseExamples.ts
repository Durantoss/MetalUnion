import type { Express } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";

/**
 * Complete Database Examples for Secured Messaging
 * Demonstrates all database operations for the messaging system
 */
export function registerDatabaseExamples(app: Express) {
  
  // Get all conversations for authenticated user
  app.get("/api/messaging/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      
      res.json({
        success: true,
        conversations,
        count: conversations.length
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Create a new conversation
  app.post("/api/messaging/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const { participant2Id } = req.body;
      const participant1Id = req.user.claims.sub;
      
      if (!participant2Id) {
        return res.status(400).json({ error: "participant2Id is required" });
      }
      
      const conversation = await storage.createConversation({
        participant1Id,
        participant2Id,
        isEncrypted: true
      });
      
      res.json({
        success: true,
        conversation
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Get messages for a specific conversation
  app.get("/api/messaging/conversations/:conversationId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const messages = await storage.getConversationMessages(
        conversationId, 
        parseInt(limit), 
        parseInt(offset)
      );
      
      res.json({
        success: true,
        messages,
        count: messages.length,
        conversationId
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a new message
  app.post("/api/messaging/conversations/:conversationId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { conversationId } = req.params;
      const { content, messageType = 'text', recipientId } = req.body;
      const senderId = req.user.claims.sub;
      
      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }
      
      // For this example, we'll store the message unencrypted in the demo
      // In production, you'd encrypt it here
      const message = await storage.createDirectMessage({
        conversationId,
        senderId,
        messageType,
        encryptedContent: content, // In demo mode, storing as plain text
        initializationVector: 'demo-iv'
      });
      
      // Update conversation last message time
      await storage.updateConversationLastMessage(conversationId);
      
      res.json({
        success: true,
        message
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Mark message as read
  app.post("/api/messaging/messages/:messageId/read", isAuthenticated, async (req: any, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.markMessageAsRead(messageId, userId);
      
      res.json({
        success: true,
        messageId,
        readBy: userId,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  // Mark message as delivered
  app.post("/api/messaging/messages/:messageId/delivered", isAuthenticated, async (req: any, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.markMessageAsDelivered(messageId, userId);
      
      res.json({
        success: true,
        messageId,
        deliveredTo: userId,
        deliveredAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error marking message as delivered:", error);
      res.status(500).json({ error: "Failed to mark message as delivered" });
    }
  });

  // Get delivery receipts for a message
  app.get("/api/messaging/messages/:messageId/receipts", isAuthenticated, async (req: any, res) => {
    try {
      const { messageId } = req.params;
      
      const receipts = await storage.getMessageDeliveryReceipts(messageId);
      
      res.json({
        success: true,
        receipts,
        messageId
      });
    } catch (error) {
      console.error("Error fetching delivery receipts:", error);
      res.status(500).json({ error: "Failed to fetch delivery receipts" });
    }
  });

  // Database stats and monitoring
  app.get("/api/messaging/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's messaging statistics
      const conversations = await storage.getUserConversations(userId);
      const userKeys = await storage.getUserEncryptionKeys(userId);
      
      // Count total messages across all conversations
      let totalMessages = 0;
      for (const conv of conversations) {
        const messages = await storage.getConversationMessages(conv.id);
        totalMessages += messages.length;
      }
      
      res.json({
        success: true,
        stats: {
          totalConversations: conversations.length,
          totalMessages,
          hasEncryptionKeys: !!userKeys,
          keyType: userKeys?.keyType || null,
          keyActive: userKeys?.isActive || false,
          lastActivity: conversations[0]?.lastMessageAt || null
        }
      });
    } catch (error) {
      console.error("Error fetching messaging stats:", error);
      res.status(500).json({ error: "Failed to fetch messaging stats" });
    }
  });

  // Demo data seeding for testing
  app.post("/api/messaging/seed-demo-data", async (req, res) => {
    try {
      const { userId1 = 'demo-user-1', userId2 = 'demo-user-2' } = req.body;
      
      // Create demo conversation
      const conversation = await storage.createConversation({
        participant1Id: userId1,
        participant2Id: userId2,
        isEncrypted: true
      });
      
      // Create demo messages
      const demoMessages = [
        {
          conversationId: conversation.id,
          senderId: userId1,
          messageType: 'text' as const,
          encryptedContent: 'Hey! How are you doing? 🤘',
          initializationVector: 'demo-iv-1'
        },
        {
          conversationId: conversation.id,
          senderId: userId2,
          messageType: 'text' as const,
          encryptedContent: 'Great! Just listening to some metal. You?',
          initializationVector: 'demo-iv-2'
        },
        {
          conversationId: conversation.id,
          senderId: userId1,
          messageType: 'text' as const,
          encryptedContent: 'Same here! Did you catch that new album release?',
          initializationVector: 'demo-iv-3'
        }
      ];
      
      const createdMessages = [];
      for (const msgData of demoMessages) {
        const message = await storage.createDirectMessage(msgData);
        createdMessages.push(message);
      }
      
      // Update conversation last message time
      await storage.updateConversationLastMessage(conversation.id);
      
      res.json({
        success: true,
        message: "Demo data seeded successfully",
        data: {
          conversation,
          messages: createdMessages
        }
      });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ error: "Failed to seed demo data" });
    }
  });

  // Database health check
  app.get("/api/messaging/health", async (req, res) => {
    try {
      // Test basic database operations
      const testResults = {
        conversationRead: false,
        messageRead: false,
        encryptionKeysRead: false,
        timestamp: new Date().toISOString()
      };
      
      try {
        // Test conversation reading (just check if we can query)
        await storage.getUserConversations('test-user');
        testResults.conversationRead = true;
      } catch (error) {
        console.log('Conversation read test failed:', error);
      }
      
      try {
        // Test encryption keys reading
        await storage.getUserEncryptionKeys('test-user');
        testResults.encryptionKeysRead = true;
      } catch (error) {
        console.log('Encryption keys read test failed:', error);
      }
      
      const allHealthy = Object.values(testResults).every(
        (value, index) => index === 3 || value === true // Skip timestamp check
      );
      
      res.json({
        success: true,
        healthy: allHealthy,
        tests: testResults,
        message: allHealthy ? "All messaging database operations healthy" : "Some database operations failed"
      });
    } catch (error) {
      console.error("Database health check failed:", error);
      res.status(500).json({ 
        success: false,
        healthy: false,
        error: "Database health check failed" 
      });
    }
  });
}