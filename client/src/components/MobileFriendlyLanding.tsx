import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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

interface Tour {
  id: string;
  bandId: string;
  bandName: string;
  tourName: string;
  venue: string;
  city: string;
  country: string;
  date: string;
}

interface Review {
  id: string;
  bandId: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

interface Photo {
  id: string;
  bandId: string;
  title: string;
  imageUrl: string;
  category: string;
  uploadedBy: string;
}

interface MobileFriendlyLandingProps {
  onSectionChange: (section: string) => void;
  bands: Band[];
  currentUser?: any;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function MobileFriendlyLanding({ onSectionChange, bands, currentUser, onLogin, onLogout }: MobileFriendlyLandingProps) {
  const [refreshInterval] = useState(5000); // 5 seconds
  
  // Real-time data queries that refresh every 5 seconds
  const { data: tours = [], isLoading: toursLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true
  });
  
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true
  });
  
  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ['/api/photos'],
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true
  });
  
  // Get random photos for display
  const [randomPhotos, setRandomPhotos] = useState<Photo[]>([]);
  
  useEffect(() => {
    if (photos.length > 0) {
      const shuffled = [...photos].sort(() => 0.5 - Math.random());
      setRandomPhotos(shuffled.slice(0, 4));
    }
  }, [photos]);
  
  // Dynamic stats based on real data
  const stats = {
    bands: bands.length,
    reviews: reviews.length,
    photos: photos.length,
    tours: tours.length,
    activeUsers: Math.floor(Math.random() * 50) + 20, // Simulated active users
    events: tours.filter(tour => new Date(tour.date) > new Date()).length
  };

  // Navigation sections as requested
  const navigationSections = [
    { id: 'social', title: 'The Pit', icon: '' },
    { id: 'bands', title: 'Bands', icon: '' },
    { id: 'tours', title: 'Tours', icon: '' },
    { id: 'reviews', title: 'Reviews', icon: '' },
    { id: 'photos', title: 'Photos', icon: '' }
  ];
  
  // Get latest data for scrolling panels
  const getLatestTours = () => {
    return tours
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  };
  
  const getLatestReviews = () => {
    return reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  };
  
  const getLatestBands = () => {
    return bands.slice(0, 3);
  };
  
  const getPitActivity = () => {
    // Simulated pit activity data
    return [
      { user: 'MetalWarrior', action: 'joined discussion "Best Metal Albums 2024"', time: '2m ago' },
      { user: 'RiffMaster', action: 'shared concert photo from Wacken', time: '5m ago' },
      { user: 'BlastBeat', action: 'rated Metallica concert 5 stars', time: '8m ago' }
    ];
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      position: 'relative'
    }}>
      {/* Hero Header with Logo */}
      <div style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        borderBottom: '1px solid rgba(220, 38, 38, 0.3)'
      }}>
        <h1 
          onClick={() => {
            // Enhanced color swapping animation sequence
            const moshSpan = document.querySelector('.mosh-span') as HTMLElement;
            const unionSpan = document.querySelector('.union-span') as HTMLElement;
            
            if (moshSpan && unionSpan) {
              // Rapid color swap sequence
              const swaps = [
                { mosh: '#ffffff', union: '#dc2626' },
                { mosh: '#dc2626', union: '#ffffff' },
                { mosh: '#ffffff', union: '#dc2626' },
                { mosh: '#dc2626', union: '#ffffff' },
                { mosh: '#dc2626', union: '#ffffff' } // Return to original
              ];
              
              swaps.forEach((swap, index) => {
                setTimeout(() => {
                  moshSpan.style.color = swap.mosh;
                  unionSpan.style.color = swap.union;
                }, index * 150);
              });
            }
          }}
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
            cursor: 'pointer',
            userSelect: 'none',
            textShadow: '0 8px 32px rgba(220, 38, 38, 0.5)'
          }}
          data-testid="logo-moshunion"
        >
          <span 
            className="mosh-span"
            style={{
              color: '#dc2626',
              transition: 'color 0.15s ease'
            }}
          >
            MOSH
          </span>
          <span 
            className="union-span"
            style={{
              color: '#ffffff',
              transition: 'color 0.15s ease'
            }}
          >
            UNION
          </span>
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#d1d5db',
          margin: 0
        }}>
          The Ultimate Metal Community
        </p>
      </div>
      
      {/* Interactive Navigation Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1.5rem',
        borderBottom: '1px solid rgba(220, 38, 38, 0.3)',
        flexWrap: 'wrap'
      }}>
        {navigationSections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onMouseEnter={(e) => {
              if (!('ontouchstart' in window)) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.8)';
              }
            }}
            onMouseLeave={(e) => {
              if (!('ontouchstart' in window)) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              borderRadius: '25px',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '100px',
              justifyContent: 'center',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            data-testid={`nav-${section.id}`}
          >
            <span style={{ fontSize: '1.1rem' }}>{section.icon}</span>
            {section.title}
          </button>
        ))}
      </div>
      
      {/* User Actions */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 50
      }}>
        {currentUser ? (
          <>
            {/* User Name Display */}
            <div style={{
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              Welcome, {currentUser.stagename}
            </div>
            
            {/* Admin Panel Button */}
            {currentUser.isAdmin && (
              <button
                onClick={() => onSectionChange('admin')}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Admin Panel
              </button>
            )}
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Login Button */}
            <button
              onClick={() => {
                console.log('Enter The Pit clicked - triggering login');
                if (onLogin) {
                  onLogin();
                } else {
                  console.warn('onLogin prop not provided');
                }
              }}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              data-testid="button-enter-the-pit"
            >
              Enter The Pit
            </button>
          </>
        )}
      </div>
      
      {/* Real-time Data Panels */}
      <div style={{
        padding: '2rem',
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* The Pit Panel */}
        <div 
          onClick={() => onSectionChange('social')}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
            }
          }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '250px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          data-testid="panel-the-pit"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: 0
            }}>
              The Pit
            </h3>
            <div style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              borderRadius: '12px',
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: '600'
            }}>
              {stats.activeUsers} online
            </div>
          </div>
          
          <div style={{
            maxHeight: '180px',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {getPitActivity().map((activity, i) => (
              <div key={i} style={{
                padding: '0.75rem 0',
                borderBottom: i < getPitActivity().length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
              }}>
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  {activity.user}
                </div>
                <div style={{
                  color: '#d1d5db',
                  fontSize: '0.8rem',
                  marginBottom: '0.25rem'
                }}>
                  {activity.action}
                </div>
                <div style={{
                  color: '#9ca3af',
                  fontSize: '0.7rem'
                }}>
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bands Panel */}
        <div 
          onClick={() => onSectionChange('bands')}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
            }
          }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '250px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          data-testid="panel-bands"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: 0
            }}>
              Bands
            </h3>
            <div style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              borderRadius: '12px',
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: '600'
            }}>
              {stats.bands} total
            </div>
          </div>
          
          <div style={{
            maxHeight: '180px',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {getLatestBands().map((band, i) => (
              <div key={band.id} style={{
                padding: '0.75rem 0',
                borderBottom: i < getLatestBands().length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
              }}>
                <div style={{
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  {band.name}
                </div>
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  marginBottom: '0.25rem'
                }}>
                  {band.genre}
                </div>
                {band.founded && (
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '0.7rem'
                  }}>
                    Founded {band.founded}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Tours Panel */}
        <div 
          onClick={() => onSectionChange('tours')}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
            }
          }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '250px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          data-testid="panel-tours"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: 0
            }}>
              Tours
            </h3>
            <div style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              borderRadius: '12px',
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: '600'
            }}>
              {stats.tours} upcoming
            </div>
          </div>
          
          <div style={{
            maxHeight: '180px',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {toursLoading ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>
                Loading tours...
              </div>
            ) : (
              getLatestTours().map((tour, i) => (
                <div key={tour.id} style={{
                  padding: '0.75rem 0',
                  borderBottom: i < getLatestTours().length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                }}>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem'
                  }}>
                    {tour.bandName}
                  </div>
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    marginBottom: '0.25rem'
                  }}>
                    {tour.venue}, {tour.city}
                  </div>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '0.7rem'
                  }}>
                    {new Date(tour.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Reviews Panel */}
        <div 
          onClick={() => onSectionChange('reviews')}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
            }
          }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '250px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          data-testid="panel-reviews"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: 0
            }}>
              Reviews
            </h3>
            <div style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              borderRadius: '12px',
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: '600'
            }}>
              {stats.reviews} total
            </div>
          </div>
          
          <div style={{
            maxHeight: '180px',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {reviewsLoading ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>
                Loading reviews...
              </div>
            ) : (
              getLatestReviews().map((review, i) => (
                <div key={review.id} style={{
                  padding: '0.75rem 0',
                  borderBottom: i < getLatestReviews().length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    <div style={{
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      {review.title}
                    </div>
                    <div style={{
                      color: '#facc15',
                      fontSize: '0.8rem'
                    }}>
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    marginBottom: '0.25rem'
                  }}>
                    by {review.author}
                  </div>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '0.7rem'
                  }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Photos Panel */}
        <div 
          onClick={() => onSectionChange('photos')}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
            }
          }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '250px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          data-testid="panel-photos"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: 0
            }}>
              Photos
            </h3>
            <div style={{
              marginLeft: 'auto',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              borderRadius: '12px',
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: '600'
            }}>
              {stats.photos} total
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.5rem',
            maxHeight: '180px',
            overflow: 'hidden'
          }}>
            {photosLoading ? (
              <div style={{ 
                gridColumn: 'span 2', 
                color: '#9ca3af', 
                textAlign: 'center', 
                padding: '2rem 0' 
              }}>
                Loading photos...
              </div>
            ) : randomPhotos.length > 0 ? (
              randomPhotos.map((photo, i) => (
                <div key={photo.id} style={{
                  aspectRatio: '1',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling && 
                        ((e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex');
                    }}
                  />
                  <div style={{
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(220, 38, 38, 0.3)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    padding: '0.5rem'
                  }}>
                    {photo.title}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                gridColumn: 'span 2', 
                color: '#9ca3af', 
                textAlign: 'center', 
                padding: '2rem 0' 
              }}>
                No photos available
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Live Stats Footer */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        marginTop: '2rem',
        borderTop: '1px solid rgba(220, 38, 38, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          {[
            { label: 'Active Users', value: stats.activeUsers, icon: '🔥' },
            { label: 'Total Bands', value: stats.bands, icon: '🎸' },
            { label: 'Reviews', value: stats.reviews, icon: '⭐' },
            { label: 'Photos', value: stats.photos, icon: '📸' },
            { label: 'Upcoming Tours', value: stats.events, icon: '🎤' }
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
              <span style={{ fontSize: '1.2rem' }}>{stat.icon}</span>
              <span style={{ color: '#dc2626' }}>{stat.value}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        
        <div style={{
          marginTop: '1.5rem',
          color: '#9ca3af',
          fontSize: '0.8rem'
        }}>
          Data refreshes every 5 seconds • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}