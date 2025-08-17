import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./components/LoginPage";
import { ConcertRecommendations } from "./components/ConcertRecommendations";
import { TicketLinks } from "./components/TicketLinks";

function App() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showConcertRecommendations, setShowConcertRecommendations] = useState(false);
  const [selectedBandForTickets, setSelectedBandForTickets] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBands, setFilteredBands] = useState<any[]>([]);
  
  useEffect(() => {
    console.log("App component mounted");
    document.title = "MetalHub - Metal Community Platform";
    fetchBands();
  }, []);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#0a0a0a';
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    document.body.style.overflow = 'auto';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBands(bands);
    } else {
      const filtered = bands.filter(band =>
        band.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        band.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        band.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBands(filtered);
    }
  }, [searchQuery, bands]);

  const fetchBands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bands');
      if (response.ok) {
        const bandsData = await response.json();
        setBands(bandsData);
        setFilteredBands(bandsData);
        console.log("Loaded bands:", bandsData.length);
      } else {
        setError('Failed to load bands');
      }
    } catch (error) {
      console.error('Error fetching bands:', error);
      setError('Error fetching bands');
    } finally {
      setLoading(false);
    }
  };

  // Show login page if explicitly requested
  if (showLoginPage) {
    return <LoginPage onBack={() => setShowLoginPage(false)} />;
  }

  // Show concert recommendations if requested
  if (showConcertRecommendations) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0a', 
        color: '#ffffff' 
      }}>
        <ConcertRecommendations onClose={() => setShowConcertRecommendations(false)} />
      </div>
    );
  }

  // Show ticket links if a band is selected
  if (selectedBandForTickets) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0a0a0a', 
        color: '#ffffff' 
      }}>
        <TicketLinks 
          bandId={selectedBandForTickets.id}
          bandName={selectedBandForTickets.name}
          onClose={() => setSelectedBandForTickets(null)} 
        />
      </div>
    );
  }

  // If still checking authentication, show loading
  if (authLoading) {
    return (
      <div 
        className="responsive-login-container"
        style={{ 
          minHeight: '100vh', 
          backgroundColor: '#000000',
          color: '#ffffff', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div 
            className="responsive-login-icon"
            style={{ 
              fontSize: '4rem', 
              marginBottom: '16px'
            }}
          >🤘</div>
          <p 
            className="responsive-login-title"
            style={{ 
              fontSize: '1.5rem', 
              color: '#dc2626', 
              fontWeight: '600' 
            }}
          >
            Loading MetalHub...
          </p>
          <p style={{ 
            fontSize: '1rem', 
            color: '#9ca3af', 
            marginTop: '8px' 
          }}>
            Preparing your metal experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header Navigation */}
      <header style={{ 
        padding: '16px 24px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#dc2626' 
        }}>
          METALHUB
        </div>
        <nav style={{ 
          display: 'flex', 
          gap: 'clamp(16px, 4vw, 32px)', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: '#999', fontSize: '0.9rem', cursor: 'pointer' }}>BANDS</span>
          <span style={{ color: '#999', fontSize: '0.9rem', cursor: 'pointer' }}>REVIEWS</span>
          <span style={{ color: '#999', fontSize: '0.9rem', cursor: 'pointer' }}>TOURS</span>
          <span style={{ color: '#999', fontSize: '0.9rem', cursor: 'pointer' }}>PHOTOS</span>
          {isAuthenticated && (
            <span 
              onClick={() => setShowConcertRecommendations(true)}
              style={{ 
                color: '#dc2626', 
                fontSize: '0.9rem', 
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              data-testid="button-concert-recommendations"
            >
              🎯 AI CONCERTS
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search bands, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.875rem',
                width: '200px'
              }}
            />
          </div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl}
                  alt="Profile"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              )}
              <button
                onClick={() => setShowLoginPage(true)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  color: '#999',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Account
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginPage(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <div style={{
        backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 4rem)',
            fontWeight: 'bold',
            marginBottom: '16px',
            lineHeight: '1.1',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            GAZE INTO THE <span style={{ color: '#dc2626' }}>ABYSS</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#ccc',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Reviews, photos, and tour dates for the heaviest bands on the planet
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap' 
          }}>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              EXPLORE BANDS
            </button>
            <button style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid #666',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              WRITE REVIEW
            </button>
          </div>
        </div>
      </div>

      {/* Featured Bands Section */}
      <div style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              FEATURED BANDS
            </h2>
            <a href="#" style={{
              color: '#dc2626',
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              VIEW ALL →
            </a>
          </div>

          {loading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#9ca3af' 
            }}>
              Loading bands...
            </div>
          )}

          {error && (
            <div style={{ 
              backgroundColor: '#7f1d1d', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px' 
            }}>
              <p style={{ color: '#fca5a5' }}>Error: {error}</p>
            </div>
          )}
          
          {!loading && !error && (
            filteredBands.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#9ca3af' 
              }}>
                <p>
                  {searchQuery ? `No bands found for "${searchQuery}"` : 'No bands found'}
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: '24px'
              }}>
                {filteredBands.slice(0, 6).map((band, index) => (
                  <div 
                    key={`${band.id}-${index}`}
                    style={{ 
                      backgroundColor: '#1a1a1a', 
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      aspectRatio: '16/10'
                    }}
                  >
                    {/* Band Image Background */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: band.imageUrl ? `url(${band.imageUrl})` : 'linear-gradient(135deg, #333 0%, #1a1a1a 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)'
                      }}></div>
                    </div>

                    {/* Band Info Overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '24px',
                      color: 'white'
                    }}>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        marginBottom: '4px',
                        color: 'white'
                      }}>
                        {band.name.toUpperCase()}
                      </h3>
                      <p style={{
                        color: '#ccc',
                        fontSize: '0.9rem',
                        marginBottom: '8px'
                      }}>
                        {band.genre}
                      </p>
                      
                      {/* Rating Stars */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ color: '#dc2626' }}>
                          ⭐⭐⭐⭐⭐
                        </div>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: '#999' 
                        }}>
                          ({Math.floor(Math.random() * 500) + 50} reviews)
                        </span>
                      </div>

                      <p style={{
                        fontSize: '0.85rem',
                        color: '#bbb',
                        lineHeight: '1.4',
                        marginBottom: '12px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {band.description}
                      </p>

                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <button 
                          onClick={() => setSelectedBandForTickets(band)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          data-testid={`button-tickets-${band.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          🎫 GET TICKETS
                        </button>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: '#999' 
                        }}>
                          NEXT TOUR: {band.founded ? 'DEC 2024' : 'JAN 2025'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;