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

export function MobileFriendlyLanding({ onSectionChange, bands }: MobileFriendlyLandingProps) {
  console.log('Rendering MobileFriendlyLanding component');
  
  const featuredBands = bands?.slice(0, 3) || [];
  
  // Static stats - no hooks needed
  const stats = {
    bands: bands.length,
    reviews: 342,
    photos: 1250,
    tours: 28,
    activeUsers: 52,
    events: 8,
    posts: 89
  };

  const quickAccessSections = [
    {
      id: 'social',
      title: 'The Pit',
      subtitle: 'Global Metal Community',
      description: 'Connect with metalheads worldwide, share experiences, and dive into heated debates',
      gradient: 'linear-gradient(135deg, #ffffff, #dc2626)',
      stats: `${stats.activeUsers} online`,
      featured: true
    },
    {
      id: 'bands',
      title: 'Band Discovery',
      subtitle: 'Explore Metal Universe',
      description: 'Deep dive into band profiles, albums, and histories',
      gradient: 'linear-gradient(135deg, #dc2626, #ffffff)',
      stats: `${stats.bands} bands`
    },
    {
      id: 'reviews',
      title: 'Reviews & Ratings',
      subtitle: 'Community Insights',
      description: 'Share and discover authentic metal community reviews',
      gradient: 'linear-gradient(135deg, #ffffff, #dc2626)',
      stats: `${stats.reviews} reviews`
    },
    {
      id: 'tours',
      title: 'Tour Dates',
      subtitle: 'Live Experience Tracker',
      description: 'Track upcoming tours and live performances',
      gradient: 'linear-gradient(135deg, #dc2626, #ffffff)',
      stats: `${stats.tours} tours`
    },
    {
      id: 'events',
      title: 'Event Discovery',
      subtitle: 'Intelligent Concert Discovery',
      description: 'Discover metal concerts tailored to your taste with smart recommendations',
      gradient: 'linear-gradient(135deg, #ffffff, #dc2626)',
      stats: `${stats.events} events`,
      featured: false
    },
    {
      id: 'photos',
      title: 'Metal Photography',
      subtitle: 'Visual Stories',
      description: 'Capture and share the raw energy of metal culture',
      gradient: 'linear-gradient(135deg, #dc2626, #ffffff)',
      stats: `${stats.photos} photos`
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
        <h1 
          onClick={() => {
            // Color swapping animation sequence
            const moshSpan = document.querySelector('.mosh-span');
            const unionSpan = document.querySelector('.union-span');
            
            if (moshSpan && unionSpan) {
              // Start animation sequence
              setTimeout(() => {
                moshSpan.style.color = '#ffffff';
                unionSpan.style.color = '#dc2626';
              }, 100);
              
              setTimeout(() => {
                moshSpan.style.color = '#dc2626';
                unionSpan.style.color = '#ffffff';
              }, 300);
              
              setTimeout(() => {
                moshSpan.style.color = '#ffffff';
                unionSpan.style.color = '#dc2626';
              }, 500);
              
              setTimeout(() => {
                moshSpan.style.color = '#dc2626';
                unionSpan.style.color = '#ffffff';
              }, 700);
            }
          }}
          style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: '900',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <span 
            className="mosh-span"
            style={{
              color: '#dc2626',
              textShadow: '0 4px 20px rgba(220, 38, 38, 0.3)',
              transition: 'color 0.15s ease'
            }}
          >
            MOSH
          </span>
          <span 
            className="union-span"
            style={{
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
              transition: 'color 0.15s ease'
            }}
          >
            UNION
          </span>
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
            { label: 'Active Users', value: stats.activeUsers },
            { label: 'Bands', value: stats.bands },
            { label: 'Events', value: stats.events }
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
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >

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
        gap: window.innerWidth < 768 ? '1rem' : '1.5rem',
        gridTemplateColumns: window.innerWidth < 768 
          ? '1fr' 
          : window.innerWidth < 1024 
            ? 'repeat(auto-fit, minmax(280px, 1fr))' 
            : 'repeat(auto-fit, minmax(320px, 1fr))',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: window.innerWidth < 768 ? '0 0.75rem' : '0 1rem'
      }}>
        {quickAccessSections.map((section, index) => (
          <div
            key={section.id}
            onClick={() => onSectionChange(section.id)}

            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(0.98)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 1)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(220, 38, 38, 0.3)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(153, 27, 27, 0.5)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseEnter={(e) => {
              if (!('ontouchstart' in window)) {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 1)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(220, 38, 38, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!('ontouchstart' in window)) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(153, 27, 27, 0.5)';
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '16px',
              border: '1px solid rgba(153, 27, 27, 0.5)',
              padding: window.innerWidth < 768 ? (section.featured ? '1.5rem' : '1rem') : (section.featured ? '2rem' : '1.5rem'),
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              gridColumn: section.featured ? 'span 2' : 'span 1',
              minHeight: window.innerWidth < 768 ? (section.featured ? '180px' : '140px') : (section.featured ? '200px' : '160px'),
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
            }}
          >
            {/* Background Gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: window.innerWidth < 768 ? '80px' : '100px',
              height: window.innerWidth < 768 ? '80px' : '100px',
              background: section.gradient,
              borderRadius: '50%',
              opacity: 0.1,
              filter: 'blur(20px)'
            }} />
            
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              alignItems: 'flex-start',
              gap: window.innerWidth < 768 ? '0.75rem' : '1rem',
              position: 'relative',
              zIndex: 1
            }}>
              
              <div style={{ flex: 1 }}>
                <h3 style={{
                  color: '#ffffff',
                  fontSize: window.innerWidth < 768 
                    ? (section.featured ? '1.25rem' : '1.1rem') 
                    : (section.featured ? '1.5rem' : '1.25rem'),
                  fontWeight: '700',
                  marginBottom: '0.25rem',
                  lineHeight: '1.2'
                }}>
                  {section.title}
                </h3>
                
                <div style={{
                  color: '#dc2626',
                  fontSize: window.innerWidth < 768 
                    ? (section.featured ? '0.85rem' : '0.75rem') 
                    : (section.featured ? '0.95rem' : '0.85rem'),
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {section.subtitle}
                </div>
                
                <p style={{
                  color: '#9ca3af',
                  fontSize: window.innerWidth < 768 
                    ? (section.featured ? '0.8rem' : '0.7rem') 
                    : (section.featured ? '0.9rem' : '0.8rem'),
                  lineHeight: '1.4',
                  marginBottom: '1rem',
                  display: window.innerWidth < 768 && !section.featured ? 'none' : 'block'
                }}>
                  {section.description}
                </p>
                
                <div style={{
                  display: 'inline-block',
                  padding: window.innerWidth < 768 ? '0.2rem 0.6rem' : '0.25rem 0.75rem',
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  borderRadius: '20px',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#ffffff',
                  fontSize: window.innerWidth < 768 ? '0.7rem' : '0.75rem',
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
            background: 'linear-gradient(45deg, #dc2626, #ffffff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '2rem'
          }}>
            Featured Metal Acts
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
                  padding: window.innerWidth < 768 ? '1rem' : '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  minHeight: window.innerWidth < 768 ? '120px' : 'auto'
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(0.98)';
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(153, 27, 27, 0.5)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                }}
                onMouseEnter={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!('ontouchstart' in window)) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(153, 27, 27, 0.5)';
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                  }
                }}
              >
                <h3 style={{
                  color: '#ffffff',
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
          color: '#ffffff',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem'
        }}>
          Join the Metal Revolution
        </h3>
        
        <p style={{
          color: '#9ca3af',
          marginBottom: '2rem',
          lineHeight: '1.5'
        }}>
          Experience the most advanced metal community platform with intelligent 
          event discovery, global social features, and comprehensive band database.
        </p>
        
        <button
          onClick={() => onSectionChange('events')}
          style={{
            padding: window.innerWidth < 768 ? '0.875rem 1.5rem' : '1rem 2rem',
            background: 'linear-gradient(45deg, #dc2626, #ffffff)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            minHeight: '44px',
            minWidth: window.innerWidth < 768 ? '140px' : '160px'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(0.98)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.4)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          Start Event Discovery
        </button>
      </div>
    </div>
  );
}