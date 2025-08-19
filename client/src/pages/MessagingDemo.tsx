import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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
  Settings,
  TestTube,
  Activity,
  Zap
} from 'lucide-react';
import { GroupChatSimple } from '@/components/GroupChatSimple';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isDelivered: boolean;
  isRead: boolean;
  isEncrypted: boolean;
  encryptionData?: any;
}

interface EncryptionTest {
  original: string;
  encrypted: any;
  decrypted: string;
  success: boolean;
  method: string;
}

/**
 * Complete Messaging Demo Interface
 * Showcases all messaging features and examples
 */
export function MessagingDemo() {
  const { toast } = useToast();
  
  // WebSocket connections
  const wsRef = useRef<WebSocket | null>(null);
  const wsExamplesRef = useRef<WebSocket | null>(null);
  
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isExamplesConnected, setIsExamplesConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('demo-user-1');
  const [recipientUserId, setRecipientUserId] = useState('demo-user-2');
  const [activeTab, setActiveTab] = useState('messaging');
  
  // Messaging state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  // Encryption state
  const [encryptionTest, setEncryptionTest] = useState<EncryptionTest | null>(null);
  const [encryptionKeys, setEncryptionKeys] = useState<any>(null);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  
  // WebSocket Examples state
  const [exampleMessages, setExampleMessages] = useState<any[]>([]);
  const [connectionStats, setConnectionStats] = useState<any>(null);
  const [testCommand, setTestCommand] = useState('/auth demo-user');

  useEffect(() => {
    // Connect to main WebSocket server
    connectWebSocket();
    
    // Connect to WebSocket Examples server
    connectExamplesWebSocket();
    
    // Load initial data
    loadEncryptionKeys();
    
    return () => {
      wsRef.current?.close();
      wsExamplesRef.current?.close();
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "WebSocket connection established 🚀",
        });
        
        // Authenticate
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          data: { userId: currentUserId }
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        toast({
          title: "Disconnected",
          description: "WebSocket connection lost",
          variant: "destructive"
        });
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to messaging server",
          variant: "destructive"
        });
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const connectExamplesWebSocket = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws-examples`;
      
      wsExamplesRef.current = new WebSocket(wsUrl);
      
      wsExamplesRef.current.onopen = () => {
        setIsExamplesConnected(true);
        toast({
          title: "Examples Connected",
          description: "WebSocket Examples server connected 🎸",
        });
      };
      
      wsExamplesRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleExamplesMessage(message);
      };
      
      wsExamplesRef.current.onclose = () => {
        setIsExamplesConnected(false);
      };
    } catch (error) {
      console.error('Examples WebSocket connection error:', error);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'new_message':
        setMessages(prev => [message.data, ...prev]);
        break;
      case 'typing_indicator':
        if (message.data.isTyping) {
          setTypingUsers(prev => [...prev.filter(id => id !== message.data.userId), message.data.userId]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== message.data.userId));
        }
        break;
      case 'read_receipt':
        updateMessageStatus(message.data.messageId, 'read');
        break;
      case 'delivery_receipt':
        updateMessageStatus(message.data.messageId, 'delivered');
        break;
    }
  };

  const handleExamplesMessage = (message: any) => {
    setExampleMessages(prev => [message, ...prev.slice(0, 9)]); // Keep last 10 messages
    
    if (message.type === 'connection_stats') {
      setConnectionStats(message.data);
    }
  };

  const updateMessageStatus = (messageId: string, status: 'delivered' | 'read') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, [status === 'delivered' ? 'isDelivered' : 'isRead']: true }
        : msg
    ));
  };

  const loadEncryptionKeys = async () => {
    try {
      const response = await fetch('/api/messaging/encryption-keys', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const keys = await response.json();
        setEncryptionKeys(keys);
      } else if (response.status === 404) {
        // Generate new keys
        await generateEncryptionKeys();
      }
    } catch (error) {
      console.error('Failed to load encryption keys:', error);
    }
  };

  const generateEncryptionKeys = async () => {
    try {
      const response = await fetch('/api/messaging/generate-keys', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setEncryptionKeys(result.keys);
        toast({
          title: "Keys Generated",
          description: "New encryption keys created 🔐",
        });
      }
    } catch (error) {
      console.error('Failed to generate encryption keys:', error);
      toast({
        title: "Key Generation Failed",
        description: "Could not generate encryption keys",
        variant: "destructive"
      });
    }
  };

  const testEncryption = async () => {
    try {
      const testMessage = "Hello! This is a test message for end-to-end encryption 🤘";
      
      const response = await fetch('/api/messaging/test-encryption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: testMessage,
          recipientUserId
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setEncryptionTest(result);
        toast({
          title: "Encryption Test Successful",
          description: "Message encrypted and decrypted successfully ✅",
        });
      }
    } catch (error) {
      console.error('Encryption test failed:', error);
      toast({
        title: "Encryption Test Failed",
        description: "Could not test encryption",
        variant: "destructive"
      });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;
    
    const messageData = {
      type: 'message',
      data: {
        conversationId: `conv-${currentUserId}-${recipientUserId}`,
        content: newMessage,
        recipientId: recipientUserId,
        encrypt: encryptionEnabled
      }
    };
    
    wsRef.current?.send(JSON.stringify(messageData));
    setNewMessage('');
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    wsRef.current?.send(JSON.stringify({
      type: 'typing',
      data: {
        conversationId: `conv-${currentUserId}-${recipientUserId}`,
        isTyping
      }
    }));
  };

  const sendExampleCommand = () => {
    if (!testCommand.trim() || !isExamplesConnected) return;
    
    if (testCommand.startsWith('/')) {
      // Send as command
      wsExamplesRef.current?.send(JSON.stringify({
        type: 'message',
        data: {
          command: testCommand
        }
      }));
    } else {
      // Send as connection test
      wsExamplesRef.current?.send(JSON.stringify({
        type: 'connection_test',
        data: {
          testMessage: testCommand,
          clientTimestamp: Date.now()
        }
      }));
    }
    
    setTestCommand('');
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
      
      // Stop typing after 2 seconds of no input
      setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(false);
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="messaging-demo">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">🤘 Messages Demo</h1>
        <p className="text-gray-400">Complete examples of end-to-end encrypted messaging</p>
        <div className="flex justify-center gap-4 text-sm">
          <Badge variant={isConnected ? "default" : "destructive"} data-testid="connection-status">
            <Wifi className="w-3 h-3 mr-1" />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Badge variant={isExamplesConnected ? "default" : "secondary"} data-testid="examples-status">
            <Activity className="w-3 h-3 mr-1" />
            Examples {isExamplesConnected ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={encryptionKeys ? "default" : "outline"} data-testid="encryption-status">
            <Shield className="w-3 h-3 mr-1" />
            {encryptionKeys ? "Encrypted" : "No Keys"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="messaging" data-testid="tab-messaging">
            <MessageCircle className="w-4 h-4 mr-2" />
            Messaging
          </TabsTrigger>
          <TabsTrigger value="groups" data-testid="tab-groups">
            <Users className="w-4 h-4 mr-2" />
            Group Chats
          </TabsTrigger>
          <TabsTrigger value="encryption" data-testid="tab-encryption">
            <Shield className="w-4 h-4 mr-2" />
            Encryption
          </TabsTrigger>
          <TabsTrigger value="examples" data-testid="tab-examples">
            <TestTube className="w-4 h-4 mr-2" />
            Examples
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Real-Time Messaging
                {typingUsers.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {typingUsers.join(', ')} typing...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto" data-testid="messages-container">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center">No messages yet. Send a message to test!</p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-3 p-3 rounded-lg ${
                        message.senderId === currentUserId
                          ? 'bg-blue-600 ml-8'
                          : 'bg-gray-700 mr-8'
                      }`}
                      data-testid={`message-${message.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-white">{message.content}</p>
                        <div className="flex items-center gap-1 ml-2">
                          {message.isEncrypted && (
                            <Lock className="w-3 h-3 text-green-400" title="Encrypted" />
                          )}
                          {message.isDelivered && (
                            <Check className="w-3 h-3 text-blue-400" title="Delivered" />
                          )}
                          {message.isRead && (
                            <CheckCheck className="w-3 h-3 text-green-400" title="Read" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isConnected}
                  data-testid="message-input"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!isConnected || !newMessage.trim()}
                  data-testid="send-button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={encryptionEnabled}
                    onChange={(e) => setEncryptionEnabled(e.target.checked)}
                    data-testid="encryption-toggle"
                  />
                  Enable Encryption
                </label>
                <span>Current User: {currentUserId}</span>
                <span>Recipient: {recipientUserId}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                End-to-End Encrypted Group Chats
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  E2E Encrypted
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GroupChatSimple />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Encryption Testing & Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Encryption Keys</h3>
                  {encryptionKeys ? (
                    <div className="bg-gray-900 p-3 rounded text-sm">
                      <p><strong>Key ID:</strong> {encryptionKeys.id}</p>
                      <p><strong>Type:</strong> {encryptionKeys.keyType}</p>
                      <p><strong>Status:</strong> {encryptionKeys.isActive ? 'Active' : 'Inactive'}</p>
                      <p><strong>Public Key:</strong> {encryptionKeys.publicKey.substring(0, 50)}...</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No encryption keys found</p>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={generateEncryptionKeys} size="sm" data-testid="generate-keys">
                      <Key className="w-4 h-4 mr-2" />
                      Generate Keys
                    </Button>
                    <Button onClick={testEncryption} size="sm" variant="outline" data-testid="test-encryption">
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Encryption
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">Encryption Test Results</h3>
                  {encryptionTest ? (
                    <div className="bg-gray-900 p-3 rounded text-sm space-y-2" data-testid="encryption-test-result">
                      <p><strong>Original:</strong> {encryptionTest.original}</p>
                      <p><strong>Method:</strong> {encryptionTest.method}</p>
                      <p><strong>Encrypted Data:</strong> {encryptionTest.encrypted.data}</p>
                      <p><strong>Decrypted:</strong> {encryptionTest.decrypted}</p>
                      <p className={`font-semibold ${encryptionTest.success ? 'text-green-400' : 'text-red-400'}`}>
                        Status: {encryptionTest.success ? 'SUCCESS ✅' : 'FAILED ❌'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No test results yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                WebSocket Examples & Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Test Commands</h3>
                    <div className="flex gap-2">
                      <Input
                        value={testCommand}
                        onChange={(e) => setTestCommand(e.target.value)}
                        placeholder="/auth demo-user or test message"
                        onKeyDown={(e) => e.key === 'Enter' && sendExampleCommand()}
                        data-testid="test-command-input"
                      />
                      <Button 
                        onClick={sendExampleCommand} 
                        disabled={!isExamplesConnected}
                        data-testid="send-command"
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Try: /auth user123, /encrypt hello, /typing conv1, /stats
                    </div>
                  </div>
                  
                  {connectionStats && (
                    <div className="bg-gray-900 p-3 rounded">
                      <h4 className="font-semibold mb-2">Connection Stats</h4>
                      <div className="text-sm space-y-1" data-testid="connection-stats">
                        <p>Active Connections: {connectionStats.activeConnections}</p>
                        <p>Messages Exchanged: {connectionStats.messagesExchanged}</p>
                        <p>Encrypted Messages: {connectionStats.encryptedMessages}</p>
                        <p>Connected Users: {connectionStats.connectedUsers}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Example Messages</h3>
                  <div className="bg-gray-900 p-3 rounded h-64 overflow-y-auto" data-testid="example-messages">
                    {exampleMessages.length === 0 ? (
                      <p className="text-gray-500">No example messages yet</p>
                    ) : (
                      exampleMessages.map((msg, index) => (
                        <div key={index} className="mb-2 p-2 bg-gray-800 rounded text-xs">
                          <p className="font-semibold text-blue-400">{msg.type}</p>
                          <pre className="text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(msg.data, null, 2)}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuration & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current User ID</label>
                    <Input
                      value={currentUserId}
                      onChange={(e) => setCurrentUserId(e.target.value)}
                      data-testid="current-user-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Recipient User ID</label>
                    <Input
                      value={recipientUserId}
                      onChange={(e) => setRecipientUserId(e.target.value)}
                      data-testid="recipient-user-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Connection Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <span>Main WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isExamplesConnected ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <span>Examples WebSocket: {isExamplesConnected ? 'Connected' : 'Disconnected'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={connectWebSocket} variant="outline" size="sm" data-testid="reconnect-main">
                      Reconnect Main
                    </Button>
                    <Button onClick={connectExamplesWebSocket} variant="outline" size="sm" data-testid="reconnect-examples">
                      Reconnect Examples
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}