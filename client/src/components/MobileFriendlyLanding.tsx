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
    };

    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [bands.length]);

  const quickAccessSections = [
    {
      id: 'events',
      title: 'Event Discovery',
      subtitle: 'AI-Powered Concert Recommendations',
      description: 'Discover metal concerts tailored to your taste using advanced AI',
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #dc2626, #facc15)',
      stats: `${stats.events} events`,
      featured: true
    },
    {
      id: 'social',
      title: 'Social Hub',
      subtitle: 'Global Metal Community',
      description: 'Connect with metalheads worldwide and share experiences',
      icon: '🌐',
      gradient: 'linear-gradient(135deg, #facc15, #dc2626)',
      stats: `${stats.activeUsers} online`,
      featured: true
    },
    {
      id: 'bands',
      title: 'Band Discovery',
      subtitle: 'Explore Metal Universe',
      description: 'Deep dive into band profiles, albums, and histories',
      icon: '🎸',
      gradient: 'linear-gradient(135deg, #dc2626, #991b1b)',
      stats: `${stats.bands} bands`
    },
    {
      id: 'reviews',
      title: 'Reviews & Ratings',
      subtitle: 'Community Insights',
      description: 'Share and discover authentic metal community reviews',
      icon: '⭐',
      gradient: 'linear-gradient(135deg, #facc15, #eab308)',
      stats: `${stats.reviews} reviews`
    },
    {
      id: 'photos',
      title: 'Metal Photography',
      subtitle: 'Visual Stories',
      description: 'Capture and share the raw energy of metal culture',
      icon: '📸',
      gradient: 'linear-gradient(135deg, #dc2626, #facc15)',
      stats: `${stats.photos} photos`
    },
    {
      id: 'tours',
      title: 'Tour Dates',
      subtitle: 'Live Experience Tracker',
      description: 'Track upcoming tours and live performances',
      icon: '🚌',
      gradient: 'linear-gradient(135deg, #991b1b, #dc2626)',
      stats: `${stats.tours} tours`
    },
    {
      id: 'pit',
      title: 'The Pit',
      subtitle: 'Community Discussions',
      description: 'Dive into heated debates and metal discussions',
      icon: '🔥',
      gradient: 'linear-gradient(135deg, #facc15, #dc2626)',
      stats: `${stats.posts} posts`
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Unified Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '4rem',
        padding: '3rem 0'
      }}>
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: '900',
          background: 'linear-gradient(45deg, #dc2626, #facc15)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '1rem',
          textShadow: '0 4px 20px rgba(220, 38, 38, 0.3)',
          letterSpacing: '-0.02em'
        }}>
          MOSHUNION
        </h1>
        
        <p style={{
          fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
          color: '#d1d5db',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem auto',
          lineHeight: '1.6'
        }}>
          The ultimate metal community platform powered by AI
        </p>

        {/* Live Stats Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          marginTop: '2rem'
        }}>
          {[
            { label: 'Active Users', value: stats.activeUsers, icon: '👥' },
            { label: 'Bands', value: stats.bands, icon: '🎸' },
            { label: 'AI Events', value: stats.events, icon: '🎯' }
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '8px',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#facc15',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              <span>{stat.icon}</span>
              <span>{stat.value}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {quickAccessSections.map((section, index) => (
          <div
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '16px',
              border: '1px solid rgba(153, 27, 27, 0.5)',
              padding: section.featured ? '2rem' : '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              gridColumn: section.featured ? 'span 2' : 'span 1',
              minHeight: section.featured ? '200px' : '160px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(220, 38, 38, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(153, 27, 27, 0.5)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Background Gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: section.gradient,
              borderRadius: '50%',
              opacity: 0.1,
              filter: 'blur(20px)'
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                fontSize: section.featured ? '2.5rem' : '2rem',
                minWidth: section.featured ? '60px' : '50px'
              }}>
                {section.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: '#facc15',
                  fontSize: section.featured ? '1.5rem' : '1.25rem',
                  fontWeight: '700',
                  marginBottom: '0.25rem'
                }}>
                  {section.title}
                </h3>
                
                <div style={{
                  color: '#dc2626',
                  fontSize: section.featured ? '0.95rem' : '0.85rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {section.subtitle}
                </div>
                
                <p style={{
                  color: '#9ca3af',
                  fontSize: section.featured ? '0.9rem' : '0.8rem',
                  lineHeight: '1.4',
                  marginBottom: '1rem'
                }}>
                  {section.description}
                </p>
                
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  borderRadius: '20px',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#facc15',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {section.stats}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Bands Section */}
      {featuredBands.length > 0 && (
        <div style={{
          marginTop: '4rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(45deg, #dc2626, #facc15)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '2rem'
          }}>
            🎸 Featured Metal Acts
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {featuredBands.map((band, index) => (
              <div
                key={band.id}
                onClick={() => onSectionChange('bands')}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '12px',
                  border: '1px solid rgba(153, 27, 27, 0.5)',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(153, 27, 27, 0.5)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                }}
              >
                <h3 style={{
                  color: '#facc15',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '0.5rem'
                }}>
                  {band.name}
                </h3>
                
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem'
                }}>
                  {band.genre}
                </div>
                
                <p style={{
                  color: '#9ca3af',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {band.description}
                </p>
                
                {band.founded && (
                  <div style={{
                    marginTop: '1rem',
                    color: '#6b7280',
                    fontSize: '0.75rem'
                  }}>
                    Founded {band.founded}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div style={{
        textAlign: 'center',
        marginTop: '4rem',
        padding: '2rem',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '16px',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        maxWidth: '600px',
        margin: '4rem auto 0 auto'
      }}>
        <h3 style={{
          color: '#facc15',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem'
        }}>
          🤘 Join the Metal Revolution
        </h3>
        
        <p style={{
          color: '#9ca3af',
          marginBottom: '2rem',
          lineHeight: '1.5'
        }}>
          Experience the most advanced metal community platform with AI-powered 
          event discovery, global social features, and comprehensive band database.
        </p>
        
        <button
          onClick={() => onSectionChange('events')}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(45deg, #dc2626, #facc15)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          🎯 Start AI Event Discovery
        </button>
      </div>
    </div>
  );
}