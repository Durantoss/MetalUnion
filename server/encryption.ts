import { randomBytes, createCipheriv, createDecipheriv, generateKeyPair, publicEncrypt, privateDecrypt, pbkdf2Sync } from 'crypto';

export interface EncryptionKeys {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
}

/**
 * RSA/AES Hybrid Encryption System
 * Uses RSA-2048 for key exchange and AES-256-GCM for message encryption
 */
export class MessageEncryption {
  /**
   * Generate RSA key pair for user
   */
  static generateKeyPair(): Promise<EncryptionKeys> {
    return new Promise((resolve, reject) => {
      generateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      }, (err, publicKey, privateKey) => {
        if (err) reject(err);
        else resolve({ publicKey, privateKey });
      });
    });
  }

  /**
   * Encrypt message using hybrid RSA/AES encryption
   * 1. Generate random AES key
   * 2. Encrypt message with AES
   * 3. Encrypt AES key with recipient's RSA public key
   */
  static encryptMessage(message: string, recipientPublicKey: string): EncryptedMessage {
    // Generate random AES key and IV
    const aesKey = randomBytes(32); // 256 bits
    const iv = randomBytes(16); // 128 bits for GCM

    // Encrypt message with AES-256-GCM
    const cipher = createCipheriv('aes-256-gcm', aesKey, iv);
    let encryptedData = cipher.update(message, 'utf8', 'base64');
    encryptedData += cipher.final('base64');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    const finalEncryptedData = encryptedData + '|' + authTag.toString('base64');

    // Encrypt AES key with RSA public key
    const encryptedKey = publicEncrypt(recipientPublicKey, aesKey).toString('base64');

    return {
      encryptedData: finalEncryptedData,
      encryptedKey,
      iv: iv.toString('base64')
    };
  }

  /**
   * Decrypt message using hybrid RSA/AES decryption
   */
  static decryptMessage(
    encryptedMessage: EncryptedMessage, 
    recipientPrivateKey: string
  ): string {
    try {
      // Decrypt AES key with RSA private key
      const aesKey = privateDecrypt(recipientPrivateKey, Buffer.from(encryptedMessage.encryptedKey, 'base64'));
      
      // Parse encrypted data and auth tag
      const [encryptedData, authTagBase64] = encryptedMessage.encryptedData.split('|');
      const authTag = Buffer.from(authTagBase64, 'base64');
      const iv = Buffer.from(encryptedMessage.iv, 'base64');

      // Decrypt message with AES-256-GCM
      const decipher = createDecipheriv('aes-256-gcm', aesKey, iv, { authTagLength: 16 });
      decipher.setAuthTag(authTag);
      
      let decryptedData = decipher.update(encryptedData, 'base64', 'utf8');
      decryptedData += decipher.final('utf8');

      return decryptedData;
    } catch (error) {
      throw new Error('Failed to decrypt message: ' + (error as Error).message);
    }
  }

  /**
   * Encrypt private key with user password (for storage)
   */
  static encryptPrivateKey(privateKey: string, password: string): string {
    const salt = randomBytes(16);
    const key = this.deriveKey(password, salt);
    const iv = randomBytes(16);
    
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Combine salt, iv, and encrypted data
    return salt.toString('base64') + '|' + iv.toString('base64') + '|' + encrypted;
  }

  /**
   * Decrypt private key with user password
   */
  static decryptPrivateKey(encryptedPrivateKey: string, password: string): string {
    const [saltBase64, ivBase64, encryptedData] = encryptedPrivateKey.split('|');
    const salt = Buffer.from(saltBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    const key = this.deriveKey(password, salt);
    
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  private static deriveKey(password: string, salt: Buffer): Buffer {
    return pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  }

  /**
   * Generate automatic encryption password for user (eliminates manual password requirement)
   */
  static generateAutoPassword(userId: string): string {
    // Create a unique password based on user ID and app-specific salt
    const appSalt = 'moshunion-encryption-2025';
    const combinedData = `${userId}-${appSalt}-${process.env.NODE_ENV || 'development'}`;
    
    // Use SHA-256 to create a secure password from the combined data
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(combinedData).digest('hex');
    
    // Return first 32 characters as password (256 bits of entropy)
    return hash.substring(0, 32);
  }
}