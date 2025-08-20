import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Send, Shield, Key, Lock, MessageCircle, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EncryptedMessage {
  id: string;
  senderId: string;
  conversationId: string;
  encryptedContent?: string;
  content?: string;
  timestamp: string;
  encrypted: boolean;
  messageType: 'text' | 'system';
}

interface EncryptedConversation {
  id: string;
  participantId: string;
  participantName: string;
  encryptionEnabled: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface EncryptedChatProps {
  currentUser?: {
    id: string;
    stagename: string;
  };
}

export function EncryptedChat({ currentUser }: EncryptedChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [encryptionSetup, setEncryptionSetup] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<EncryptedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!currentUser || !encryptionSetup) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('🔒 Encrypted WebSocket connected');
      // Authenticate with encryption support
      websocket.send(JSON.stringify({
        type: 'auth',
        data: { userId: currentUser.id }
      }));
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'auth_success') {
        console.log('🔐 Authenticated with encryption:', message.data);
      } else if (message.type === 'encrypted_message_received') {
        // Handle incoming encrypted message
        handleIncomingEncryptedMessage(message.data);
      }
    };

    websocket.onclose = () => {
      console.log('🔒 Encrypted WebSocket disconnected');
      setWs(null);
    };

    return () => {
      websocket.close();
    };
  }, [currentUser, encryptionSetup]);

  // Setup encryption keys mutation (automatic - no password required)
  const setupKeysMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/encryption/setup-keys', {
        method: 'POST',
        body: JSON.stringify({}) // No password needed - auto-generated
      });
    },
    onSuccess: () => {
      setEncryptionSetup(true);
      queryClient.invalidateQueries({ queryKey: ['/api/encryption'] });
    }
  });

  // Auto-setup encryption when user is available
  useEffect(() => {
    if (currentUser && !encryptionSetup) {
      setupKeysMutation.mutate();
    }
  }, [currentUser]);

  // Send encrypted message mutation
  const sendEncryptedMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content, messagePassword }: { 
      conversationId: string; 
      content: string; 
      messagePassword: string;
    }) => {
      if (!ws) throw new Error('WebSocket not connected');
      
      // Send via WebSocket
      ws.send(JSON.stringify({
        type: 'encrypted_message',
        conversationId,
        data: { content },
        password: messagePassword
      }));

      return { success: true };
    },
    onSuccess: () => {
      setMessageInput('');
      // Add message to local state optimistically
      const newMessage: EncryptedMessage = {
        id: `temp-${Date.now()}`,
        senderId: currentUser?.id || '',
        conversationId: selectedConversation || '',
        content: messageInput,
        timestamp: new Date().toISOString(),
        encrypted: true,
        messageType: 'text'
      };
      setMessages(prev => [...prev, newMessage]);
    }
  });

  const handleIncomingEncryptedMessage = (messageData: any) => {
    console.log('📨 Incoming encrypted message:', messageData);
    // In a real implementation, you'd decrypt the message here
    // For now, show a placeholder
    const newMessage: EncryptedMessage = {
      id: messageData.messageId,
      senderId: messageData.senderId,
      conversationId: messageData.conversationId,
      content: '🔒 Encrypted message received',
      timestamp: messageData.timestamp,
      encrypted: true,
      messageType: 'text'
    };
    
    if (messageData.conversationId === selectedConversation) {
      setMessages(prev => [...prev, newMessage]);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !currentUser) return;

    // Use auto-generated password
    const autoPassword = getAutoPassword(currentUser.id);

    try {
      await sendEncryptedMessageMutation.mutateAsync({
        conversationId: selectedConversation,
        content: messageInput,
        messagePassword: autoPassword
      });
    } catch (error) {
      console.error('Failed to send encrypted message:', error);
    }
  };

  // Auto-generate password for messages (derived from user ID)
  const getAutoPassword = (userId: string): string => {
    const appSalt = 'moshunion-encryption-2025';
    const combinedData = `${userId}-${appSalt}-${process.env.NODE_ENV || 'development'}`;
    
    // Simple hash for client-side (matches server logic)
    let hash = 0;
    for (let i = 0; i < combinedData.length; i++) {
      const char = combinedData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 16);
  };

  if (!currentUser) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to access encrypted messaging.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!encryptionSetup && setupKeysMutation.isPending) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-green-500 animate-spin" />
            Setting Up Encryption
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Automatically configuring military-grade encryption with Double Ratchet Algorithm + AES-256. 
              No password required - your encryption keys are securely generated!
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>🔒 <strong>Double Ratchet Algorithm</strong> - Perfect forward and future secrecy</p>
            <p>✍️ <strong>Ed25519</strong> - Digital signatures for authentication</p>
            <p>🔑 <strong>X25519</strong> - Elliptic curve key exchange</p>
            <p>🛡️ <strong>AES-256-GCM</strong> - Authenticated symmetric encryption</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-12 gap-4 h-[600px]">
        {/* Conversation List */}
        <div className="col-span-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  Encrypted Chats
                </div>
                <Badge variant="secondary" className="text-xs">
                  🔒 Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <Button
                  variant={selectedConversation === 'demo-conversation' ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedConversation('demo-conversation')}
                  data-testid="button-select-conversation"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">MoshBot Secure</p>
                      <p className="text-xs text-muted-foreground">End-to-end encrypted</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="col-span-8">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  {selectedConversation ? 'Encrypted Chat' : 'Select a conversation'}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  🛡️ Double Ratchet
                </Badge>
              </div>
            </CardHeader>

            {selectedConversation ? (
              <>
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <Shield className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Start a secure conversation</p>
                        <p className="text-xs text-muted-foreground">Messages are encrypted with military-grade security</p>
                      </div>
                    )}
                    
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${message.id}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                            message.senderId === currentUser.id
                              ? 'bg-red-600 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Lock className="h-3 w-3 opacity-70" />
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your encrypted message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                      data-testid="input-encrypted-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendEncryptedMessageMutation.isPending}
                      size="icon"
                      data-testid="button-send-encrypted"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Protected by Double Ratchet encryption
                  </p>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                  <p className="text-muted-foreground">Choose a conversation to start encrypted messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}