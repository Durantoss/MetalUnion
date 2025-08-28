import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Send, Users, Smile, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  content: string;
  messageType: string;
  createdAt: string;
  isEdited: boolean;
  user: {
    id: string;
    stagename: string;
    profileImageUrl?: string;
    isOnline: boolean;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  topic?: string;
  description?: string;
  isActive: boolean;
  maxUsers: number;
  currentUsers: number;
}

interface OnlineUser {
  id: string;
  stagename: string;
  profileImageUrl?: string;
  isOnline: boolean;
  lastSeen: string;
}

interface LiveChatProps {
  currentUser?: {
    id: string;
    stagename: string;
    profileImageUrl?: string;
  };
}

export function LiveChat({ currentUser }: LiveChatProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>('general');
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  // Query for chat rooms
  const { data: rooms = [] } = useQuery<ChatRoom[]>({
    queryKey: ['/api/chat/rooms'],
    enabled: !!currentUser
  });

  // Query for chat messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages', selectedRoom],
    enabled: !!currentUser && !!selectedRoom
  });

  // Query for online users
  const { data: onlineUsers = [] } = useQuery<OnlineUser[]>({
    queryKey: ['/api/chat/rooms', selectedRoom, 'users'],
    enabled: !!currentUser && !!selectedRoom
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('/api/chat/messages', {
        method: 'POST',
        body: { content, roomId: selectedRoom, messageType: 'text' }
      });
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', selectedRoom] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    }
  });

  // WebSocket connection
  useEffect(() => {
    if (!currentUser || !selectedRoom) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/chat-ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Chat WebSocket connected');
      setIsConnected(true);
      
      // Join the selected room
      ws.send(JSON.stringify({
        type: 'join_room',
        payload: {
          userId: currentUser.id,
          roomId: selectedRoom,
          stagename: currentUser.stagename
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'leave_room',
          payload: { userId: currentUser.id }
        }));
      }
      ws.close();
    };
  }, [currentUser, selectedRoom]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_message':
        // Add the new message to the chat
        queryClient.setQueryData(
          ['/api/chat/messages', selectedRoom],
          (oldMessages: ChatMessage[] = []) => [...oldMessages, data.message]
        );
        break;
      case 'user_joined':
        setOnlineCount(prev => prev + 1);
        queryClient.invalidateQueries({ queryKey: ['/api/chat/rooms', selectedRoom, 'users'] });
        break;
      case 'user_left':
        setOnlineCount(prev => Math.max(0, prev - 1));
        queryClient.invalidateQueries({ queryKey: ['/api/chat/rooms', selectedRoom, 'users'] });
        break;
      case 'room_joined':
        console.log('Successfully joined room:', data.roomId);
        break;
      case 'error':
        console.error('Chat error:', data.message);
        break;
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentUser) return;
    
    sendMessageMutation.mutate(messageInput.trim());
  };

  // Handle room change
  const handleRoomChange = (roomId: string) => {
    if (roomId === selectedRoom) return;
    setSelectedRoom(roomId);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get profile image or fallback
  const getProfileImage = (user: any) => {
    return user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.stagename}`;
  };

  if (!currentUser) {
    return (
      <div className="bg-black/80 border border-red-600/30 rounded-lg p-8 text-center">
        <h3 className="text-red-500 text-lg font-bold mb-2">Join The Conversation</h3>
        <p className="text-gray-400">Sign in to participate in live chat with the metal community</p>
      </div>
    );
  }

  return (
    <div className="bg-black/90 border border-red-600/30 rounded-lg overflow-hidden" style={{ height: '600px' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600/20 to-black p-4 border-b border-red-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-white font-bold text-lg">The Pit Live Chat</h3>
            <span className="text-red-400 text-sm">
              {isConnected ? `${onlineUsers.length} online` : 'Connecting...'}
            </span>
          </div>
          <Users className="text-red-400" size={20} />
        </div>
      </div>

      <div className="flex h-full">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '440px' }}>
            {messagesLoading ? (
              <div className="text-center text-gray-400 py-8">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-3 group hover:bg-red-600/5 rounded-lg p-2 transition-colors">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <img
                      src={getProfileImage(message.user)}
                      alt={message.user.stagename}
                      className="w-10 h-10 rounded-full border-2 border-red-600/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user.stagename}`;
                      }}
                    />
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-red-400">{message.user.stagename}</span>
                      <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                      {message.user.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-white break-words">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-red-600/30 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-black/50 border-red-600/30 text-white placeholder-gray-400 focus:border-red-500"
                maxLength={500}
                disabled={!isConnected || sendMessageMutation.isPending}
              />
              <Button
                type="submit"
                disabled={!messageInput.trim() || !isConnected || sendMessageMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4"
                data-testid="button-send-message"
              >
                <Send size={18} />
              </Button>
            </form>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
              <span>{messageInput.length}/500</span>
            </div>
          </div>
        </div>

        {/* Online Users Sidebar */}
        <div className="w-48 border-l border-red-600/30 bg-black/50">
          <div className="p-3 border-b border-red-600/30">
            <h4 className="text-white font-semibold text-sm">Online ({onlineUsers.length})</h4>
          </div>
          <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: '500px' }}>
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2 p-2 rounded hover:bg-red-600/10 transition-colors">
                <img
                  src={getProfileImage(user)}
                  alt={user.stagename}
                  className="w-6 h-6 rounded-full border border-red-600/30"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.stagename}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs truncate">{user.stagename}</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}