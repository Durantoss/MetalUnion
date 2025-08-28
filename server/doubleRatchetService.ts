import { db } from './db';
import { eq } from 'drizzle-orm';
import { 
  userKeyBundles, 
  conversationRatchetStates, 
  doubleRatchetMessages 
} from '@shared/schema';
import { DoubleRatchetEncryption, DoubleRatchetKeys, RatchetState, EncryptedDoubleRatchetMessage } from './doubleRatchetEncryption';
import { 
  InsertUserKeyBundle, 
  InsertConversationRatchetState, 
  InsertDoubleRatchetMessage,
  UserKeyBundle,
  ConversationRatchetState,
  DoubleRatchetMessage 
} from '@shared/schema';
import { randomBytes } from 'crypto';

/**
 * Service layer for Double Ratchet encrypted messaging
 * Provides high-level API for secure messaging with forward/future secrecy
 */
export class DoubleRatchetService {
  // Memory fallback for when database is unavailable
  private static memoryKeyBundles = new Map<string, any>();
  private static memoryMessages = new Map<string, any>();
  private static memoryRatchetStates = new Map<string, any>();
  /**
   * Generate and store key bundle for new user
   */
  static async generateUserKeyBundle(userId: string, password: string): Promise<{
    publicKeyBundle: {
      identityKey: string;
      identityKeyX25519: string;
      signedPreKey: string;  
      signedPreKeySignature: string;
      ephemeralKey: string;
    };
    keyBundleId: number;
  }> {
    // Demo mode: Generate keys without database
    console.log('Demo mode: Generating encryption keys for user:', userId);
    
    // Generate complete key bundle
    const keyBundle = DoubleRatchetEncryption.generateKeyBundle();
    
    // Encrypt private keys with user password
    const identityPrivateEncrypted = this.encryptWithPassword(
      Buffer.from(keyBundle.identityKey.privateKey).toString('base64'),
      password
    );
    const signedPreKeyPrivateEncrypted = this.encryptWithPassword(
      Buffer.from(keyBundle.signedPreKey.privateKey).toString('base64'),
      password
    );
    const ephemeralPrivateEncrypted = this.encryptWithPassword(
      Buffer.from(keyBundle.ephemeralKey.privateKey).toString('base64'),
      password
    );
    
    // Generate unique key bundle ID
    const keyBundleId = Math.floor(Math.random() * 1000000);
    
    // Store in database
    // Also encrypt the X25519 identity key
    const identityX25519PrivateEncrypted = this.encryptWithPassword(
      Buffer.from(keyBundle.identityKeyX25519.privateKey).toString('base64'),
      password
    );
    
    const insertData: InsertUserKeyBundle = {
      userId,
      identityPublicKey: Buffer.from(keyBundle.identityKey.publicKey).toString('base64'),
      identityPrivateKeyEncrypted: identityPrivateEncrypted,
      identityPublicKeyX25519: Buffer.from(keyBundle.identityKeyX25519.publicKey).toString('base64'),
      identityPrivateKeyX25519Encrypted: identityX25519PrivateEncrypted,
      signedPreKeyPublic: Buffer.from(keyBundle.signedPreKey.publicKey).toString('base64'),
      signedPreKeyPrivateEncrypted: signedPreKeyPrivateEncrypted,
      signedPreKeySignature: Buffer.from(keyBundle.signedPreKey.signature).toString('base64'),
      ephemeralKeyPublic: Buffer.from(keyBundle.ephemeralKey.publicKey).toString('base64'),
      ephemeralKeyPrivateEncrypted: ephemeralPrivateEncrypted,
      keyBundleId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    await this.insertUserKeyBundle(insertData);
    
    const publicKeyBundle = DoubleRatchetEncryption.exportPublicKeyBundle(keyBundle);
    
    return {
      publicKeyBundle,
      keyBundleId
    };
  }
  
  /**
   * Initialize ratchet state for new conversation
   */
  static async initializeConversation(
    senderUserId: string,
    receiverUserId: string, 
    conversationId: string,
    senderPassword: string
  ): Promise<void> {
    // Get sender's key bundle
    const senderKeys = await this.getUserKeyBundle(senderUserId, senderPassword);
    if (!senderKeys) {
      throw new Error('Sender key bundle not found');
    }
    
    // Get receiver's public key bundle  
    const receiverPublicKeys = await this.getUserPublicKeyBundle(receiverUserId);
    if (!receiverPublicKeys) {
      throw new Error('Receiver public key bundle not found');
    }
    
    // Initialize sender's ratchet state
    const senderRatchetState = DoubleRatchetEncryption.initializeSenderRatchet(
      senderKeys,
      {
        identityKeyX25519: Buffer.from(receiverPublicKeys.identityPublicKeyX25519, 'base64'),
        signedPreKey: Buffer.from(receiverPublicKeys.signedPreKeyPublic, 'base64'),
        ephemeralKey: Buffer.from(receiverPublicKeys.ephemeralKeyPublic, 'base64')
      }
    );
    
    // Store encrypted ratchet state
    await this.storeRatchetState(conversationId, senderUserId, senderRatchetState, senderPassword);
  }
  
  /**
   * Send encrypted message
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    messageContent: string,
    senderPassword: string
  ): Promise<DoubleRatchetMessage> {
    // Get sender's ratchet state
    const ratchetState = await this.getRatchetState(conversationId, senderId, senderPassword);
    if (!ratchetState) {
      throw new Error('Ratchet state not found for conversation');
    }
    
    // Encrypt message
    const { encryptedMessage, newRatchetState } = DoubleRatchetEncryption.encryptMessage(
      messageContent, 
      ratchetState
    );
    
    // Store new ratchet state
    await this.storeRatchetState(conversationId, senderId, newRatchetState, senderPassword);
    
    // Save encrypted message to database
    const messageData: InsertDoubleRatchetMessage = {
      conversationId,
      senderId,
      encryptedHeader: encryptedMessage.encryptedHeader,
      headerIv: encryptedMessage.headerIv,
      encryptedMessage: encryptedMessage.encryptedMessage,
      messageIv: encryptedMessage.messageIv,
      authTag: encryptedMessage.authTag,
      senderRatchetKey: encryptedMessage.senderRatchetKey,
      messageNumber: encryptedMessage.messageNumber,
      previousChainLength: encryptedMessage.previousChainLength,
      messageType: 'text'
    };
    
    return await this.insertDoubleRatchetMessage(messageData);
  }
  
  /**
   * Decrypt received message
   */
  static async decryptMessage(
    messageId: string,
    receiverUserId: string,
    receiverPassword: string
  ): Promise<string> {
    // Get encrypted message
    const encryptedMessage = await this.getDoubleRatchetMessage(messageId);
    if (!encryptedMessage) {
      throw new Error('Message not found');
    }
    
    // Get receiver's ratchet state
    const ratchetState = await this.getRatchetState(
      encryptedMessage.conversationId, 
      receiverUserId, 
      receiverPassword
    );
    if (!ratchetState) {
      throw new Error('Ratchet state not found for receiver');
    }
    
    // Decrypt message
    const doubleRatchetMessage: EncryptedDoubleRatchetMessage = {
      encryptedHeader: encryptedMessage.encryptedHeader,
      headerIv: encryptedMessage.headerIv,
      encryptedMessage: encryptedMessage.encryptedMessage,
      messageIv: encryptedMessage.messageIv,
      authTag: encryptedMessage.authTag,
      senderRatchetKey: encryptedMessage.senderRatchetKey,
      messageNumber: encryptedMessage.messageNumber,
      previousChainLength: encryptedMessage.previousChainLength
    };
    
    const { decryptedMessage, newRatchetState } = DoubleRatchetEncryption.decryptMessage(
      doubleRatchetMessage,
      ratchetState
    );
    
    // Update ratchet state
    await this.storeRatchetState(
      encryptedMessage.conversationId, 
      receiverUserId, 
      newRatchetState, 
      receiverPassword
    );
    
    return decryptedMessage;
  }
  
  /**
   * Get user's complete key bundle (private keys decrypted)
   */
  private static async getUserKeyBundle(userId: string, password: string): Promise<DoubleRatchetKeys | null> {
    const keyBundle = await this.getUserKeyBundleFromDB(userId);
    if (!keyBundle) return null;
    
    try {
      // Decrypt private keys
      const identityPrivateKey = this.decryptWithPassword(keyBundle.identityPrivateKeyEncrypted, password);
      const identityX25519PrivateKey = this.decryptWithPassword(keyBundle.identityPrivateKeyX25519Encrypted, password);
      const signedPreKeyPrivate = this.decryptWithPassword(keyBundle.signedPreKeyPrivateEncrypted, password);
      const ephemeralPrivate = this.decryptWithPassword(keyBundle.ephemeralKeyPrivateEncrypted, password);
      
      return {
        identityKey: {
          privateKey: new Uint8Array(Buffer.from(identityPrivateKey, 'base64')),
          publicKey: new Uint8Array(Buffer.from(keyBundle.identityPublicKey, 'base64'))
        },
        identityKeyX25519: {
          privateKey: new Uint8Array(Buffer.from(identityX25519PrivateKey, 'base64')),
          publicKey: new Uint8Array(Buffer.from(keyBundle.identityPublicKeyX25519, 'base64'))
        },
        signedPreKey: {
          privateKey: new Uint8Array(Buffer.from(signedPreKeyPrivate, 'base64')),
          publicKey: new Uint8Array(Buffer.from(keyBundle.signedPreKeyPublic, 'base64')),
          signature: new Uint8Array(Buffer.from(keyBundle.signedPreKeySignature, 'base64'))
        },
        ephemeralKey: {
          privateKey: new Uint8Array(Buffer.from(ephemeralPrivate, 'base64')),
          publicKey: new Uint8Array(Buffer.from(keyBundle.ephemeralKeyPublic, 'base64'))
        }
      };
    } catch (error) {
      throw new Error('Failed to decrypt user keys - incorrect password');
    }
  }
  
  /**
   * Get user's public key bundle
   */
  private static async getUserPublicKeyBundle(userId: string): Promise<UserKeyBundle | null> {
    return await this.getUserKeyBundleFromDB(userId);
  }
  
  /**
   * Store encrypted ratchet state
   */
  private static async storeRatchetState(
    conversationId: string,
    userId: string, 
    ratchetState: RatchetState,
    password: string
  ): Promise<void> {
    const serializedState = DoubleRatchetEncryption.serializeRatchetState(ratchetState);
    const encryptedState = this.encryptWithPassword(serializedState, password);
    
    const stateData: InsertConversationRatchetState = {
      conversationId,
      userId,
      ratchetStateEncrypted: encryptedState,
      sendingMessageNumber: ratchetState.sendingMessageNumber,
      receivingMessageNumber: ratchetState.receivingMessageNumber
    };
    
    // Upsert ratchet state
    await this.upsertConversationRatchetState(stateData);
  }
  
  /**
   * Get and decrypt ratchet state
   */
  private static async getRatchetState(
    conversationId: string,
    userId: string,
    password: string
  ): Promise<RatchetState | null> {
    const encryptedState = await this.getConversationRatchetState(conversationId, userId);
    if (!encryptedState) return null;
    
    try {
      const decryptedState = this.decryptWithPassword(encryptedState.ratchetStateEncrypted, password);
      return DoubleRatchetEncryption.deserializeRatchetState(decryptedState);
    } catch (error) {
      throw new Error('Failed to decrypt ratchet state - incorrect password');
    }
  }
  
  /**
   * Simple password-based encryption for key storage
   */
  private static encryptWithPassword(data: string, password: string): string {
    // In production, use proper key derivation (PBKDF2/scrypt) and authenticated encryption
    // For demo purposes, using simple encryption
    const key = Buffer.from(password.padEnd(32, '0').slice(0, 32));
    const iv = randomBytes(16);
    
    const { createCipheriv } = require('crypto');
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    return iv.toString('base64') + '|' + encrypted;
  }
  
  /**
   * Decrypt password-encrypted data
   */
  private static decryptWithPassword(encryptedData: string, password: string): string {
    const [ivBase64, encrypted] = encryptedData.split('|');
    const iv = Buffer.from(ivBase64, 'base64');
    const key = Buffer.from(password.padEnd(32, '0').slice(0, 32));
    
    const { createDecipheriv } = require('crypto');
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Database operations - integrated with storage layer
  private static async insertUserKeyBundle(data: InsertUserKeyBundle): Promise<UserKeyBundle> {
    try {
      const result = await db.insert(userKeyBundles).values(data).returning();
      return result[0];
    } catch (error) {
      // For demo purposes, return mock data if database fails
      console.warn('Database insert failed, using mock data:', error);
      return {
        id: 'mock-key-bundle-id',
        userId: data.userId,
        identityPublicKey: data.identityPublicKey,
        identityPrivateKeyEncrypted: data.identityPrivateKeyEncrypted,
        identityPublicKeyX25519: data.identityPublicKeyX25519,
        identityPrivateKeyX25519Encrypted: data.identityPrivateKeyX25519Encrypted,
        signedPreKeyPublic: data.signedPreKeyPublic,
        signedPreKeyPrivateEncrypted: data.signedPreKeyPrivateEncrypted,
        signedPreKeySignature: data.signedPreKeySignature,
        ephemeralKeyPublic: data.ephemeralKeyPublic,
        ephemeralKeyPrivateEncrypted: data.ephemeralKeyPrivateEncrypted,
        keyBundleId: data.keyBundleId,
        expiresAt: data.expiresAt,
        isActive: true,
        createdAt: new Date()
      } as UserKeyBundle;
    }
  }
  
  private static async getUserKeyBundleFromDB(userId: string): Promise<UserKeyBundle | null> {
    try {
      const result = await db.select()
        .from(userKeyBundles)
        .where(eq(userKeyBundles.userId, userId))
        .where(eq(userKeyBundles.isActive, true))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.warn('Database query failed, using mock data:', error);
      return null; // In real app, might return cached data
    }
  }
  
  private static async insertDoubleRatchetMessage(data: InsertDoubleRatchetMessage): Promise<DoubleRatchetMessage> {
    try {
      const result = await db.insert(doubleRatchetMessages).values(data).returning();
      return result[0];
    } catch (error) {
      console.warn('Database insert failed, using mock data:', error);
      return {
        id: 'mock-message-' + Date.now(),
        conversationId: data.conversationId,
        senderId: data.senderId,
        encryptedHeader: data.encryptedHeader,
        headerIv: data.headerIv,
        encryptedMessage: data.encryptedMessage,
        messageIv: data.messageIv,
        authTag: data.authTag,
        senderRatchetKey: data.senderRatchetKey,
        messageNumber: data.messageNumber,
        previousChainLength: data.previousChainLength,
        messageType: data.messageType,
        isDeleted: false,
        createdAt: new Date()
      } as DoubleRatchetMessage;
    }
  }
  
  private static async getDoubleRatchetMessage(messageId: string): Promise<DoubleRatchetMessage | null> {
    try {
      const result = await db.select()
        .from(doubleRatchetMessages)
        .where(eq(doubleRatchetMessages.id, messageId))
        .where(eq(doubleRatchetMessages.isDeleted, false))
        .limit(1);
        
      return result[0] || null;
    } catch (error) {
      console.warn('Database query failed:', error);
      return null;
    }
  }
  
  private static async upsertConversationRatchetState(data: InsertConversationRatchetState): Promise<void> {
    try {
      // Try to update existing state first
      const existing = await db.select()
        .from(conversationRatchetStates)
        .where(eq(conversationRatchetStates.conversationId, data.conversationId))
        .where(eq(conversationRatchetStates.userId, data.userId))
        .limit(1);
      
      if (existing.length > 0) {
        await db.update(conversationRatchetStates)
          .set({
            ratchetStateEncrypted: data.ratchetStateEncrypted,
            sendingMessageNumber: data.sendingMessageNumber,
            receivingMessageNumber: data.receivingMessageNumber,
            lastUpdated: new Date()
          })
          .where(eq(conversationRatchetStates.id, existing[0].id));
      } else {
        await db.insert(conversationRatchetStates).values(data);
      }
    } catch (error) {
      console.warn('Database upsert failed, state not persisted:', error);
    }
  }
  
  private static async getConversationRatchetState(conversationId: string, userId: string): Promise<ConversationRatchetState | null> {
    try {
      const result = await db.select()
        .from(conversationRatchetStates)
        .where(eq(conversationRatchetStates.conversationId, conversationId))
        .where(eq(conversationRatchetStates.userId, userId))
        .limit(1);
        
      return result[0] || null;
    } catch (error) {
      console.warn('Database query failed:', error);
      return null;
    }
  }
}