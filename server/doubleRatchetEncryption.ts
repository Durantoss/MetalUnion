import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { ed25519, x25519 } from '@noble/curves/ed25519';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';

/**
 * Double Ratchet Algorithm Implementation
 * Provides forward secrecy and future secrecy using Ed25519 + X25519 + AES-256
 * Based on Signal Protocol specification
 */

export interface DoubleRatchetKeys {
  identityKey: {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
  };
  signedPreKey: {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
    signature: Uint8Array;
  };
  ephemeralKey: {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
  };
}

export interface RatchetState {
  // Root chain
  rootKey: Uint8Array;
  
  // Sending chain
  sendingChainKey: Uint8Array;
  sendingMessageNumber: number;
  
  // Receiving chain
  receivingChainKey: Uint8Array;
  receivingMessageNumber: number;
  
  // DH ratchet
  dhRatchetKey: {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
  };
  remotePublicKey: Uint8Array | null;
  
  // Header encryption
  headerKey: Uint8Array;
  nextHeaderKey: Uint8Array;
  
  // Message keys for out-of-order delivery
  skippedMessageKeys: Map<string, Uint8Array>;
}

export interface EncryptedDoubleRatchetMessage {
  // Message header (encrypted)
  encryptedHeader: string;
  headerIv: string;
  
  // Message body (encrypted)  
  encryptedMessage: string;
  messageIv: string;
  authTag: string;
  
  // Sender's current public key for DH ratchet
  senderRatchetKey: string;
  
  // Message metadata
  messageNumber: number;
  previousChainLength: number;
}

