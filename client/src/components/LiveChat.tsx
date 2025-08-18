import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Send, Users, Settings, Smile, Reply, Heart, Flame, Music } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  messageType: 'text' | 'emoji' | 'system';
  replyToId?: string;
  replyToContent?: string;
  timestamp: string;
  reactions?: { [emoji: string]: number };
  userReaction?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  currentUsers: number;
  maxUsers: number;
  isActive: boolean;
}

interface OnlineUser {
  id: string;
  username: string;
  isOnline: boolean;
  role: 'admin' | 'moderator' | 'member';
}

const quickReactions = [
  '🔥', '🤘', '❤️', '💀', '⚡', '🎸', '🥁', '🎤'
];

const quickEmojis = [
  '😀', '😂', '😍', '🤔', '👍', '👎', '🎉', '💯'
];

export function LiveChat({ roomId, currentUser }: { roomId: string; currentUser?: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomInfo, setRoomInfo] = useState<ChatRoom | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadRoomData();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRoomData = async () => {
    try {
      // Load room info
      const roomRes = await fetch(`/api/chat/rooms/${roomId}`);
      if (roomRes.ok) {
        const room = await roomRes.json();
        setRoomInfo(room);
      } else {
        // Mock data for demonstration
        setRoomInfo({
          id: roomId,
          name: 'General Chat',
          topic: 'general',
          currentUsers: 47,
          maxUsers: 100,
          isActive: true
        });
      }

      // Load messages
      const messagesRes = await fetch(`/api/chat/rooms/${roomId}/messages`);
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      } else {
        // Mock data for demonstration
        setMessages([
          {
            id: '1',
            userId: 'u1',
            username: 'MetalMaster',
            content: 'Hey everyone! Just discovered this amazing black metal band from Norway 🔥',
            messageType: 'text',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            reactions: { '🔥': 3, '🤘': 2 }
          },
          {
            id: '2',
            userId: 'u2',
            username: 'VikingWarrior',
            content: 'Which band? Always looking for new Norwegian black metal!',
            messageType: 'text',
            timestamp: new Date(Date.now() - 240000).toISOString()
          },
          {
            id: '3',
            userId: 'u1',
            username: 'MetalMaster',
            content: 'Darkthrone - specifically their album "Transilvanian Hunger". Absolutely brutal!',
            messageType: 'text',
            replyToId: '2',
            replyToContent: 'Which band? Always looking for new Norwegian black metal!',
            timestamp: new Date(Date.now() - 180000).toISOString(),
            reactions: { '💀': 1, '⚡': 2 }
          }
        ]);
      }

      // Load online users
      const usersRes = await fetch(`/api/chat/rooms/${roomId}/users`);
      if (usersRes.ok) {
        const users = await usersRes.json();
        setOnlineUsers(users);
      } else {
        // Mock data for demonstration
        setOnlineUsers([
          { id: 'u1', username: 'MetalMaster', isOnline: true, role: 'moderator' },
          { id: 'u2', username: 'VikingWarrior', isOnline: true, role: 'member' },
          { id: 'u3', username: 'BlackenedSoul', isOnline: true, role: 'member' },
          { id: 'u4', username: 'DeathVocalist', isOnline: true, role: 'member' }
        ]);
      }

    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };

  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:5000/ws/chat/${roomId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('Connected to chat room');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          setMessages(prev => [...prev, data.message]);
        } else if (data.type === 'user_joined') {
          setOnlineUsers(prev => [...prev, data.user]);
        } else if (data.type === 'user_left') {
          setOnlineUsers(prev => prev.filter(u => u.id !== data.userId));
        } else if (data.type === 'reaction_added') {
          setMessages(prev => prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, reactions: data.reactions }
              : msg
          ));
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from chat room');
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const messageData = {
      content: newMessage,
      messageType: 'text',
      replyToId: replyingTo?.id,
    };

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        setNewMessage('');
        setReplyingTo(null);
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // For demo purposes, add message locally
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        userId: currentUser.id || 'demo',
        username: currentUser.stagename || 'DemoUser',
        content: newMessage,
        messageType: 'text',
        replyToId: replyingTo?.id,
        replyToContent: replyingTo?.content,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setReplyingTo(null);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });

      if (!response.ok) {
        // For demo purposes, update locally
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            const reactions = { ...msg.reactions };
            reactions[emoji] = (reactions[emoji] || 0) + 1;
            return { ...msg, reactions, userReaction: emoji };
          }
          return msg;
        }));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!roomInfo) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#9ca3af'
      }}>
        Loading chat room...
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      border: '1px solid rgba(153, 27, 27, 0.3)',
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid rgba(153, 27, 27, 0.3)',
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(0, 0, 0, 0.3))'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#dc2626', fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              💬 {roomInfo.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: isConnected ? '#10b981' : '#ef4444'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#10b981' : '#ef4444'
                }} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              <span>👥 {roomInfo.currentUsers} users</span>
              <span>🏷️ {roomInfo.topic.replace(/_/g, ' ')}</span>
            </div>
          </div>
          <Button
            style={{
              backgroundColor: 'rgba(75, 85, 99, 0.2)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              color: '#9ca3af'
            }}
            data-testid="button-chat-settings"
          >
            <Settings size={16} />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
            data-testid={`message-${message.id}`}
          >
            {/* Reply Context */}
            {message.replyToContent && (
              <div style={{
                marginLeft: '2rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(75, 85, 99, 0.2)',
                borderLeft: '3px solid rgba(220, 38, 38, 0.5)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: '#9ca3af'
              }}>
                <Reply size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                {message.replyToContent}
              </div>
            )}

            {/* Message Content */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              {/* Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(220, 38, 38, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                flexShrink: 0
              }}>
                {message.username.charAt(0).toUpperCase()}
              </div>

              {/* Message Body */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#facc15', fontSize: '0.9rem', fontWeight: '600' }}>
                    {message.username}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <p style={{ color: '#d1d5db', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>
                  {message.content}
                </p>

                {/* Reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.25rem', 
                    marginTop: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    {Object.entries(message.reactions).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(message.id, emoji)}
                        style={{
                          backgroundColor: 'rgba(220, 38, 38, 0.2)',
                          border: '1px solid rgba(220, 38, 38, 0.3)',
                          borderRadius: '12px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: '#d1d5db'
                        }}
                        data-testid={`reaction-${message.id}-${emoji}`}
                      >
                        {emoji} {count}
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Actions */}
                <div style={{
                  opacity: 0.7,
                  marginTop: '0.5rem',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => setReplyingTo(message)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    data-testid={`button-reply-${message.id}`}
                  >
                    <Reply size={12} />
                    Reply
                  </button>
                  {quickReactions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(message.id, emoji)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        padding: '0.125rem'
                      }}
                      data-testid={`quick-reaction-${message.id}-${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid rgba(153, 27, 27, 0.3)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }}>
        {/* Reply Preview */}
        {replyingTo && (
          <div style={{
            marginBottom: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(75, 85, 99, 0.2)',
            borderLeft: '3px solid rgba(220, 38, 38, 0.5)',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: '#9ca3af',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              <Reply size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Replying to {replyingTo.username}: {replyingTo.content.substring(0, 50)}...
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer'
              }}
              data-testid="button-cancel-reply"
            >
              ✕
            </button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div style={{
            marginBottom: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(75, 85, 99, 0.3)'
          }}>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {[...quickReactions, ...quickEmojis].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0.25rem',
                    borderRadius: '4px'
                  }}
                  data-testid={`emoji-${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              backgroundColor: 'rgba(75, 85, 99, 0.2)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              borderRadius: '6px',
              padding: '0.5rem',
              color: '#9ca3af',
              cursor: 'pointer'
            }}
            data-testid="button-emoji-picker"
          >
            <Smile size={16} />
          </button>
          
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              borderRadius: '6px',
              padding: '0.75rem',
              color: '#d1d5db',
              fontSize: '0.9rem',
              resize: 'none',
              minHeight: '40px',
              maxHeight: '120px'
            }}
            data-testid="input-message"
          />
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            style={{
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              color: '#dc2626'
            }}
            data-testid="button-send-message"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Online Users Sidebar (could be toggleable) */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '200px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderLeft: '1px solid rgba(153, 27, 27, 0.3)',
        padding: '1rem',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
        // Add state to show/hide this sidebar
      }}>
        <h4 style={{ color: '#facc15', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>
          <Users size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Online ({onlineUsers.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem'
              }}
              data-testid={`online-user-${user.id}`}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: user.isOnline ? '#10b981' : '#6b7280'
              }} />
              <span style={{ 
                color: '#d1d5db', 
                fontSize: '0.8rem',
                flex: 1
              }}>
                {user.username}
              </span>
              {user.role === 'admin' && <span style={{ color: '#dc2626' }}>👑</span>}
              {user.role === 'moderator' && <span style={{ color: '#facc15' }}>⚡</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}