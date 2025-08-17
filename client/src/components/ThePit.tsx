import { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';

interface PitMessage {
  id: string;
  authorName: string;
  title: string;
  content: string;
  category: 'general' | 'bands' | 'tours' | 'gear' | 'news';
  likes: number;
  replies: number;
  isPinned: boolean;
  createdAt: string;
}

interface PitReply {
  id: string;
  messageId: string;
  authorName: string;
  content: string;
  likes: number;
  createdAt: string;
}

export function ThePit() {
  const [messages, setMessages] = useState<PitMessage[]>([]);
  const [replies, setReplies] = useState<Record<string, PitReply[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'general' | 'bands' | 'tours' | 'gear' | 'news'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  // New message form state
  const [newMessage, setNewMessage] = useState({
    authorName: '',
    title: '',
    content: '',
    category: 'general' as const
  });

  // New reply form state
  const [newReply, setNewReply] = useState<Record<string, { authorName: string; content: string }>>({});

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/pit/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (messageId: string) => {
    try {
      const response = await fetch(`/api/pit/messages/${messageId}/replies`);
      if (response.ok) {
        const data = await response.json();
        setReplies(prev => ({ ...prev, [messageId]: data }));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.authorName.trim() || !newMessage.title.trim() || !newMessage.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/pit/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });

      if (response.ok) {
        setNewMessage({ authorName: '', title: '', content: '', category: 'general' });
        setShowNewMessageForm(false);
        fetchMessages();
      }
    } catch (error) {
      console.error('Error posting message:', error);
    }
  };

  const handleSubmitReply = async (messageId: string) => {
    const reply = newReply[messageId];
    if (!reply?.authorName.trim() || !reply?.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`/api/pit/messages/${messageId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reply)
      });

      if (response.ok) {
        setNewReply(prev => ({ ...prev, [messageId]: { authorName: '', content: '' } }));
        fetchReplies(messageId);
        fetchMessages(); // Refresh to update reply count
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleLikeMessage = async (messageId: string) => {
    try {
      await fetch(`/api/pit/messages/${messageId}/like`, { method: 'POST' });
      fetchMessages();
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const handleLikeReply = async (replyId: string, messageId: string) => {
    try {
      await fetch(`/api/pit/replies/${replyId}/like`, { method: 'POST' });
      fetchReplies(messageId);
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const filteredMessages = messages
    .filter(msg => filter === 'all' || msg.category === filter)
    .filter(msg => {
      if (!searchQuery) return true;
      return msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
             msg.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#9ca3af'
      }}>
        Loading The Pit...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '3rem',
          color: '#dc2626',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          letterSpacing: '0.1em'
        }}>
          THE PIT
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#9ca3af',
          marginBottom: '2rem'
        }}>
          Metal Community Message Board - Dive into the discussion
        </p>
      </header>

      <SearchBar 
        onSearch={setSearchQuery}
        placeholder="Search The Pit..."
        section="pit"
      />

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {(['all', 'general', 'bands', 'tours', 'gear', 'news'] as const).map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            style={{
              backgroundColor: filter === category ? '#dc2626' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (filter !== category) {
                e.currentTarget.style.backgroundColor = '#4b5563';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== category) {
                e.currentTarget.style.backgroundColor = '#374151';
              }
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => setShowNewMessageForm(!showNewMessageForm)}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }}
        >
          {showNewMessageForm ? 'Cancel' : 'Start New Thread'}
        </button>
      </div>

      {showNewMessageForm && (
        <div style={{
          backgroundColor: '#1f2937',
          border: '2px solid #dc2626',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            color: '#dc2626',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            Start New Thread
          </h3>
          <form onSubmit={handleSubmitMessage}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Your name/handle"
                value={newMessage.authorName}
                onChange={(e) => setNewMessage(prev => ({ ...prev, authorName: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Thread title"
                value={newMessage.title}
                onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <select
                value={newMessage.category}
                onChange={(e) => setNewMessage(prev => ({ ...prev, category: e.target.value as any }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="general">General Discussion</option>
                <option value="bands">Bands & Music</option>
                <option value="tours">Tours & Concerts</option>
                <option value="gear">Gear & Equipment</option>
                <option value="news">Metal News</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <textarea
                placeholder="What's on your mind?"
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#374151',
                  color: 'white',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Post Thread
            </button>
          </form>
        </div>
      )}

      <div style={{ space: '2rem' }}>
        {filteredMessages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '1.2rem',
            padding: '4rem 0'
          }}>
            {searchQuery ? 'No messages found matching your search.' : 'No messages yet. Start the conversation!'}
          </div>
        ) : (
          filteredMessages.map(message => (
            <div
              key={message.id}
              style={{
                backgroundColor: '#1f2937',
                border: message.isPinned ? '2px solid #fbbf24' : '1px solid #374151',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!message.isPinned) {
                  e.currentTarget.style.borderColor = '#dc2626';
                }
              }}
              onMouseLeave={(e) => {
                if (!message.isPinned) {
                  e.currentTarget.style.borderColor = '#374151';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {message.isPinned && (
                      <span style={{ color: '#fbbf24', fontSize: '1rem' }}>📌</span>
                    )}
                    <h3 style={{
                      fontSize: '1.3rem',
                      color: '#dc2626',
                      fontWeight: 'bold',
                      margin: 0
                    }}>
                      {message.title}
                    </h3>
                    <span style={{
                      backgroundColor: '#374151',
                      color: '#d1d5db',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      textTransform: 'capitalize'
                    }}>
                      {message.category}
                    </span>
                  </div>
                  <p style={{
                    color: '#9ca3af',
                    fontSize: '0.9rem',
                    margin: 0
                  }}>
                    by {message.authorName} • {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p style={{
                color: '#d1d5db',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                {message.content}
              </p>

              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <button
                  onClick={() => handleLikeMessage(message.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  👍 {message.likes}
                </button>

                <button
                  onClick={() => {
                    if (expandedMessage === message.id) {
                      setExpandedMessage(null);
                    } else {
                      setExpandedMessage(message.id);
                      fetchReplies(message.id);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  💬 {message.replies} {expandedMessage === message.id ? 'replies ▲' : 'replies ▼'}
                </button>
              </div>

              {expandedMessage === message.id && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #374151' }}>
                  {replies[message.id]?.map(reply => (
                    <div key={reply.id} style={{
                      backgroundColor: '#374151',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ color: '#f87171', fontWeight: '600' }}>{reply.authorName}</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ color: '#d1d5db', margin: '0 0 0.5rem 0' }}>{reply.content}</p>
                      <button
                        onClick={() => handleLikeReply(reply.id, message.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af';
                        }}
                      >
                        👍 {reply.likes}
                      </button>
                    </div>
                  ))}

                  <div style={{
                    backgroundColor: '#374151',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                  }}>
                    <h4 style={{ color: '#dc2626', marginBottom: '1rem' }}>Add Reply</h4>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Your name/handle"
                        value={newReply[message.id]?.authorName || ''}
                        onChange={(e) => setNewReply(prev => ({
                          ...prev,
                          [message.id]: { ...prev[message.id], authorName: e.target.value }
                        }))}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #6b7280',
                          backgroundColor: '#6b7280',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <textarea
                        placeholder="Your reply..."
                        value={newReply[message.id]?.content || ''}
                        onChange={(e) => setNewReply(prev => ({
                          ...prev,
                          [message.id]: { ...prev[message.id], content: e.target.value }
                        }))}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #6b7280',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleSubmitReply(message.id)}
                      style={{
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}