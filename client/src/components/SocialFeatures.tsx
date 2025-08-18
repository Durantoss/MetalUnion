import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Users, MessageCircle, Heart, UserPlus, Crown, Star, Coffee, Music, Camera, Flame, ThumbsUp, Zap } from 'lucide-react';

interface User {
  id: string;
  stagename: string;
  profileImageUrl?: string;
  isOnline: boolean;
  reputationPoints: number;
  badges: string[];
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isPrivate: boolean;
  avatarUrl?: string;
  tags: string[];
}

interface MentorData {
  id: string;
  userId: string;
  stagename: string;
  bio: string;
  expertise: string[];
  experience: string;
  rating: number;
  totalSessions: number;
  profileImageUrl?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  currentUsers: number;
  maxUsers: number;
  isActive: boolean;
}

interface FriendRequest {
  id: string;
  senderId: string;
  senderStagename: string;
  senderProfileImage?: string;
  message?: string;
  createdAt: string;
}

interface SocialConnection {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  isVerified: boolean;
  followerCount?: number;
}

const reactionEmojis = [
  { id: '1', emoji: '🔥', name: 'fire', category: 'emotion' },
  { id: '2', emoji: '🤘', name: 'rock', category: 'music' },
  { id: '3', emoji: '💀', name: 'skull', category: 'metal' },
  { id: '4', emoji: '⚡', name: 'lightning', category: 'energy' },
  { id: '5', emoji: '🎸', name: 'guitar', category: 'music' },
  { id: '6', emoji: '❤️', name: 'heart', category: 'emotion' },
  { id: '7', emoji: '🤯', name: 'mind-blown', category: 'emotion' },
  { id: '8', emoji: '👹', name: 'demon', category: 'metal' }
];

