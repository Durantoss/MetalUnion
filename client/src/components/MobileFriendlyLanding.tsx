import React from 'react';

interface Band {
  id: string;
  name: string;
  genre: string;
  description: string;
  imageUrl?: string;
  founded?: number;
  members?: string[];
  albums?: string[];
  website?: string;
  instagram?: string;
}

interface MobileFriendlyLandingProps {
  onSectionChange: (section: string) => void;
  bands: Band[];
}

interface SectionStats {
  bands: number;
  reviews: number;
  photos: number;
  tours: number;
  activeUsers: number;
  events: number;
  posts: number;
}

export function MobileFriendlyLanding({ onSectionChange, bands }: MobileFriendlyLandingProps) {
  console.log('Rendering MobileFriendlyLanding component');
  
  const featuredBands = bands?.slice(0, 3) || [];
  const [stats, setStats] = React.useState<SectionStats>({
    bands: bands.length,
    reviews: 342,
    photos: 1250,
    tours: 28,
    activeUsers: 52,
    events: 8,
    posts: 89
  });
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update real-time stats
  React.useEffect(() => {
    const updateStats = () => {
      setStats(prev => ({
        ...prev,
        bands: bands.length,
        reviews: prev.reviews + Math.floor(Math.random() * 3),
        photos: prev.photos + Math.floor(Math.random() * 2),
        activeUsers: 45 + Math.floor(Math.random() * 20),
        posts: prev.posts + Math.floor(Math.random() * 4)
      }));
      setCurrentTime(new Date());
    };

    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [bands.length]);

  // Update time every second
  React.useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      position: 'relative'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '900',
          color: '#dc2626',
          fontFamily: 'monospace'
        }}>
          MOSHUNION
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onSectionChange('bands')}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '12px',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
            data-testid="button-discover"
          >
            BANDS
          </button>
          <button
            onClick={() => onSectionChange('social')}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(251, 191, 36, 0.2)',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              color: '#fbbf24',
              fontSize: '12px',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
            data-testid="button-social"
          >
            SOCIAL
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#dc2626',
          fontFamily: 'monospace',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          METAL UNITED
        </h1>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#9ca3af',
          marginBottom: '2rem',
          maxWidth: '400px',
          lineHeight: '1.5'
        }}>
          The ultimate social platform for metal and rock music communities
        </p>

        {/* Real-time Status Bar */}
        <div style={{
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid #dc2626',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '2rem',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            fontFamily: 'monospace'
          }}>
            <div style={{ color: '#10b981' }}>
              🟢 LIVE • {stats.activeUsers} users online
            </div>
            <div style={{ color: '#9ca3af' }}>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Interactive Section Panels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px',
          marginBottom: '2rem',
          width: '100%',
          maxWidth: '400px'
        }}>
          {/* Bands Section Panel */}
          <div
            onClick={() => onSectionChange('bands')}
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid #dc2626',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
            }}
            data-testid="panel-bands"
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>
                🎸 BANDS DATABASE
              </h3>
              <div style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {stats.bands}
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
              Discover metal & rock bands • Browse by genre • Read detailed profiles
            </p>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, rgba(220, 38, 38, 0.2), transparent)',
              borderRadius: '0 12px 0 60px'
            }} />
          </div>

          {/* Social Hub Panel */}
          <div
            onClick={() => onSectionChange('social')}
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
            }}
            data-testid="panel-social"
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fbbf24', margin: 0 }}>
                👥 SOCIAL HUB
              </h3>
              <div style={{
                backgroundColor: '#fbbf24',
                color: '#111827',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {stats.posts}
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
              Connect with metalheads • Share posts • Join discussions
            </p>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, rgba(251, 191, 36, 0.2), transparent)',
              borderRadius: '0 12px 0 60px'
            }} />
          </div>

          {/* Reviews Panel */}
          <div
            onClick={() => onSectionChange('reviews')}
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid #f97316',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
            }}
            data-testid="panel-reviews"
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f97316', margin: 0 }}>
                ⭐ REVIEWS
              </h3>
              <div style={{
                backgroundColor: '#f97316',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {stats.reviews}
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
              Read band reviews • Rate albums • Share opinions
            </p>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, rgba(249, 115, 22, 0.2), transparent)',
              borderRadius: '0 12px 0 60px'
            }} />
          </div>

          {/* Tours Panel */}
          <div
            onClick={() => onSectionChange('tours')}
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid #8b5cf6',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
            }}
            data-testid="panel-tours"
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#8b5cf6', margin: 0 }}>
                🎤 TOURS & EVENTS
              </h3>
              <div style={{
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {stats.tours}
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
              Find concerts near you • Track tour dates • Plan your shows
            </p>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.2), transparent)',
              borderRadius: '0 12px 0 60px'
            }} />
          </div>

          {/* Photos Panel */}
          <div
            onClick={() => onSectionChange('photos')}
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid #06b6d4',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
            }}
            data-testid="panel-photos"
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#06b6d4', margin: 0 }}>
                📸 PHOTO GALLERY
              </h3>
              <div style={{
                backgroundColor: '#06b6d4',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {stats.photos}
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
              Browse concert photos • Share memories • Explore galleries
            </p>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, rgba(6, 182, 212, 0.2), transparent)',
              borderRadius: '0 12px 0 60px'
            }} />
          </div>

          {/* Activity Feed Panel */}
          <div
            onClick={() => onSectionChange('feed')}
            style={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
            }}
            data-testid="panel-feed"
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                ⚡ ACTIVITY FEED
              </h3>
              <div style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                LIVE
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
              Real-time community updates • Latest posts • Live discussions
            </p>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.2), transparent)',
              borderRadius: '0 12px 0 60px'
            }} />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '300px'
        }}>
          <button
            onClick={() => onSectionChange('social')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(to right, #dc2626, #f97316)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
            data-testid="button-join-community"
          >
            JOIN THE COMMUNITY
          </button>
          <button
            onClick={() => onSectionChange('bands')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#fbbf24',
              border: '2px solid #fbbf24',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            data-testid="button-explore-bands"
          >
            EXPLORE BANDS
          </button>
        </div>
      </div>

      {/* Featured Bands */}
      {featuredBands.length > 0 && (
        <div style={{
          padding: '20px',
          paddingBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#dc2626'
          }}>
            FEATURED BANDS
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {featuredBands.map((band) => (
              <div
                key={band.id}
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '16px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = '#374151';
                }}
              >
                {band.imageUrl && (
                  <img
                    src={band.imageUrl}
                    alt={band.name}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}
                  />
                )}
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: '#dc2626',
                  marginBottom: '8px'
                }}>
                  {band.name}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#fbbf24',
                  marginBottom: '8px'
                }}>
                  {band.genre}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  lineHeight: '1.4'
                }}>
                  {band.description.length > 100 
                    ? band.description.substring(0, 100) + '...' 
                    : band.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}