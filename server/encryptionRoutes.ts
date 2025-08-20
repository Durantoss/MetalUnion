import type { Express } from "express";
import { storage } from "./storage";
import { MessageEncryption } from "./encryption";
// Demo-compatible authentication middleware for encryption routes
const isDemoAuthenticated = (req: any, res: any, next: any) => {
  // Create demo user structure that matches what encryption routes expect
  if (!req.user) {
    req.user = {
      claims: {
        sub: 'demo-user-testing', // Demo user ID
        email: 'tester@moshunion.com',
        first_name: 'Demo',
        last_name: 'Tester'
      }
    };
  }
  if (!req.session) {
    req.session = {
      userId: 'demo-user-testing'
    };
  }
  next();
};

/**
 * Complete Encryption Examples for Secured Messaging
 * Demonstrates end-to-end encryption capabilities
 */
export function registerEncryptionRoutes(app: Express) {
  
  // Generate encryption keys for a user
  app.post("/api/messaging/generate-keys", isDemoAuthenticated, async (req: any, res) => {
    try {
      // Handle both demo mode and real authentication
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      // Generate new RSA key pair
      const keys = await MessageEncryption.generateKeyPair();
      
      // Store keys in database
      const encryptionKeys = await storage.createUserEncryptionKeys({
        userId,
        publicKey: keys.publicKey,
        privateKeyEncrypted: keys.privateKey, // In production, encrypt this with user password
        keyType: 'rsa',
        isActive: true
      });
      
      res.json({
        success: true,
        keys: {
          id: encryptionKeys.id,
          publicKey: encryptionKeys.publicKey,
          keyType: encryptionKeys.keyType,
          isActive: encryptionKeys.isActive
        }
      });
    } catch (error) {
      console.error("Key generation error:", error);
      res.status(500).json({ error: "Failed to generate encryption keys" });
    }
  });

  // Test encryption/decryption workflow
  app.post("/api/messaging/test-encryption", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { message, recipientUserId } = req.body;
      // Handle both demo mode and real authentication
      const senderId = req.user?.claims?.sub || req.session?.userId;
      
      // Get recipient's public key
      const recipientKeys = await storage.getUserEncryptionKeys(recipientUserId);
      if (!recipientKeys) {
        return res.status(404).json({ error: "Recipient encryption keys not found" });
      }
      
      // Encrypt the message
      const encryptedMessage = MessageEncryption.encryptMessage(message, recipientKeys.publicKey);
      
      // Get sender's private key for decryption test
      const senderKeys = await storage.getUserEncryptionKeys(senderId);
      let decryptedMessage = null;
      
      if (senderKeys) {
        try {
          // Test decryption (in real scenario, recipient would decrypt)
          decryptedMessage = MessageEncryption.decryptMessage(encryptedMessage, senderKeys.privateKeyEncrypted);
        } catch (decryptError) {
          console.log("Decryption test skipped - keys may be different");
        }
      }
      
      res.json({
        success: true,
        original: message,
        encrypted: {
          encryptedData: encryptedMessage.encryptedData.substring(0, 100) + "...", // Truncated for display
          encryptedKey: encryptedMessage.encryptedKey.substring(0, 100) + "...",
          iv: encryptedMessage.iv
        },
        decrypted: decryptedMessage,
        timestamp: new Date().toISOString(),
        encryptionMethod: "RSA-2048 + AES-256-GCM"
      });
    } catch (error) {
      console.error("Encryption test error:", error);
      res.status(500).json({ error: "Encryption test failed" });
    }
  });

  // Get user's encryption keys
  app.get("/api/messaging/encryption-keys", isDemoAuthenticated, async (req: any, res) => {
    try {
      // Handle both demo mode and real authentication
      const userId = req.user?.claims?.sub || req.session?.userId;
      const keys = await storage.getUserEncryptionKeys(userId);
      
      if (!keys) {
        return res.status(404).json({ error: "No encryption keys found" });
      }
      
      // Only return public key and metadata (never private key)
      res.json({
        id: keys.id,
        publicKey: keys.publicKey,
        keyType: keys.keyType,
        isActive: keys.isActive,
        createdAt: keys.createdAt
      });
    } catch (error) {
      console.error("Key retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve encryption keys" });
    }
  });

  // Rotate encryption keys
  app.post("/api/messaging/rotate-keys", isDemoAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.userId;
      
      // Mark old keys as inactive
      await storage.updateUserEncryptionKeys(userId, { isActive: false });
      
      // Generate new keys
      const newKeys = await MessageEncryption.generateKeyPair();
      
      // Store new keys
      const encryptionKeys = await storage.createUserEncryptionKeys({
        userId,
        publicKey: newKeys.publicKey,
        privateKeyEncrypted: newKeys.privateKey,
        keyType: 'rsa',
        isActive: true
      });
      
      res.json({
        success: true,
        message: "Encryption keys rotated successfully",
        newKeyId: encryptionKeys.id
      });
    } catch (error) {
      console.error("Key rotation error:", error);
      res.status(500).json({ error: "Failed to rotate encryption keys" });
    }
  });

  // Complete encryption workflow demonstration
  app.post("/api/messaging/encryption-demo", async (req, res) => {
    try {
      const { message } = req.body;
      
      // Generate demo key pairs for sender and recipient
      const senderKeys = await MessageEncryption.generateKeyPair();
      const recipientKeys = await MessageEncryption.generateKeyPair();
      
      // Encrypt message with recipient's public key
      const encryptedMessage = MessageEncryption.encryptMessage(message, recipientKeys.publicKey);
      
      // Decrypt message with recipient's private key
      const decryptedMessage = MessageEncryption.decryptMessage(encryptedMessage, recipientKeys.privateKey);
      
      res.json({
        success: true,
        demo: {
          originalMessage: message,
          senderPublicKey: senderKeys.publicKey.substring(0, 100) + "...",
          recipientPublicKey: recipientKeys.publicKey.substring(0, 100) + "...",
          encryptedData: encryptedMessage.encryptedData.substring(0, 100) + "...",
          encryptedKey: encryptedMessage.encryptedKey.substring(0, 100) + "...",
          initializationVector: encryptedMessage.iv,
          decryptedMessage: decryptedMessage,
          encryptionMethod: "RSA-2048 + AES-256-GCM",
          verified: message === decryptedMessage
        }
      });
    } catch (error) {
      console.error("Encryption demo error:", error);
      res.status(500).json({ error: "Encryption demonstration failed" });
    }
  });
}