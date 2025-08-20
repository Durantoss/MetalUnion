import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Send, Bot, User, Plus, Trash2, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AIChatbotProps {
  currentUser?: {
    id: string;
    stagename: string;
  };
}

export function AIChatbot({ currentUser }: AIChatbotProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Query for conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ChatConversation[]>({
    queryKey: ['/api/ai-chat/conversations'],
    enabled: !!currentUser
  });

  // Query for current conversation
  const { data: currentConversation, isLoading: conversationLoading } = useQuery<ChatConversation>({
    queryKey: ['/api/ai-chat/conversations', selectedConversation],
    enabled: !!selectedConversation
  });

  // Mutation for creating new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string = 'New AI Chat') => {
      return apiRequest('/api/ai-chat/conversations', {
        method: 'POST',
body: JSON.stringify({ title })
      });
    },
    onSuccess: (newConversation: ChatConversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-chat/conversations'] });
      setSelectedConversation(newConversation.id);
      setShowConversationList(false);
    }
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      return apiRequest(`/api/ai-chat/conversations/${conversationId}/messages`, {
        method: 'POST',
body: JSON.stringify({ content })
      });
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['/api/ai-chat/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-chat/conversations', selectedConversation] });
    }
  });

  // Mutation for deleting conversations
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest(`/api/ai-chat/conversations/${conversationId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (_, deletedId: string) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-chat/conversations'] });
      if (selectedConversation === deletedId) {
        setSelectedConversation(null);
        setShowConversationList(true);
      }
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
      setShowConversationList(false);
    }
  }, [conversations, selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    let conversationId = selectedConversation;
    
    // Create new conversation if none selected
    if (!conversationId) {
      const newConversation = await createConversationMutation.mutateAsync(messageInput.slice(0, 50));
      conversationId = newConversation.id;
    }
    
    if (conversationId) {
      sendMessageMutation.mutate({
        conversationId,
        content: messageInput
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mobile responsive layout
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      className="w-full h-full min-h-[600px] bg-background text-foreground flex flex-col"
      style={{
        backgroundColor: '#111827',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
      data-testid="ai-chatbot"
    >
      {/* Header with Conversation Toggle */}
      <div 
        className="w-full bg-gray-900 border-b border-red-900/30 flex items-center justify-between p-4"
        style={{ backgroundColor: '#1f2937', borderColor: 'rgba(220, 38, 38, 0.3)' }}
      >
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowConversationList(!showConversationList)}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            data-testid="toggle-conversations"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-yellow-400" />
            <h2 className="text-lg font-bold text-white">MoshBot AI</h2>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
        <Button
          onClick={() => createConversationMutation.mutate('New AI Chat')}
          disabled={createConversationMutation.isPending}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          data-testid="button-new-conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Collapsible Conversation List */}
      {showConversationList && (
        <div 
          className="w-full bg-gray-900 border-b border-red-900/30 max-h-48 overflow-y-auto"
          style={{ backgroundColor: '#1f2937', borderColor: 'rgba(220, 38, 38, 0.3)' }}
        >
          <div className="p-3">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
                <span className="ml-2 text-sm text-gray-400">Loading conversations...</span>
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">No conversations yet - create one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation.id);
                      setShowConversationList(false);
                    }}
                    className={`p-2 rounded cursor-pointer transition-all group ${
                      selectedConversation === conversation.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                    data-testid={`conversation-${conversation.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate text-xs">
                          {conversation.title}
                        </h3>
                        <p className="text-xs opacity-70">
                          {formatTime(conversation.updatedAt)}
                        </p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversationMutation.mutate(conversation.id);
                        }}
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        variant="ghost"
                        size="sm"
                        data-testid={`delete-conversation-${conversation.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Width Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center bg-black/20">
            <div className="text-center max-w-md mx-auto px-4">
              <Bot className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold text-white mb-2">Welcome to MoshBot!</h3>
              <p className="text-gray-400 mb-6">
                Your AI assistant for metal & rock music discovery
              </p>
              <Button
                onClick={() => createConversationMutation.mutate('New AI Chat')}
                disabled={createConversationMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white font-medium"
                data-testid="button-start-conversation"
              >
                {createConversationMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Start New Conversation
              </Button>
            </div>
          </div>
        ) : (
          <>

            {/* Messages - Full Width */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full max-w-none">
              {conversationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
                </div>
              ) : !currentConversation?.messages || currentConversation?.messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-yellow-400 opacity-50" />
                  <p className="text-gray-400">
                    Start the conversation! Ask me about bands, concerts, or anything metal! 🤘
                  </p>
                </div>
              ) : (
                currentConversation?.messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                    data-testid={`message-${message.id}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-red-600' 
                          : 'bg-yellow-400 text-black'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[90%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-red-600 text-white ml-auto'
                          : 'bg-gray-800 text-white'
                      }`}
                      style={{
                        backgroundColor: message.role === 'user' ? '#dc2626' : '#374151',
                        color: '#ffffff',
                        border: message.role === 'assistant' ? '1px solid rgba(251, 191, 36, 0.3)' : 'none'
                      }}
                    >
                      <p className="text-sm whitespace-pre-wrap" style={{ color: '#ffffff', lineHeight: '1.5' }}>
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user' 
                            ? 'text-red-200' 
                            : 'text-yellow-300'
                        }`}
                        style={{
                          color: message.role === 'user' ? '#fca5a5' : '#fde047',
                          opacity: 0.8
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {/* Typing indicator */}
              {sendMessageMutation.isPending && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Full Width */}
            <div 
              className="p-4 border-t border-red-900/30 bg-black/20 w-full"
              style={{ borderColor: 'rgba(220, 38, 38, 0.3)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            >
              <div className="flex gap-2 w-full max-w-none">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask MoshBot about bands, concerts, or anything metal..."
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-yellow-400 w-full"
                  data-testid="input-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white px-4"
                  data-testid="button-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}