export function SocialFeatures({ userId }: { userId?: string }) {
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, [userId]);

  const loadSocialData = async () => {
    try {
      // Load groups
      const groupsRes = await fetch('/api/groups');
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData);
      } else {
        // Mock data for demonstration
        setGroups([
          {
            id: '1',
            name: 'Death Metal Enthusiasts',
            description: 'For fans of brutal and technical death metal',
            memberCount: 1247,
            category: 'genre',
            isPrivate: false,
            tags: ['death-metal', 'brutal', 'technical']
          },
          {
            id: '2',
            name: 'Local Metal Scene - NYC',
            description: 'Connect with metalheads in New York City',
            memberCount: 589,
            category: 'location',
            isPrivate: false,
            tags: ['nyc', 'local', 'shows']
          },
          {
            id: '3',
            name: 'Concert Photography',
            description: 'Share and discuss metal concert photography',
            memberCount: 823,
            category: 'interest',
            isPrivate: false,
            tags: ['photography', 'concerts', 'art']
          }
        ]);
      }

      // Load mentors
      const mentorsRes = await fetch('/api/mentors');
      if (mentorsRes.ok) {
        const mentorsData = await mentorsRes.json();
        setMentors(mentorsData);
      } else {
        // Mock data for demonstration
        setMentors([
          {
            id: '1',
            userId: 'u1',
            stagename: 'MetalMaster2000',
            bio: 'Been in the metal scene for 15+ years. Happy to help newcomers discover great bands and navigate concert etiquette.',
            expertise: ['band_discovery', 'concert_etiquette', 'venue_knowledge'],
            experience: 'expert',
            rating: 4.8,
            totalSessions: 127
          },
          {
            id: '2',
            userId: 'u2',
            stagename: 'ConcertPhotoGuru',
            bio: 'Professional concert photographer specializing in metal shows. Can teach you the basics of pit photography.',
            expertise: ['concert_photography', 'equipment', 'venue_access'],
            experience: 'expert',
            rating: 4.9,
            totalSessions: 89
          }
        ]);
      }

      // Load chat rooms
      const chatRes = await fetch('/api/chat/rooms');
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setChatRooms(chatData);
      } else {
        // Mock data for demonstration
        setChatRooms([
          { id: '1', name: 'General Chat', topic: 'general', currentUsers: 47, maxUsers: 100, isActive: true },
          { id: '2', name: 'Show Reviews', topic: 'concert_discussion', currentUsers: 23, maxUsers: 50, isActive: true },
          { id: '3', name: 'Band Recommendations', topic: 'band_discussion', currentUsers: 31, maxUsers: 75, isActive: true }
        ]);
      }

      // Load friend requests
      if (userId) {
        const friendReqRes = await fetch(`/api/friend-requests/${userId}`);
        if (friendReqRes.ok) {
          const friendReqData = await friendReqRes.json();
          setFriendRequests(friendReqData);
        } else {
          // Mock data for demonstration
          setFriendRequests([
            {
              id: '1',
              senderId: 'u3',
              senderStagename: 'RiffMaster',
              message: 'Hey! Saw your review of the new Gojira album. Great taste!',
              createdAt: '2025-01-18T10:30:00Z'
            }
          ]);
        }

        // Load social connections
        const socialRes = await fetch(`/api/social-connections/${userId}`);
        if (socialRes.ok) {
          const socialData = await socialRes.json();
          setSocialConnections(socialData);
        } else {
          // Mock data for demonstration
          setSocialConnections([
            { id: '1', platform: 'instagram', username: 'metalhead_photos', profileUrl: 'https://instagram.com/metalhead_photos', isVerified: true, followerCount: 2847 },
            { id: '2', platform: 'spotify', username: 'MetalMix2025', profileUrl: 'https://open.spotify.com/user/metalmix2025', isVerified: false }
          ]);
        }
      }

      // Load online users
      const onlineRes = await fetch('/api/users/online');
      if (onlineRes.ok) {
        const onlineData = await onlineRes.json();
        setOnlineUsers(onlineData);
      } else {
        // Mock data for demonstration
        setOnlineUsers([
          { id: '1', stagename: 'DeathVocalist', isOnline: true, reputationPoints: 2847, badges: ['veteran', 'photographer'] },
          { id: '2', stagename: 'BlackenedSoul', isOnline: true, reputationPoints: 1923, badges: ['reviewer', 'traveler'] },
          { id: '3', stagename: 'ProgMetal4Life', isOnline: true, reputationPoints: 3156, badges: ['expert', 'mentor'] }
        ]);
      }

    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        loadSocialData(); // Reload to get updated member count
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const sendFriendRequest = async (receiverId: string, message: string) => {
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, message })
      });
      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const joinChatRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/join`, {
        method: 'POST'
      });
      if (response.ok) {
        // Navigate to chat room or open in modal
      }
    } catch (error) {
      console.error('Error joining chat room:', error);
    }
  };

  const requestMentorship = async (mentorId: string, focus: string[]) => {
    try {
      const response = await fetch('/api/mentorship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId, focus })
      });
      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error requesting mentorship:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#9ca3af'
      }}>
        Loading social features...
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
      borderRadius: '12px', 
      border: '1px solid rgba(153, 27, 27, 0.3)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid rgba(153, 27, 27, 0.3)',
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(0, 0, 0, 0.3))'
      }}>
        <h2 style={{
          color: '#dc2626',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Users size={24} />
          🌐 ENHANCED SOCIAL HUB
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          Connect, collaborate, and grow with the metal community
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(153, 27, 27, 0.3)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }}>
        {[
          { id: 'groups', label: 'Groups', icon: Users },
          { id: 'mentors', label: 'Mentors', icon: Crown },
          { id: 'chat', label: 'Live Chat', icon: MessageCircle },
          { id: 'friends', label: 'Friends', icon: UserPlus },
          { id: 'social', label: 'Connections', icon: Star }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '1rem',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'rgba(220, 38, 38, 0.2)' : 'transparent',
                color: activeTab === tab.id ? '#facc15' : '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                borderBottom: activeTab === tab.id ? '2px solid #dc2626' : '2px solid transparent'
              }}
              data-testid={`tab-${tab.id}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <h3 style={{ color: '#facc15', fontSize: '1.2rem', fontWeight: '600' }}>
                🎸 Music Communities
              </h3>
              <Button
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid rgba(220, 38, 38, 0.5)',
                  color: '#dc2626'
                }}
                data-testid="button-create-group"
              >
                Create Group
              </Button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {groups.map((group) => (
                <div
                  key={group.id}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '8px',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease'
                  }}
                  data-testid={`group-card-${group.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#d1d5db', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {group.name}
                      </h4>
                      <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {group.description}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {group.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              backgroundColor: 'rgba(220, 38, 38, 0.2)',
                              color: '#dc2626',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                        <span>👥 {group.memberCount.toLocaleString()} members</span>
                        <span>📂 {group.category}</span>
                        {group.isPrivate && <span>🔒 Private</span>}
                      </div>
                    </div>
                    <Button
                      onClick={() => joinGroup(group.id)}
                      style={{
                        backgroundColor: 'rgba(250, 204, 21, 0.2)',
                        border: '1px solid rgba(250, 204, 21, 0.5)',
                        color: '#facc15',
                        marginLeft: '1rem'
                      }}
                      data-testid={`button-join-group-${group.id}`}
                    >
                      Join Group
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentors Tab */}
        {activeTab === 'mentors' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <h3 style={{ color: '#facc15', fontSize: '1.2rem', fontWeight: '600' }}>
                👑 Community Mentors
              </h3>
              <Button
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid rgba(220, 38, 38, 0.5)',
                  color: '#dc2626'
                }}
                data-testid="button-become-mentor"
              >
                Become a Mentor
              </Button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '8px',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    padding: '1.5rem'
                  }}
                  data-testid={`mentor-card-${mentor.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(220, 38, 38, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem'
                        }}>
                          👤
                        </div>
                        <div>
                          <h4 style={{ color: '#d1d5db', fontSize: '1.1rem', fontWeight: '600' }}>
                            {mentor.stagename}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15' }}>
                            <Star size={16} fill="currentColor" />
                            <span>{mentor.rating.toFixed(1)}</span>
                            <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                              ({mentor.totalSessions} sessions)
                            </span>
                          </div>
                        </div>
                      </div>
                      <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {mentor.bio}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {mentor.expertise.map((skill) => (
                          <span
                            key={skill}
                            style={{
                              backgroundColor: 'rgba(250, 204, 21, 0.2)',
                              color: '#facc15',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem'
                            }}
                          >
                            {skill.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => requestMentorship(mentor.id, ['general'])}
                      style={{
                        backgroundColor: 'rgba(250, 204, 21, 0.2)',
                        border: '1px solid rgba(250, 204, 21, 0.5)',
                        color: '#facc15',
                        marginLeft: '1rem'
                      }}
                      data-testid={`button-request-mentorship-${mentor.id}`}
                    >
                      Request Mentorship
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Chat Tab */}
        {activeTab === 'chat' && (
          <div>
            <h3 style={{ color: '#facc15', fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              💬 Live Chat Rooms
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {chatRooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '8px',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  data-testid={`chat-room-${room.id}`}
                >
                  <div>
                    <h4 style={{ color: '#d1d5db', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {room.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontSize: '0.9rem' }}>
                      <span>👥 {room.currentUsers}/{room.maxUsers}</span>
                      <span>🏷️ {room.topic.replace(/_/g, ' ')}</span>
                      <span style={{ 
                        color: room.isActive ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: room.isActive ? '#10b981' : '#ef4444'
                        }} />
                        {room.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => joinChatRoom(room.id)}
                    disabled={!room.isActive || room.currentUsers >= room.maxUsers}
                    style={{
                      backgroundColor: 'rgba(220, 38, 38, 0.2)',
                      border: '1px solid rgba(220, 38, 38, 0.5)',
                      color: '#dc2626'
                    }}
                    data-testid={`button-join-chat-${room.id}`}
                  >
                    Join Chat
                  </Button>
                </div>
              ))}
            </div>

            {/* Online Users */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#facc15', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                🟢 Online Now ({onlineUsers.length})
              </h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: '1px solid rgba(75, 85, 99, 0.3)'
                    }}
                    data-testid={`online-user-${user.id}`}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981'
                    }} />
                    <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>{user.stagename}</span>
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>({user.reputationPoints})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div>
            <h3 style={{ color: '#facc15', fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              👥 Friend Requests
            </h3>
            
            {friendRequests.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {friendRequests.map((request) => (
                  <div
                    key={request.id}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '8px',
                      border: '1px solid rgba(75, 85, 99, 0.3)',
                      padding: '1.5rem'
                    }}
                    data-testid={`friend-request-${request.id}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#d1d5db', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                          {request.senderStagename}
                        </h4>
                        {request.message && (
                          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            "{request.message}"
                          </p>
                        )}
                        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                        <Button
                          style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            border: '1px solid rgba(34, 197, 94, 0.5)',
                            color: '#22c55e'
                          }}
                          data-testid={`button-accept-${request.id}`}
                        >
                          Accept
                        </Button>
                        <Button
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#ef4444'
                          }}
                          data-testid={`button-decline-${request.id}`}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#9ca3af',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(75, 85, 99, 0.3)'
              }}>
                <UserPlus size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No pending friend requests</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Connect with other metalheads by exploring groups and chat rooms!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Social Connections Tab */}
        {activeTab === 'social' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <h3 style={{ color: '#facc15', fontSize: '1.2rem', fontWeight: '600' }}>
                🔗 Social Media Connections
              </h3>
              <Button
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid rgba(220, 38, 38, 0.5)',
                  color: '#dc2626'
                }}
                data-testid="button-add-connection"
              >
                Add Platform
              </Button>
            </div>
            
            {socialConnections.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {socialConnections.map((connection) => (
                  <div
                    key={connection.id}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '8px',
                      border: '1px solid rgba(75, 85, 99, 0.3)',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    data-testid={`social-connection-${connection.id}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(220, 38, 38, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}>
                        {connection.platform === 'instagram' && '📷'}
                        {connection.platform === 'spotify' && '🎵'}
                        {connection.platform === 'youtube' && '📺'}
                        {connection.platform === 'twitter' && '🐦'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ color: '#d1d5db', fontSize: '1rem', fontWeight: '600' }}>
                            @{connection.username}
                          </h4>
                          {connection.isVerified && (
                            <span style={{ color: '#3b82f6', fontSize: '1rem' }}>✓</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                          <span style={{ textTransform: 'capitalize' }}>{connection.platform}</span>
                          {connection.followerCount && (
                            <span>👥 {connection.followerCount.toLocaleString()} followers</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.open(connection.profileUrl, '_blank')}
                      style={{
                        backgroundColor: 'rgba(250, 204, 21, 0.2)',
                        border: '1px solid rgba(250, 204, 21, 0.5)',
                        color: '#facc15'
                      }}
                      data-testid={`button-view-profile-${connection.id}`}
                    >
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem', 
                color: '#9ca3af',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(75, 85, 99, 0.3)'
              }}>
                <Star size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No social media connections</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Connect your social media profiles to showcase your metal journey!
                </p>
              </div>
            )}

            {/* Enhanced Reaction System Preview */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: '#facc15', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                🎯 Enhanced Reactions
              </h4>
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                padding: '1rem'
              }}>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Express yourself with metal-themed reactions:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {reactionEmojis.map((reaction) => (
                    <button
                      key={reaction.id}
                      style={{
                        backgroundColor: 'rgba(220, 38, 38, 0.2)',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: '6px',
                        padding: '0.5rem',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      title={reaction.name}
                      data-testid={`reaction-${reaction.name}`}
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}