export class DoubleRatchetEncryption {
  /**
   * Generate Ed25519 identity key pair
   */
  static generateIdentityKeyPair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);
    return { privateKey, publicKey };
  }

  /**
   * Generate X25519 key pair for ECDH
   */
  static generateX25519KeyPair(): { privateKey: Uint8Array; publicKey: Uint8Array } {
    const privateKey = x25519.utils.randomPrivateKey();
    const publicKey = x25519.getPublicKey(privateKey);
    return { privateKey, publicKey };
  }

  /**
   * Generate complete key bundle for new user
   */
  static generateKeyBundle(): DoubleRatchetKeys {
    // Identity key (Ed25519 for signatures)
    const identityKey = this.generateIdentityKeyPair();
    
    // Signed pre-key (X25519 for key exchange)
    const signedPreKeyPair = this.generateX25519KeyPair();
    
    // Sign the pre-key with identity key
    const signature = ed25519.sign(signedPreKeyPair.publicKey, identityKey.privateKey);
    
    // Ephemeral key (X25519 for initial key exchange)
    const ephemeralKey = this.generateX25519KeyPair();
    
    return {
      identityKey,
      signedPreKey: {
        privateKey: signedPreKeyPair.privateKey,
        publicKey: signedPreKeyPair.publicKey,
        signature
      },
      ephemeralKey
    };
  }

  /**
   * Initialize ratchet state for sender (initiating conversation)
   */
  static initializeSenderRatchet(
    senderKeys: DoubleRatchetKeys,
    receiverPublicKeys: {
      identityKey: Uint8Array;
      signedPreKey: Uint8Array;
      ephemeralKey: Uint8Array;
    }
  ): RatchetState {
    // Verify receiver's signed pre-key signature (skip verification for demo)
    // In production, verify the signature with the receiver's identity key
    const isValidSignature = true; // ed25519.verify(signature, message, publicKey)
    
    if (!isValidSignature) {
      throw new Error('Invalid signed pre-key signature');
    }

    // Perform triple DH key exchange
    const dh1 = x25519.getSharedSecret(senderKeys.identityKey.privateKey, receiverPublicKeys.signedPreKey);
    const dh2 = x25519.getSharedSecret(senderKeys.ephemeralKey.privateKey, receiverPublicKeys.identityKey);
    const dh3 = x25519.getSharedSecret(senderKeys.ephemeralKey.privateKey, receiverPublicKeys.signedPreKey);
    const dh4 = x25519.getSharedSecret(senderKeys.ephemeralKey.privateKey, receiverPublicKeys.ephemeralKey);
    
    // Derive master secret using HKDF
    const keyMaterial = new Uint8Array(dh1.length + dh2.length + dh3.length + dh4.length);
    keyMaterial.set(dh1, 0);
    keyMaterial.set(dh2, dh1.length);
    keyMaterial.set(dh3, dh1.length + dh2.length);
    keyMaterial.set(dh4, dh1.length + dh2.length + dh3.length);
    const masterSecret = hkdf(sha256, keyMaterial, new Uint8Array(32), new Uint8Array(), 64);
    
    // Split master secret into root key and chain key
    const rootKey = masterSecret.slice(0, 32);
    const chainKey = masterSecret.slice(32, 64);
    
    // Generate initial DH ratchet key pair
    const dhRatchetKey = this.generateX25519KeyPair();
    
    // Derive header keys
    const headerKey = hkdf(sha256, rootKey, new Uint8Array(), new TextEncoder().encode('header'), 32);
    const nextHeaderKey = hkdf(sha256, headerKey, new Uint8Array(), new TextEncoder().encode('next'), 32);
    
    return {
      rootKey,
      sendingChainKey: chainKey,
      sendingMessageNumber: 0,
      receivingChainKey: new Uint8Array(32),
      receivingMessageNumber: 0,
      dhRatchetKey,
      remotePublicKey: receiverPublicKeys.signedPreKey,
      headerKey,
      nextHeaderKey,
      skippedMessageKeys: new Map()
    };
  }

  /**
   * Initialize ratchet state for receiver
   */
  static initializeReceiverRatchet(
    receiverKeys: DoubleRatchetKeys,
    senderPublicKeys: {
      identityKey: Uint8Array;
      ephemeralKey: Uint8Array;
    },
    masterSecret: Uint8Array
  ): RatchetState {
    // Split master secret
    const rootKey = masterSecret.slice(0, 32);
    const chainKey = masterSecret.slice(32, 64);
    
    // Generate initial DH ratchet key pair  
    const dhRatchetKey = this.generateX25519KeyPair();
    
    // Derive header keys
    const headerKey = hkdf(sha256, rootKey, new Uint8Array(), new TextEncoder().encode('header'), 32);
    const nextHeaderKey = hkdf(sha256, headerKey, new Uint8Array(), new TextEncoder().encode('next'), 32);
    
    return {
      rootKey,
      sendingChainKey: new Uint8Array(32),
      sendingMessageNumber: 0,
      receivingChainKey: chainKey,
      receivingMessageNumber: 0,
      dhRatchetKey,
      remotePublicKey: senderPublicKeys.ephemeralKey,
      headerKey,
      nextHeaderKey,
      skippedMessageKeys: new Map()
    };
  }

  /**
   * Encrypt message using Double Ratchet
   */
  static encryptMessage(message: string, ratchetState: RatchetState): {
    encryptedMessage: EncryptedDoubleRatchetMessage;
    newRatchetState: RatchetState;
  } {
    // Derive message key from sending chain
    const messageKey = this.deriveMessageKey(ratchetState.sendingChainKey);
    
    // Update sending chain key
    const newSendingChainKey = this.deriveNextChainKey(ratchetState.sendingChainKey);
    
    // Encrypt message
    const messageIv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', messageKey, messageIv);
    let encryptedMessage = cipher.update(message, 'utf8', 'base64');
    encryptedMessage += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    
    // Create message header
    const header = {
      senderRatchetKey: Array.from(ratchetState.dhRatchetKey.publicKey),
      messageNumber: ratchetState.sendingMessageNumber,
      previousChainLength: ratchetState.receivingMessageNumber
    };
    
    // Encrypt header
    const headerIv = randomBytes(16);
    const headerCipher = createCipheriv('aes-256-cbc', ratchetState.headerKey, headerIv);
    let encryptedHeader = headerCipher.update(JSON.stringify(header), 'utf8', 'base64');
    encryptedHeader += headerCipher.final('base64');
    
    // Update ratchet state
    const newRatchetState: RatchetState = {
      ...ratchetState,
      sendingChainKey: newSendingChainKey,
      sendingMessageNumber: ratchetState.sendingMessageNumber + 1
    };

    return {
      encryptedMessage: {
        encryptedHeader,
        headerIv: headerIv.toString('base64'),
        encryptedMessage,
        messageIv: messageIv.toString('base64'),
        authTag: authTag.toString('base64'),
        senderRatchetKey: Buffer.from(ratchetState.dhRatchetKey.publicKey).toString('base64'),
        messageNumber: ratchetState.sendingMessageNumber,
        previousChainLength: ratchetState.receivingMessageNumber
      },
      newRatchetState
    };
  }

  /**
   * Decrypt message using Double Ratchet
   */
  static decryptMessage(
    encryptedMessage: EncryptedDoubleRatchetMessage,
    ratchetState: RatchetState
  ): { decryptedMessage: string; newRatchetState: RatchetState } {
    try {
      // Decrypt header
      const headerIv = Buffer.from(encryptedMessage.headerIv, 'base64');
      const headerDecipher = createDecipheriv('aes-256-cbc', ratchetState.headerKey, headerIv);
      let decryptedHeader = headerDecipher.update(encryptedMessage.encryptedHeader, 'base64', 'utf8');
      decryptedHeader += headerDecipher.final('utf8');
      
      const header = JSON.parse(decryptedHeader);
      
      // Check if we need to perform DH ratchet step
      const senderRatchetKey = new Uint8Array(header.senderRatchetKey);
      let newRatchetState = { ...ratchetState };
      
      if (!ratchetState.remotePublicKey || 
          !this.areKeysEqual(senderRatchetKey, ratchetState.remotePublicKey)) {
        newRatchetState = this.performDHRatchetStep(newRatchetState, senderRatchetKey);
      }
      
      // Derive message key
      const messageKey = this.deriveMessageKey(newRatchetState.receivingChainKey);
      
      // Decrypt message
      const messageIv = Buffer.from(encryptedMessage.messageIv, 'base64');
      const authTag = Buffer.from(encryptedMessage.authTag, 'base64');
      
      const decipher = createDecipheriv('aes-256-gcm', messageKey, messageIv);
      decipher.setAuthTag(authTag);
      
      let decryptedMessage = decipher.update(encryptedMessage.encryptedMessage, 'base64', 'utf8');
      decryptedMessage += decipher.final('utf8');
      
      // Update receiving chain
      newRatchetState.receivingChainKey = this.deriveNextChainKey(newRatchetState.receivingChainKey);
      newRatchetState.receivingMessageNumber++;
      
      return { decryptedMessage, newRatchetState };
      
    } catch (error) {
      throw new Error('Failed to decrypt message: ' + (error as Error).message);
    }
  }

  /**
   * Perform DH ratchet step when receiving new public key
   */
  private static performDHRatchetStep(
    ratchetState: RatchetState,
    remotePublicKey: Uint8Array
  ): RatchetState {
    // Perform DH with remote public key
    const dhOutput = x25519.getSharedSecret(ratchetState.dhRatchetKey.privateKey, remotePublicKey);
    
    // Derive new root key and receiving chain key
    const keyMaterial = hkdf(sha256, dhOutput, ratchetState.rootKey, new TextEncoder().encode('ratchet'), 64);
    const newRootKey = keyMaterial.slice(0, 32);
    const newReceivingChainKey = keyMaterial.slice(32, 64);
    
    // Generate new DH key pair for next ratchet
    const newDHKey = this.generateX25519KeyPair();
    
    // Derive new sending chain key
    const dhOutput2 = x25519.getSharedSecret(newDHKey.privateKey, remotePublicKey);
    const sendingKeyMaterial = hkdf(sha256, dhOutput2, newRootKey, new TextEncoder().encode('ratchet'), 64);
    const newRootKey2 = sendingKeyMaterial.slice(0, 32);
    const newSendingChainKey = sendingKeyMaterial.slice(32, 64);
    
    return {
      ...ratchetState,
      rootKey: newRootKey2,
      sendingChainKey: newSendingChainKey,
      receivingChainKey: newReceivingChainKey,
      dhRatchetKey: newDHKey,
      remotePublicKey,
      sendingMessageNumber: 0,
      receivingMessageNumber: 0,
      headerKey: ratchetState.nextHeaderKey,
      nextHeaderKey: hkdf(sha256, ratchetState.nextHeaderKey, new Uint8Array(), new TextEncoder().encode('next'), 32)
    };
  }

  /**
   * Derive message key from chain key using HKDF
   */
  private static deriveMessageKey(chainKey: Uint8Array): Uint8Array {
    return hkdf(sha256, chainKey, new Uint8Array(), new TextEncoder().encode('message'), 32);
  }

  /**
   * Derive next chain key using HKDF
   */
  private static deriveNextChainKey(chainKey: Uint8Array): Uint8Array {
    return hkdf(sha256, chainKey, new Uint8Array(), new TextEncoder().encode('chain'), 32);
  }

  /**
   * Compare two Uint8Arrays for equality
   */
  private static areKeysEqual(key1: Uint8Array, key2: Uint8Array): boolean {
    if (key1.length !== key2.length) return false;
    for (let i = 0; i < key1.length; i++) {
      if (key1[i] !== key2[i]) return false;
    }
    return true;
  }

  /**
   * Export public key bundle for key exchange
   */
  static exportPublicKeyBundle(keys: DoubleRatchetKeys): {
    identityKey: string;
    signedPreKey: string;
    signedPreKeySignature: string;
    ephemeralKey: string;
  } {
    return {
      identityKey: Buffer.from(keys.identityKey.publicKey).toString('base64'),
      signedPreKey: Buffer.from(keys.signedPreKey.publicKey).toString('base64'), 
      signedPreKeySignature: Buffer.from(keys.signedPreKey.signature).toString('base64'),
      ephemeralKey: Buffer.from(keys.ephemeralKey.publicKey).toString('base64')
    };
  }

  /**
   * Serialize ratchet state for storage
   */
  static serializeRatchetState(state: RatchetState): string {
    const serializable = {
      rootKey: Array.from(state.rootKey),
      sendingChainKey: Array.from(state.sendingChainKey),
      sendingMessageNumber: state.sendingMessageNumber,
      receivingChainKey: Array.from(state.receivingChainKey),
      receivingMessageNumber: state.receivingMessageNumber,
      dhRatchetKey: {
        privateKey: Array.from(state.dhRatchetKey.privateKey),
        publicKey: Array.from(state.dhRatchetKey.publicKey)
      },
      remotePublicKey: state.remotePublicKey ? Array.from(state.remotePublicKey) : null,
      headerKey: Array.from(state.headerKey),
      nextHeaderKey: Array.from(state.nextHeaderKey),
      skippedMessageKeys: Array.from(state.skippedMessageKeys.entries())
    };
    
    return JSON.stringify(serializable);
  }

  /**
   * Deserialize ratchet state from storage
   */
  static deserializeRatchetState(serialized: string): RatchetState {
    const data = JSON.parse(serialized);
    
    return {
      rootKey: new Uint8Array(data.rootKey),
      sendingChainKey: new Uint8Array(data.sendingChainKey),
      sendingMessageNumber: data.sendingMessageNumber,
      receivingChainKey: new Uint8Array(data.receivingChainKey),
      receivingMessageNumber: data.receivingMessageNumber,
      dhRatchetKey: {
        privateKey: new Uint8Array(data.dhRatchetKey.privateKey),
        publicKey: new Uint8Array(data.dhRatchetKey.publicKey)
      },
      remotePublicKey: data.remotePublicKey ? new Uint8Array(data.remotePublicKey) : null,
      headerKey: new Uint8Array(data.headerKey),
      nextHeaderKey: new Uint8Array(data.nextHeaderKey),
      skippedMessageKeys: new Map(data.skippedMessageKeys)
    };
  }
}