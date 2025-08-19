import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ObjectUploader } from './ObjectUploader';
import { 
  Users, 
  Send, 
  Plus, 
  Settings,
  UserMinus,
  Shield,
  Lock,
  Image,
  Video,
  Smile,
  MoreVertical,
  Crown,
  CheckCheck,
  Check,
  Clock
} from 'lucide-react';

interface GroupChat {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: string;
  memberCount: number;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderName: string;
  };
}

interface GroupMessage {
  id: string;
  groupChatId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  mediaUrl?: string;
  timestamp: string;
  isDelivered: boolean;
  isRead: boolean;
  isEncrypted: boolean;
  reactions: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
}

interface GroupMember {
  id: string;
  userId: string;
  userName: string;
  email?: string;
  role: 'creator' | 'admin' | 'member';
  joinedAt: string;
  isOnline: boolean;
}

export function GroupChat() {
  const { toast } = useToast();
  
  // State management
  const [currentUserId] = useState('demo-user-1');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  
  // Create group form state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupPrivate, setNewGroupPrivate] = useState(false);
  
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
      loadGroupMembers(selectedGroupId);
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
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('Disconnected from group chat WebSocket');
        // Auto-reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'group_message':
        if (data.groupChatId === selectedGroupId) {
          setMessages(prev => [...prev, data.message]);
        }
        break;
      case 'typing_indicator':
        if (data.groupChatId === selectedGroupId) {
          setIsTyping(data.isTyping);
        }
        break;
      case 'member_joined':
      case 'member_left':
        if (data.groupChatId === selectedGroupId) {
          loadGroupMembers(selectedGroupId);
        }
        break;
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

  const loadGroupMembers = async (groupId: string) => {
    try {
      const response = await fetch(`/api/group-chats/${groupId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error loading group members:', error);
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
          description: newGroupDescription,
          isPrivate: newGroupPrivate
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Group chat created successfully"
        });
        setNewGroupName('');
        setNewGroupDescription('');
        setNewGroupPrivate(false);
        setShowCreateGroup(false);
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
        // Message will be added via WebSocket
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

  const addReaction = async (messageId: string, emoji: string) => {
    if (!selectedGroupId) return;

    try {
      const response = await fetch(`/api/group-chats/${selectedGroupId}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });

      if (response.ok) {
        loadGroupMessages(selectedGroupId);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const addMember = async (email: string) => {
    if (!selectedGroupId) return;

    try {
      const response = await fetch(`/api/group-chats/${selectedGroupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member added to group"
        });
        loadGroupMembers(selectedGroupId);
      } else {
        throw new Error('Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (userId: string) => {
    if (!selectedGroupId) return;

    try {
      const response = await fetch(`/api/group-chats/${selectedGroupId}/members/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member removed from group"
        });
        loadGroupMembers(selectedGroupId);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive"
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedGroup = groupChats.find(g => g.id === selectedGroupId);
  const currentUserMember = members.find(m => m.userId === currentUserId);
  const isAdmin = currentUserMember?.role === 'creator' || currentUserMember?.role === 'admin';

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '✨'];

  return (
    <div className="flex h-[600px] bg-background border rounded-lg">
      {/* Group Chat Sidebar */}
      <div className="w-80 border-r bg-muted/20">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Group Chats</h2>
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-create-group">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Create Group Chat</h2>
                <div className="space-y-4">
                  <Input
                    placeholder="Group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    data-testid="input-group-name"
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    data-testid="input-group-description"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="private"
                      checked={newGroupPrivate}
                      onChange={(e) => setNewGroupPrivate(e.target.checked)}
                      data-testid="checkbox-group-private"
                    />
                    <label htmlFor="private">Private group</label>
                  </div>
                  <Button onClick={createGroupChat} className="w-full" data-testid="button-submit-group">
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {group.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
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
                  {group.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {group.lastMessage.senderName}: {group.lastMessage.content}
                    </p>
                  )}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedGroup.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{selectedGroup.name}</h3>
                      {selectedGroup.isPrivate && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Shield className="h-4 w-4 text-green-500" title="End-to-end encrypted" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {members.length} members
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <Dialog open={showGroupSettings} onOpenChange={setShowGroupSettings}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-group-settings">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Group Settings</h2>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Members ({members.length})</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>{member.userName.substring(0, 1)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{member.userName}</span>
                                  {member.role === 'creator' && <Crown className="h-4 w-4 text-yellow-500" />}
                                  {member.role === 'admin' && <Shield className="h-4 w-4 text-blue-500" />}
                                </div>
                                {member.role !== 'creator' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeMember(member.userId)}
                                    data-testid={`button-remove-${member.userId}`}
                                  >
                                    <UserMinus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Add Member</h4>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Enter email address"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const target = e.target as HTMLInputElement;
                                  addMember(target.value);
                                  target.value = '';
                                }
                              }}
                              data-testid="input-add-member"
                            />
                            <Button
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addMember(input.value);
                                input.value = '';
                              }}
                              data-testid="button-add-member"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    message.senderId === currentUserId ? 'order-2' : 'order-1'
                  }`}>
                    <div className={`p-3 rounded-lg ${
                      message.senderId === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {message.senderId !== currentUserId && (
                        <p className="text-xs font-medium mb-1">{message.senderName}</p>
                      )}
                      
                      {message.messageType === 'text' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      {message.messageType === 'image' && message.mediaUrl && (
                        <div>
                          <img 
                            src={message.mediaUrl} 
                            alt="Shared image" 
                            className="max-w-full rounded"
                          />
                          {message.content && <p className="text-sm mt-2">{message.content}</p>}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        <div className="flex items-center space-x-1">
                          {message.isEncrypted && (
                            <Lock className="h-3 w-3 opacity-70" />
                          )}
                          {message.senderId === currentUserId && (
                            message.isRead ? 
                              <CheckCheck className="h-3 w-3 text-blue-500" /> :
                              message.isDelivered ?
                                <Check className="h-3 w-3" /> :
                                <Clock className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Reactions */}
                    {message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {message.reactions.map((reaction, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reaction.emoji} {reaction.userName}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Quick reactions */}
                    <div className="flex space-x-1 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                      {commonEmojis.slice(0, 4).map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(message.id, emoji)}
                          className="text-xs hover:bg-muted rounded p-1"
                          data-testid={`reaction-${emoji}-${message.id}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-muted/20">
              <div className="flex space-x-2">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={10485760}
                  onGetUploadParameters={async () => {
                    const response = await fetch('/api/objects/upload', { method: 'POST' });
                    const data = await response.json();
                    return { method: 'PUT' as const, url: data.uploadURL };
                  }}
                  onComplete={(result) => {
                    if (result.successful.length > 0) {
                      const file = result.successful[0];
                      // Send message with media
                      fetch(`/api/group-chats/${selectedGroupId}/messages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          content: file.name,
                          messageType: file.type.startsWith('image/') ? 'image' : 'file',
                          mediaUrl: file.uploadURL
                        })
                      });
                    }
                  }}
                  buttonClassName="shrink-0"
                >
                  <Image className="h-4 w-4" />
                </ObjectUploader>

                <Textarea
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
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
              
              {/* Quick emoji reactions */}
              <div className="flex space-x-1 mt-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewMessage(prev => prev + emoji)}
                    className="text-lg hover:bg-muted rounded p-1"
                    data-testid={`emoji-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>Select a group chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}