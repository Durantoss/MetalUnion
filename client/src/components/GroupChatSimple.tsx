import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Send, 
  Plus, 
  Settings,
  Shield,
  Lock,
  MessageCircle
} from 'lucide-react';

interface GroupChat {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: string;
  memberCount: number;
}

interface GroupMessage {
  id: string;
  groupChatId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isEncrypted: boolean;
}

export function GroupChatSimple() {
  const { toast } = useToast();
  
  // State management
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGroupChats();
    connectWebSocket();
    
    return () => {
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupMessages(selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/chat-ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('Connected to group chat WebSocket');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'group_message' && data.groupChatId === selectedGroupId) {
            setMessages(prev => [...prev, data.message]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('Disconnected from group chat WebSocket');
        setTimeout(connectWebSocket, 3000);
      };
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const loadGroupChats = async () => {
    try {
      const response = await fetch('/api/group-chats');
      if (response.ok) {
        const data = await response.json();
        setGroupChats(data.groupChats || []);
      }
    } catch (error) {
      console.error('Error loading group chats:', error);
    }
  };

  const loadGroupMessages = async (groupId: string) => {
    try {
      const response = await fetch(`/api/group-chats/${groupId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading group messages:', error);
    }
  };

  const createGroupChat = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/group-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: '',
          isPrivate: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Group chat created successfully"
        });
        setNewGroupName('');
        setShowCreateForm(false);
        loadGroupChats();
        setSelectedGroupId(data.groupChat.id);
      } else {
        throw new Error('Failed to create group chat');
      }
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedGroupId) return;

    try {
      const response = await fetch(`/api/group-chats/${selectedGroupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          messageType: 'text'
        })
      });

      if (response.ok) {
        setNewMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectedGroup = groupChats.find(g => g.id === selectedGroupId);

  return (
    <div className="flex h-[600px] bg-background border rounded-lg">
      {/* Group Chat Sidebar */}
      <div className="w-80 border-r bg-muted/20">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Group Chats</h2>
            <Button 
              size="sm" 
              onClick={() => setShowCreateForm(!showCreateForm)}
              data-testid="button-create-group"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Create Group Form */}
          {showCreateForm && (
            <div className="mt-4 space-y-2">
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                data-testid="input-group-name"
              />
              <div className="flex space-x-2">
                <Button 
                  onClick={createGroupChat} 
                  size="sm"
                  data-testid="button-submit-group"
                >
                  Create
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Group List */}
        <div className="overflow-y-auto">
          {groupChats.map((group) => (
            <div
              key={group.id}
              className={`p-3 border-b cursor-pointer hover:bg-muted/40 ${
                selectedGroupId === group.id ? 'bg-muted/60' : ''
              }`}
              onClick={() => setSelectedGroupId(group.id)}
              data-testid={`group-item-${group.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    {group.name.substring(0, 2).toUpperCase()}
                  </div>
                  {group.isPrivate && (
                    <Lock className="h-3 w-3 absolute -top-1 -right-1 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{group.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {group.memberCount}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {selectedGroup.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{selectedGroup.name}</h3>
                    {selectedGroup.isPrivate && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Shield className="h-4 w-4 text-green-500" title="End-to-end encrypted" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedGroup.memberCount} members
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'demo-user-1' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                    message.senderId === 'demo-user-1'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    {message.senderId !== 'demo-user-1' && (
                      <p className="text-xs font-medium mb-1">{message.senderName}</p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {message.isEncrypted && (
                        <Lock className="h-3 w-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-muted/20">
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 min-h-[40px] max-h-32 resize-none"
                  data-testid="input-message"
                />
                
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim()}
                  className="shrink-0"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>Select a group chat to start messaging</p>
              <p className="text-sm mt-2">Or create a new group to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}