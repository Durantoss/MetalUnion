import { Router } from 'express';
import { DoubleRatchetService } from './doubleRatchetService';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { userKeyBundles } from '@shared/schema';

const router = Router();

/**
 * Generate and store user's Double Ratchet key bundle
 * POST /api/encryption/setup-keys
 */
router.post('/setup-keys', async (req, res) => {
  try {
    const userId = (req.session as any)?.user?.id || 'demo-user';
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        error: 'Password required for key encryption' 
      });
    }

    // Check if user already has keys
    const existingKeys = await db.select()
      .from(userKeyBundles)
      .where(eq(userKeyBundles.userId, userId))
      .where(eq(userKeyBundles.isActive, true))
      .limit(1);

    if (existingKeys.length > 0) {
      return res.status(409).json({ 
        error: 'Key bundle already exists for this user' 
      });
    }

    // Generate new key bundle
    const { publicKeyBundle, keyBundleId } = await DoubleRatchetService.generateUserKeyBundle(
      userId, 
      password
    );

    res.json({
      success: true,
      keyBundleId,
      publicKeyBundle,
      message: 'Encryption keys generated and stored securely'
    });

  } catch (error) {
    console.error('Key setup error:', error);
    res.status(500).json({ 
      error: 'Failed to setup encryption keys',
      details: (error as Error).message
    });
  }
});

/**
 * Get user's public key bundle for key exchange
 * GET /api/encryption/public-keys/:userId
 */
router.get('/public-keys/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const keyBundle = await db.select()
      .from(userKeyBundles)
      .where(eq(userKeyBundles.userId, userId))
      .where(eq(userKeyBundles.isActive, true))
      .limit(1);

    if (!keyBundle.length) {
      return res.status(404).json({ 
        error: 'No encryption keys found for user' 
      });
    }

    const publicKeys = {
      identityKey: keyBundle[0].identityPublicKey,
      identityKeyX25519: keyBundle[0].identityPublicKeyX25519,
      signedPreKey: keyBundle[0].signedPreKeyPublic,
      signedPreKeySignature: keyBundle[0].signedPreKeySignature,
      ephemeralKey: keyBundle[0].ephemeralKeyPublic,
      keyBundleId: keyBundle[0].keyBundleId,
      expiresAt: keyBundle[0].expiresAt
    };

    res.json({
      userId,
      publicKeyBundle: publicKeys,
      success: true
    });

  } catch (error) {
    console.error('Public key fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch public keys' 
    });
  }
});

/**
 * Initialize encrypted conversation with another user
 * POST /api/encryption/init-conversation
 */
router.post('/init-conversation', async (req, res) => {
  try {
    const userId = (req.session as any)?.user?.id || 'demo-user';
    const { recipientUserId, conversationId, password } = req.body;

    if (!recipientUserId || !conversationId || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: recipientUserId, conversationId, password' 
      });
    }

    // Initialize conversation encryption
    await DoubleRatchetService.initializeConversation(
      userId,
      recipientUserId,
      conversationId,
      password
    );

    res.json({
      success: true,
      conversationId,
      message: 'Encrypted conversation initialized'
    });

  } catch (error) {
    console.error('Conversation init error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize encrypted conversation',
      details: (error as Error).message
    });
  }
});

/**
 * Get encrypted conversation status
 * GET /api/encryption/conversation/:conversationId/status
 */
router.get('/conversation/:conversationId/status', async (req, res) => {
  try {
    const userId = (req.session as any)?.user?.id || 'demo-user';
    const { conversationId } = req.params;

    // Check if user has encryption setup for this conversation
    const hasKeys = await db.select()
      .from(userKeyBundles)
      .where(eq(userKeyBundles.userId, userId))
      .where(eq(userKeyBundles.isActive, true))
      .limit(1);

    const status = {
      conversationId,
      userId,
      hasEncryptionKeys: hasKeys.length > 0,
      encryptionEnabled: hasKeys.length > 0,
      algorithm: 'Double Ratchet + Ed25519 + X25519 + AES-256'
    };

    res.json(status);

  } catch (error) {
    console.error('Conversation status error:', error);
    res.status(500).json({ 
      error: 'Failed to get conversation status' 
    });
  }
});

/**
 * Health check for encryption service
 * GET /api/encryption/health
 */
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      encryption: 'Double Ratchet Algorithm',
      signatures: 'Ed25519',
      keyExchange: 'X25519',
      symmetricCipher: 'AES-256-GCM',
      features: [
        'Perfect Forward Secrecy',
        'Future Secrecy', 
        'Message Authentication',
        'Metadata Protection'
      ]
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: (error as Error).message 
    });
  }
});

/**
 * Send encrypted message
 * POST /api/encryption/send-message
 */
router.post('/send-message', async (req, res) => {
  try {
    const userId = (req.session as any)?.user?.id || 'demo-user';
    const { conversationId, content, password } = req.body;

    if (!conversationId || !content || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: conversationId, content, password' 
      });
    }

    // Send encrypted message
    const encryptedMessage = await DoubleRatchetService.sendMessage(
      conversationId,
      userId,
      content,
      password
    );

    res.json({
      success: true,
      messageId: encryptedMessage.id,
      conversationId,
      timestamp: encryptedMessage.createdAt,
      encrypted: true
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      error: 'Failed to send encrypted message',
      details: (error as Error).message
    });
  }
});

/**
 * Decrypt and retrieve message
 * POST /api/encryption/decrypt-message
 */
router.post('/decrypt-message', async (req, res) => {
  try {
    const userId = (req.session as any)?.user?.id || 'demo-user';
    const { messageId, password } = req.body;

    if (!messageId || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: messageId, password' 
      });
    }

    // Decrypt message
    const decryptedContent = await DoubleRatchetService.decryptMessage(
      messageId,
      userId,
      password
    );

    res.json({
      success: true,
      messageId,
      content: decryptedContent,
      decrypted: true
    });

  } catch (error) {
    console.error('Decrypt message error:', error);
    res.status(500).json({ 
      error: 'Failed to decrypt message',
      details: (error as Error).message
    });
  }
});

/**
 * Get encrypted conversation history
 * GET /api/encryption/conversation/:conversationId/history
 */
router.get('/conversation/:conversationId/history', async (req, res) => {
  try {
    const userId = (req.session as any)?.user?.id || 'demo-user';
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // In a real implementation, you'd fetch encrypted messages from database
    // For demo, return mock encrypted message history
    const mockHistory = [
      {
        id: 'msg-1',
        conversationId,
        senderId: userId,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        encrypted: true,
        messageType: 'text',
        preview: '🔒 Encrypted message'
      },
      {
        id: 'msg-2', 
        conversationId,
        senderId: 'other-user',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        encrypted: true,
        messageType: 'text',
        preview: '🔒 Encrypted message'
      }
    ];

    res.json({
      success: true,
      conversationId,
      messages: mockHistory.slice(Number(offset), Number(offset) + Number(limit)),
      total: mockHistory.length,
      encrypted: true,
      algorithm: 'Double Ratchet + Ed25519 + X25519 + AES-256'
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversation history' 
    });
  }
});

export { router as doubleRatchetRoutes };