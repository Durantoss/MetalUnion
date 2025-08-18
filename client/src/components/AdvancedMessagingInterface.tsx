import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Shield, 
  Users, 
  Clock, 
  CheckCheck,
  Check,
  Wifi,
  WifiOff,
  Key,
  Lock,
  Unlock,
  ArrowLeft,
  Home
} from 'lucide-react';

interface WebSocketMessage {
  type: string;
  data: any;
  messageId?: string;
  conversationId?: string;
}

interface EncryptionKeys {
  id: string;
  publicKey: string;
  keyType: string;
  isActive: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  isDelivered: boolean;
  isRead: boolean;
  isEncrypted: boolean;
}

interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessageAt: Date;
  isBlocked: boolean;
}

interface AdvancedMessagingInterfaceProps {
  onNavigate?: (section: string) => void;
}

export function AdvancedMessagingInterface({ onNavigate }: AdvancedMessagingInterfaceProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKeys | null>(null);
  const [recipientUserId, setRecipientUserId] = useState('demo-recipient');
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [encryptionTest, setEncryptionTest] = useState<any>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserId = 'demo-user'; // In real app, get from auth

  useEffect(() => {
    connectWebSocket();
    initializeEncryption();
    fetchConversations();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      setConnectionStatus('connecting');
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Authenticate with server
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          data: { userId: currentUserId }
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (connectionStatus !== 'connected') {
            connectWebSocket();
          }
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'auth_success':
        console.log('WebSocket authentication successful');
        break;
        
      case 'new_message':
        console.log('Received new message:', message.data);
        const newMsg: Message = {
          id: message.data.id,
          content: message.data.content,
          senderId: message.data.senderId,
          timestamp: new Date(message.data.createdAt),
          isDelivered: true,
          isRead: false,
          isEncrypted: true
        };
        setMessages(prev => [newMsg, ...prev]);
        
        // Send read receipt
        wsRef.current?.send(JSON.stringify({
          type: 'read_receipt',
          data: {
            messageId: message.data.id,
            conversationId: message.data.conversationId
          }
        }));
        break;
        
      case 'message_sent':
        console.log('Message sent confirmation:', message.data);
        // Update message status to sent
        break;
        
      case 'typing_indicator':
        const { userId, isTyping } = message.data;
        if (isTyping) {
          setTypingUsers(prev => new Set(Array.from(prev).concat(userId)));
          setTimeout(() => {
            setTypingUsers(prev => {
              const updated = new Set(Array.from(prev));
              updated.delete(userId);
              return updated;
            });
          }, 3000);
        }
        break;
        
      case 'user_status':
        const { userId: statusUserId, status } = message.data;
        if (status === 'online') {
          setOnlineUsers(prev => new Set(Array.from(prev).concat(statusUserId)));
        } else {
          setOnlineUsers(prev => {
            const updated = new Set(Array.from(prev));
            updated.delete(statusUserId);
            return updated;
          });
        }
        break;
        
      case 'delivery_receipt':
        console.log('Delivery receipt:', message.data);
        break;
        
      case 'read_receipt':
        console.log('Read receipt:', message.data);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const initializeEncryption = async () => {
    try {
      // First, try to get existing keys
      const response = await fetch('/api/messaging/encryption-keys', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const keys = await response.json();
        setEncryptionKeys(keys);
        console.log('Loaded existing encryption keys');
      } else if (response.status === 404) {
        // Create new keys
        const createResponse = await fetch('/api/messaging/encryption-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ password: 'user-password' })
        });
        
        if (createResponse.ok) {
          const newKeys = await createResponse.json();
          setEncryptionKeys(newKeys);
          console.log('Created new encryption keys');
        }
      }
    } catch (error) {
      console.error('Error initializing encryption:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messaging/conversations', {
        credentials: 'include'
      });
      if (response.ok) {
        const convs = await response.json();
        setConversations(convs);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const testEncryption = async () => {
    try {
      const response = await fetch('/api/messaging/test-encryption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: 'Hello, this is a test encrypted message! 🤘',
          recipientUserId
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setEncryptionTest(result);
        console.log('Encryption test successful:', result);
      }
    } catch (error) {
      console.error('Encryption test failed:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;
    
    const tempId = Date.now().toString();
    
    // Send via WebSocket for real-time delivery
    wsRef.current?.send(JSON.stringify({
      type: 'message',
      data: {
        conversationId: activeConversation || 'demo-conversation',
        content: newMessage,
        messageType: 'text',
        recipientId: recipientUserId,
        tempId
      }
    }));
    
    // Add optimistic message to UI
    const optimisticMessage: Message = {
      id: tempId,
      content: newMessage,
      senderId: currentUserId,
      timestamp: new Date(),
      isDelivered: false,
      isRead: false,
      isEncrypted: true
    };
    
    setMessages(prev => [optimisticMessage, ...prev]);
    setNewMessage('');
  };

  const handleTyping = () => {
    // Send typing indicator
    wsRef.current?.send(JSON.stringify({
      type: 'typing',
      data: {
        conversationId: activeConversation || 'demo-conversation',
        isTyping: true,
        recipientId: recipientUserId
      }
    }));
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      wsRef.current?.send(JSON.stringify({
        type: 'typing',
        data: {
          conversationId: activeConversation || 'demo-conversation',
          isTyping: false,
          recipientId: recipientUserId
        }
      }));
    }, 2000);
  };

  const startNewConversation = async () => {
    try {
      const response = await fetch('/api/messaging/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          participant2Id: recipientUserId
        })
      });
      
      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation.id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black p-4" data-testid="advanced-messaging-interface">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => onNavigate?.('landing')}
              variant="outline"
              className="border-red-600/30 text-red-400 hover:bg-red-600/10"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to MoshUnion
            </Button>
            <Button
              onClick={() => onNavigate?.('social')}
              variant="outline"
              className="border-yellow-600/30 text-yellow-400 hover:bg-yellow-600/10"
              data-testid="button-social-hub"
            >
              <Users className="w-4 h-4 mr-2" />
              Social Hub
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-400 mb-2" data-testid="title-advanced-messaging">
            🔥 Advanced Secure Messaging 🔥
          </h1>
          <p className="text-yellow-300 text-lg" data-testid="subtitle-secure-features">
            Real-time WebSocket • RSA-2048 + AES-256-GCM Encryption • Delivery Receipts
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6 p-4 bg-gray-900/50 border-red-600/30" data-testid="card-connection-status">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <Wifi className="text-green-400 w-5 h-5" data-testid="icon-connected" />
              ) : (
                <WifiOff className="text-red-400 w-5 h-5" data-testid="icon-disconnected" />
              )}
              <span className="text-white font-medium" data-testid="text-connection-status">
                WebSocket: {connectionStatus}
              </span>
              <Badge variant={isConnected ? "default" : "destructive"} data-testid="badge-connection">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {encryptionKeys && (
                <div className="flex items-center gap-2" data-testid="encryption-status">
                  <Shield className="text-green-400 w-4 h-4" />
                  <span className="text-green-400 text-sm">RSA Keys Active</span>
                </div>
              )}
              <Badge variant="outline" className="text-yellow-300" data-testid="badge-online-users">
                {onlineUsers.size} Online
              </Badge>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations Panel */}
          <Card className="lg:col-span-1 bg-gray-900/50 border-red-600/30" data-testid="card-conversations">
            <div className="p-4 border-b border-red-600/30">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2" data-testid="title-conversations">
                <MessageCircle className="w-5 h-5" />
                Conversations
              </h3>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="space-y-2" data-testid="conversation-controls">
                <input
                  type="text"
                  placeholder="Recipient User ID"
                  value={recipientUserId}
                  onChange={(e) => setRecipientUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-yellow-600/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  data-testid="input-recipient-id"
                />
                <Button 
                  onClick={startNewConversation}
                  className="w-full bg-red-600 hover:bg-red-700"
                  data-testid="button-new-conversation"
                >
                  Start New Conversation
                </Button>
              </div>
              
              <div className="space-y-2" data-testid="conversations-list">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      activeConversation === conv.id
                        ? 'bg-red-600/20 border border-red-600/50'
                        : 'bg-gray-800/30 hover:bg-gray-800/50'
                    }`}
                    data-testid={`conversation-${conv.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        {conv.participant2Id}
                      </span>
                      {onlineUsers.has(conv.participant2Id) && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" data-testid="online-indicator" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {new Date(conv.lastMessageAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Main Chat Interface */}
          <Card className="lg:col-span-2 bg-gray-900/50 border-red-600/30" data-testid="card-chat-interface">
            <div className="p-4 border-b border-red-600/30">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-red-400" data-testid="title-chat">
                  Secure Chat
                </h3>
                {typingUsers.size > 0 && (
                  <div className="text-yellow-300 text-sm flex items-center gap-2" data-testid="typing-indicator">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-yellow-300 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                      <div className="w-1 h-1 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                    </div>
                    Typing...
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-3" data-testid="messages-area">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${message.id}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.senderId === currentUserId
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="text-sm" data-testid={`message-content-${message.id}`}>
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70" data-testid={`message-time-${message.id}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.senderId === currentUserId && (
                        <div className="flex items-center gap-1" data-testid={`message-status-${message.id}`}>
                          {message.isEncrypted && <Lock className="w-3 h-3" />}
                          {message.isRead ? (
                            <CheckCheck className="w-3 h-3 text-blue-400" />
                          ) : message.isDelivered ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-red-600/30">
              <div className="flex gap-2" data-testid="message-input-area">
                <input
                  type="text"
                  placeholder="Type your encrypted message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-yellow-600/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={!isConnected}
                  data-testid="input-new-message"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Encryption Testing Panel */}
        <Card className="mt-6 bg-gray-900/50 border-red-600/30" data-testid="card-encryption-test">
          <div className="p-4 border-b border-red-600/30">
            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2" data-testid="title-encryption-test">
              <Key className="w-5 h-5" />
              Encryption Testing
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={testEncryption}
                className="bg-yellow-600 hover:bg-yellow-700 text-black"
                data-testid="button-test-encryption"
              >
                Test RSA/AES Encryption
              </Button>
              
              {encryptionKeys && (
                <div className="flex items-center gap-2 text-green-400" data-testid="encryption-keys-info">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">
                    {encryptionKeys.keyType.toUpperCase()} Key: {encryptionKeys.id.slice(0, 8)}...
                  </span>
                </div>
              )}
            </div>
            
            {encryptionTest && (
              <div className="bg-gray-800/50 p-4 rounded-lg" data-testid="encryption-test-result">
                <h4 className="text-yellow-300 font-medium mb-2">Encryption Test Result:</h4>
                <div className="space-y-2 text-sm">
                  <div data-testid="test-original">
                    <strong className="text-gray-300">Original:</strong>
                    <p className="text-white bg-gray-700/50 p-2 rounded mt-1">
                      {encryptionTest.originalMessage}
                    </p>
                  </div>
                  <div data-testid="test-encrypted">
                    <strong className="text-gray-300">Encrypted Data:</strong>
                    <p className="text-yellow-300 bg-gray-700/50 p-2 rounded mt-1 font-mono text-xs break-all">
                      {encryptionTest.encryptedMessage.encryptedData.substring(0, 100)}...
                    </p>
                  </div>
                  <div data-testid="test-encrypted-key">
                    <strong className="text-gray-300">Encrypted AES Key:</strong>
                    <p className="text-red-300 bg-gray-700/50 p-2 rounded mt-1 font-mono text-xs break-all">
                      {encryptionTest.encryptedMessage.encryptedKey.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="text-green-400" data-testid="test-status">
                    ✅ {encryptionTest.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}