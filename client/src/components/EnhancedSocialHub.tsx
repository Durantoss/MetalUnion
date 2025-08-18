// Hook-free enhanced social hub component
import { ActivityFeed } from './ActivityFeed';
import { InteractivePolls } from './InteractivePolls';
import { GameficationDashboard } from './GameficationDashboard';
import { PhotosSection } from './PhotosSection';
import { Button } from './ui/button';

interface SocialHubProps {
  userId?: string;
  initialTab?: string;
}

export function EnhancedSocialHub({ userId, initialTab = 'feed' }: SocialHubProps) {
  let activeTab = initialTab;
  
  const handleTabChange = (tab: string) => {
    activeTab = tab;
    // Force re-render by updating the location or using a different approach
    // For now, this is a simplified version without state management
  };

  const stats = {
    onlineUsers: 147,
    activePolls: 8,
    upcomingEvents: 23,
    newPhotos: 156,
    totalReactions: 2847
  };

  const tabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <ActivityFeed featured={false} />;
      case 'gamification':
        return <GameficationDashboard />;
      case 'polls':
        return <InteractivePolls featured={false} />;
      case 'events':
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(153, 27, 27, 0.5)',
              padding: '2rem'
            }}>
              <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>
                📅 Community Events Coming Soon
              </h3>
              <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
                Check out the dedicated Event Discovery section for Smart concert recommendations!
              </p>
              <div style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                border: '1px solid rgba(220, 38, 38, 0.5)',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                🎯 Explore Event Discovery
              </div>
            </div>
          </div>
        );
      case 'leaderboard':
        return (
          <div style={{ padding: '2rem' }}>
            <h2 style={{
              color: '#dc2626',
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              🏆 COMMUNITY LEADERBOARD
            </h2>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(153, 27, 27, 0.5)',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { rank: 1, name: 'MetalMaster', score: 2847, badge: '🥇' },
                  { rank: 2, name: 'RockWarrior', score: 2156, badge: '🥈' },
                  { rank: 3, name: 'PitLord', score: 1923, badge: '🥉' },
                  { rank: 4, name: 'ConcertCrazy', score: 1654, badge: '🤘' },
                  { rank: 5, name: 'VenueVet', score: 1432, badge: '🎸' }
                ].map((user) => (
                  <div
                    key={user.rank}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      backgroundColor: user.rank <= 3 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '8px',
                      border: `1px solid ${user.rank <= 3 ? 'rgba(220, 38, 38, 0.3)' : 'rgba(75, 85, 99, 0.3)'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{user.badge}</span>
                      <div>
                        <div style={{
                          color: user.rank <= 3 ? '#facc15' : '#d1d5db',
                          fontWeight: '600',
                          fontSize: '1rem'
                        }}>
                          {user.name}
                        </div>
                        <div style={{
                          color: '#9ca3af',
                          fontSize: '0.8rem'
                        }}>
                          Rank #{user.rank}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      color: '#dc2626',
                      fontWeight: '700',
                      fontSize: '1.1rem'
                    }}>
                      {user.score.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'map':
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2 style={{
              color: '#dc2626',
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '2rem'
            }}>
              🗺️ INTERACTIVE MAP
            </h2>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(153, 27, 27, 0.5)',
              padding: '3rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>
                Global Metal Community Map
              </h3>
              <p style={{ color: '#9ca3af' }}>
                Interactive map showing metal venues, concerts, and community members worldwide
              </p>
            </div>
          </div>
        );
      default:
        return <ActivityFeed featured={false} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '900',
            background: 'linear-gradient(45deg, #dc2626, #facc15)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '0.5rem'
          }}>
            🌐 SOCIAL HUB
          </h1>
          <p style={{
            color: '#9ca3af',
            fontSize: '1rem'
          }}>
            Connect with the global metal community
          </p>
        </div>

        {/* Live Stats */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {[
            { label: 'Online', value: stats.onlineUsers, icon: '👥' },
            { label: 'Polls', value: stats.activePolls, icon: '📊' },
            { label: 'Events', value: stats.upcomingEvents, icon: '📅' },
            { label: 'Photos', value: stats.newPhotos, icon: '📸' }
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(153, 27, 27, 0.5)',
                padding: '0.75rem',
                textAlign: 'center',
                minWidth: '80px'
              }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                {stat.icon}
              </div>
              <div style={{
                color: '#facc15',
                fontWeight: '700',
                fontSize: '1.1rem'
              }}>
                {stat.value}
              </div>
              <div style={{
                color: '#9ca3af',
                fontSize: '0.7rem'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(153, 27, 27, 0.5)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '1rem'
        }}>
          {[
            { id: 'feed', label: 'Activity Feed', icon: '🔥' },
            { id: 'gamification', label: 'Achievements', icon: '🏆' },
            { id: 'polls', label: 'Polls', icon: '📊' },
            { id: 'events', label: 'Events', icon: '📅' },
            { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
            { id: 'map', label: 'Map', icon: '🗺️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: activeTab === tab.id ? 'rgba(220, 38, 38, 0.2)' : 'transparent',
                color: activeTab === tab.id ? '#facc15' : '#d1d5db',
                border: activeTab === tab.id ? '1px solid rgba(220, 38, 38, 0.5)' : '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {tabContent()}
      </div>
    </div>
  );
}