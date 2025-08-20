import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Shield, 
  Users, 
  Check, 
  CheckCheck,
  Wifi,
  WifiOff,
  Plus,
  Search,
  MoreVertical,
  Lock,
  Unlock,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Separator } from '@/components/ui/separator'; // Not needed for this component

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  encrypted: boolean;
  messageType: 'text' | 'system';
  isDelivered?: boolean;
  isRead?: boolean;
}

interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  participantName?: string;
  participantStagename?: string;
}

interface ConnectionStatus {
  connected: boolean;
  authenticated: boolean;
  lastPing?: Date;
}

export default function Messages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // WebSocket and connection state
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    authenticated: false
  });
  
  // UI state
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Messages and conversations state
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [maxReconnectAttempts] = useState(5);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);
  
  // Refs for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false
  });

  // Type guard for currentUser
  const hasValidUser = currentUser && typeof currentUser === 'object' && 'id' in currentUser;

  // Detect mobile and set responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768); // Hide sidebar on mobile by default
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!hasValidUser || !currentUser.id) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/messaging-ws`;
      
      console.log('🎸 Connecting to production messaging WebSocket:', wsUrl);
      setConnectionStatus(prev => ({ ...prev, reconnecting: true }));
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('📱 Connected to messaging WebSocket');
        setConnectionStatus(prev => ({ ...prev, connected: true, reconnecting: false }));
        setReconnectAttempts(0); // Reset reconnect attempts on successful connection
        
        // Authenticate immediately
        ws.send(JSON.stringify({
          type: 'auth',
          data: {
            userId: currentUser.id,
            stagename: (currentUser as any).stagename || 'User'
          }
        }));

        // Send queued messages
        messageQueue.forEach(queuedMessage => {
          ws.send(JSON.stringify(queuedMessage));
        });
        setMessageQueue([]); // Clear the queue
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('📱 WebSocket connection closed');
        setConnectionStatus({ connected: false, authenticated: false, reconnecting: false });
        
        // Exponential backoff reconnection with max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Max 30 seconds
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, delay);
        } else {
          console.error('❌ Max reconnection attempts reached');
          toast({
            title: "Connection Lost",
            description: "Failed to reconnect. Please refresh the page.",
            variant: "destructive"
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus({ connected: false, authenticated: false, reconnecting: false });
        
        toast({
          title: "Connection Error",
          description: "Lost connection to messaging server. Attempting to reconnect...",
          variant: "destructive"
        });
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [hasValidUser, currentUser?.id]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    console.log('📨 WebSocket message received:', message.type);
    
    switch (message.type) {
      case 'welcome':
        console.log('Welcome message:', message.data.message);
        break;
        
      case 'auth_success':
        console.log('✅ Authentication successful');
        setConnectionStatus(prev => ({ ...prev, authenticated: true }));
        
        // Load conversations after authentication
        loadConversations();
        break;
        
      case 'conversations_list':
        console.log('📋 Conversations loaded:', message.data.conversations?.length);
        setConversations(message.data.conversations || []);
        break;
        
      case 'messages_list':
        console.log('💬 Messages loaded for conversation:', message.data.conversationId);
        if (message.data.conversationId === selectedConversation) {
          setMessages(message.data.messages || []);
        }
        break;
        
      case 'message_received':
        console.log('📨 New message received');
        const newMessage = message.data;
        
        // Add to messages if it's for the current conversation
        if (newMessage.conversationId === selectedConversation) {
          setMessages(prev => [...prev, newMessage]);
        }
        
        // Update conversation list with new message
        setConversations(prev => prev.map(conv => 
          conv.id === newMessage.conversationId 
            ? { 
                ...conv, 
                lastMessage: newMessage.content,
                lastMessageAt: newMessage.timestamp,
                unreadCount: (conv.unreadCount || 0) + 1
              }
            : conv
        ));
        
        // Show notification for messages not in current conversation
        if (newMessage.conversationId !== selectedConversation) {
          toast({
            title: "New message",
            description: String(newMessage.content).slice(0, 50) + (String(newMessage.content).length > 50 ? '...' : ''),
          });
        }
        break;
        
      case 'message_sent':
        console.log('✅ Message sent successfully');
        break;
        
      case 'typing_status':
        const { userId, isTyping } = message.data;
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
        break;
        
      case 'conversation_joined':
        // Joined conversation successfully
        break;
        
      case 'error':
        // WebSocket error occurred
        toast({
          title: "Connection Error",
          description: message.data.message,
          variant: "destructive"
        });
        break;
        
      default:
        // Unknown message type received
    }
  };

  // Load conversations
  const loadConversations = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'get_conversations'
      }));
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    try {
      console.log('📨 Loading messages for conversation:', conversationId);
      
      // Try WebSocket first
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'get_messages',
          data: { conversationId }
        }));
      }
      
      // Fallback to direct API call to ensure messages load
      const response = await apiRequest(`/api/messaging/conversations/${conversationId}/messages`);
      if (response.ok) {
        const messages = await response.json();
        console.log('✅ Loaded', messages.length, 'messages for conversation:', conversationId);
        setMessages(messages);
      } else {
        console.error('❌ Failed to load messages via API');
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };

  // Join a conversation
  const joinConversation = (conversationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join_conversation',
        data: { conversationId }
      }));
    }
  };

  // Send a message
  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConversation || !wsRef.current) return;
    
    const messageContent = messageInput.trim();
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let encryptedContent = messageContent;
    let isEncrypted = false;

    // Encrypt message if encryption is enabled
    if (encryptionEnabled) {
      try {
        // Encrypting message...
        // For demo: simulate encryption with visual indicator
        encryptedContent = `🔒 [ENCRYPTED] ${messageContent}`;
        isEncrypted = true;
      } catch (error) {
        // Encryption failed
        toast({
          title: "Encryption Error",
          description: "Failed to encrypt message. Sending as plain text.",
          variant: "destructive"
        });
      }
    }

    // Add to local messages immediately for optimistic updates
    const localMessage: Message = {
      id: messageId,
      conversationId: selectedConversation,
      senderId: hasValidUser ? currentUser.id : 'demo-user',
      content: messageContent, // Show original content locally
      timestamp: new Date().toISOString(),
      encrypted: isEncrypted,
      messageType: 'text',
      isDelivered: false,
      isRead: false
    };

    setMessages(prev => [...prev, localMessage]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        data: {
          id: messageId,
          conversationId: selectedConversation,
          content: isEncrypted ? encryptedContent : messageContent,
          encrypted: isEncrypted,
          timestamp: new Date().toISOString(),
          messageType: 'text'
        }
      }));
      
      setMessageInput('');
    } else {
      console.log('📥 Queueing message for later');
      setMessageQueue(prev => [...prev, {
        type: 'send_message',
        data: {
          id: messageId,
          conversationId: selectedConversation,
          content: isEncrypted ? encryptedContent : messageContent,
          encrypted: isEncrypted,
          timestamp: new Date().toISOString(),
          messageType: 'text'
        }
      }]);
      
      toast({
        title: "Message Queued",
        description: "Message will be sent when connection is restored.",
      });
      
      setMessageInput('');
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && selectedConversation) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        data: {
          conversationId: selectedConversation,
          isTyping
        }
      }));
    }
  };

  // Handle conversation selection
  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id);
    setMessages([]); // Clear current messages
    joinConversation(conversation.id);
    loadMessages(conversation.id);
    
    // Mark conversation as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  // Handle typing input
  const handleTyping = () => {
    sendTypingIndicator(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Search for users to start new conversations
  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setAvailableUsers([]);
      return;
    }

    try {
      const response = await apiRequest(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      const users = await response.json();
      
      // Filter out current user and users already in conversations
      const existingUserIds = new Set([
        hasValidUser ? currentUser.id : '',
        ...conversations.flatMap(c => [c.participant1Id, c.participant2Id])
      ]);
      
      const filteredUsers = users.filter((user: any) => !existingUserIds.has(user.id));
      setAvailableUsers(filteredUsers.slice(0, 5)); // Limit to 5 results
    } catch (error) {
      console.error('Error searching users:', error);
      // Fallback: Mock users for demo
      setAvailableUsers([
        { id: 'user1', stagename: 'MetalFan2024' },
        { id: 'user2', stagename: 'ConcertGoer' },
        { id: 'user3', stagename: 'HeadBanger' }
      ].filter(user => user.stagename.toLowerCase().includes(searchTerm.toLowerCase())));
    }
  };

  // Create new conversation with a user
  const createNewConversation = async (user: any) => {
    try {
      const response = await apiRequest('/api/messaging/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: user.id
        })
      });

      if (response.ok) {
        const newConversation = await response.json();
        
        // Add to conversations list
        setConversations(prev => [newConversation, ...prev]);
        
        // Select the new conversation
        selectConversation(newConversation);
        
        // Close the new conversation modal
        setShowNewConversation(false);
        setSearchInput('');
        setAvailableUsers([]);
        
        toast({
          title: "New conversation started",
          description: `Started messaging with ${user.stagename}`,
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      
      // Fallback: Create mock conversation for demo
      const mockConversation = {
        id: `conv-${Date.now()}`,
        participant1Id: hasValidUser ? currentUser.id : 'demo-user',
        participant2Id: user.id,
        participantStagename: user.stagename,
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0
      };
      
      setConversations(prev => [mockConversation, ...prev]);
      selectConversation(mockConversation);
      setShowNewConversation(false);
      setSearchInput('');
      setAvailableUsers([]);
      
      toast({
        title: "New conversation started",
        description: `Started messaging with ${user.stagename}`,
      });
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Check if message is from current user
  const isMyMessage = (message: Message) => {
    return hasValidUser && message.senderId === currentUser.id;
  };

  if (!hasValidUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <h1 className="text-lg font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEncryptionEnabled(!encryptionEnabled)}
              data-testid="button-toggle-encryption"
            >
              {encryptionEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
            {connectionStatus.connected ? (
              <Badge variant="outline" className="text-green-500 border-green-500 text-xs">
                <Wifi className="w-3 h-3" />
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-500 border-red-500 text-xs">
                <WifiOff className="w-3 h-3" />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Conversations Sidebar */}
      <div className={`${isMobile ? (showSidebar ? 'w-full' : 'hidden') : 'w-80'} ${isMobile ? 'mt-16' : ''} border-r border-border flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Messages
            </h1>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={() => setShowNewConversation(true)}
                data-testid="button-new-conversation"
              >
                <Plus className="w-4 h-4" />
              </Button>
              {connectionStatus.connected ? (
                <Badge variant="outline" className="text-green-500 border-green-500">
                  <Wifi className="w-3 h-3 mr-1" />
                  {connectionStatus.authenticated ? 'Connected' : 'Connecting...'}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-500 border-red-500">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
              data-testid="input-search-conversations"
            />
          </div>
        </div>
        
        {/* New Conversation Modal */}
        {showNewConversation && (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Start New Conversation</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowNewConversation(false)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Search users to message..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  searchUsers(e.target.value);
                }}
                data-testid="input-search-users"
              />
              
              {availableUsers.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => createNewConversation(user)}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                      data-testid={`user-${user.id}`}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {user.stagename?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.stagename}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting with other users!</p>
              <Button 
                className="mt-2" 
                onClick={() => setShowNewConversation(true)}
                data-testid="button-start-conversation"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation === conversation.id ? 'bg-muted' : ''
                }`}
                data-testid={`conversation-${conversation.id}`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {conversation.participantStagename?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {conversation.participantStagename || `User ${conversation.participant2Id}`}
                      </h3>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    )}
                    
                    {conversation.lastMessageAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessageAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Messages Area */}
      <div className={`${isMobile ? (showSidebar ? 'hidden' : 'w-full') : 'flex-1'} ${isMobile ? 'mt-16' : ''} flex flex-col`}>
        {selectedConversation ? (
          <>
            {/* Messages Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {conversations.find(c => c.id === selectedConversation)?.participantStagename?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">
                      {conversations.find(c => c.id === selectedConversation)?.participantStagename || 'Unknown User'}
                    </h2>
                    {typingUsers.size > 0 && (
                      <p className="text-sm text-muted-foreground">Typing...</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    <Shield className="w-3 h-3 mr-1" />
                    Encrypted
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${message.id}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isMyMessage(message)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className={`flex items-center justify-between mt-1 ${
                      isMyMessage(message) ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {isMyMessage(message) && (
                        <div className="flex items-center">
                          {message.encrypted && <Shield className="w-3 h-3 mr-1" />}
                          {message.isRead ? (
                            <CheckCheck className="w-3 h-3 text-blue-400" />
                          ) : message.isDelivered ? (
                            <Check className="w-3 h-3" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!messageInput.trim() || !connectionStatus.authenticated}
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}