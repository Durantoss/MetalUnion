import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./components/LoginPage";

function App() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPage, setShowLoginPage] = useState(false);
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
    document.body.style.backgroundColor = '#000000';
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
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

  // If still checking authentication, show loading
  if (authLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b69 50%, #000000 100%)',
        color: '#ffffff', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '24px',
            animation: 'pulse 2s infinite'
          }}>🤘</div>
          <p style={{ fontSize: '1.5rem', color: '#dc2626', fontWeight: '600' }}>
            Loading MetalHub...
          </p>
          <p style={{ fontSize: '1rem', color: '#9ca3af', marginTop: '8px' }}>
            Preparing your metal experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b69 20%, #000000 100%)',
      color: '#ffffff'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #374151',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🤘</span>
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 'bold', 
              color: '#dc2626',
              margin: 0
            }}>
              MetalHub
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl}
                    alt="Profile"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  {user?.firstName || user?.email || 'User'}
                </span>
                <button
                  onClick={() => setShowLoginPage(true)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Settings
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginPage(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '48px',
            padding: '48px 24px',
            background: 'rgba(31, 41, 55, 0.6)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid #374151'
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '16px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              Discover Metal & Rock
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#d1d5db',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Connect with the ultimate metal community. Discover bands, read reviews, 
              share photos, and find tour dates.
            </p>
            
            {/* Search Bar */}
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <input
                type="text"
                placeholder="Search bands, genres, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#1f2937',
                  border: '2px solid #374151',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>
          </div>
          
          {/* Authentication Status */}
          <div style={{ 
            background: 'rgba(31, 41, 55, 0.6)',
            padding: '24px', 
            borderRadius: '12px',
            marginBottom: '32px',
            backdropFilter: 'blur(10px)',
            border: '1px solid #374151'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              color: '#f87171', 
              marginBottom: '16px',
              fontWeight: 'bold'
            }}>
              🔐 Authentication Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {isAuthenticated ? (
                <>
                  <p style={{ color: '#10b981' }}>✓ Logged in as {user?.firstName || user?.email || 'User'}</p>
                  <p style={{ color: '#10b981' }}>✓ Session active - persistent login enabled</p>
                  <p style={{ color: '#10b981' }}>✓ Access to all MetalHub features</p>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => window.location.href = '/api/logout'}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        color: '#9ca3af',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ color: '#fbbf24' }}>⚠ Not logged in - limited features available</p>
                  <p style={{ color: '#9ca3af' }}>• Login to upload photos and write reviews</p>
                  <p style={{ color: '#9ca3af' }}>• Save favorite bands and get personalized recommendations</p>
                </>
              )}
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div style={{ 
              background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
              padding: '16px 24px', 
              borderRadius: '12px', 
              marginBottom: '32px',
              border: '1px solid #dc2626'
            }}>
              <p style={{ color: '#fca5a5', fontSize: '1rem', fontWeight: '500' }}>
                ⚠️ {error}
              </p>
            </div>
          )}
          
          {/* Band Results Section */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <h2 style={{ 
                fontSize: '2rem', 
                color: '#f87171', 
                fontWeight: 'bold',
                margin: 0
              }}>
                🎸 Metal Bands Database
              </h2>
              <div style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderRadius: '20px',
                border: '1px solid #374151'
              }}>
                <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                  {loading ? 'Loading...' : `${filteredBands.length} of ${bands.length} bands`}
                </span>
              </div>
            </div>
            
            {loading ? (
              <div style={{ 
                background: 'rgba(31, 41, 55, 0.6)',
                padding: '48px 24px', 
                borderRadius: '12px', 
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid #374151'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🎸</div>
                <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                  Loading the metal archives...
                </p>
              </div>
            ) : filteredBands.length === 0 ? (
              <div style={{ 
                background: 'rgba(31, 41, 55, 0.6)',
                padding: '48px 24px', 
                borderRadius: '12px', 
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid #374151'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔍</div>
                <p style={{ color: '#9ca3af', fontSize: '1.125rem', marginBottom: '8px' }}>
                  {searchQuery ? `No bands found for "${searchQuery}"` : 'No bands in the database'}
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {searchQuery ? 'Try a different search term' : 'Check back later for new additions'}
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                gap: '24px' 
              }}>
                {filteredBands.map((band, index) => (
                  <div 
                    key={`${band.id}-${index}`}
                    style={{ 
                      background: 'rgba(31, 41, 55, 0.8)',
                      padding: '24px', 
                      borderRadius: '16px',
                      border: '1px solid #374151',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = '#dc2626';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(220, 38, 38, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#374151';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        background: 'linear-gradient(135deg, #374151, #1f2937)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '2px solid #4b5563'
                      }}>
                        {band.imageUrl ? (
                          <img 
                            src={band.imageUrl} 
                            alt={band.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '10px'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '2rem' }}>🎸</div>
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                          fontSize: '1.375rem', 
                          fontWeight: 'bold',
                          color: '#dc2626',
                          marginBottom: '8px',
                          lineHeight: '1.2'
                        }}>
                          {band.name}
                        </h3>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: 'rgba(220, 38, 38, 0.2)',
                          borderRadius: '12px',
                          marginBottom: '12px'
                        }}>
                          <span style={{ 
                            color: '#fca5a5', 
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            {band.genre}
                          </span>
                        </div>
                        <p style={{ 
                          color: '#d1d5db', 
                          fontSize: '0.875rem',
                          lineHeight: '1.5',
                          marginBottom: '16px'
                        }}>
                          {band.description}
                        </p>
                        
                        {band.founded && (
                          <p style={{ 
                            color: '#9ca3af', 
                            fontSize: '0.75rem',
                            marginBottom: '8px'
                          }}>
                            Founded: {band.founded}
                          </p>
                        )}
                        
                        {band.members && band.members.length > 0 && (
                          <p style={{ 
                            color: '#9ca3af', 
                            fontSize: '0.75rem',
                            marginBottom: '16px'
                          }}>
                            Members: {band.members.slice(0, 3).join(', ')}
                            {band.members.length > 3 && ` +${band.members.length - 3} more`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #374151'
                    }}>
                      <button
                        style={{ 
                          flex: 1,
                          padding: '8px 16px', 
                          background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                          borderRadius: '6px', 
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                        onClick={() => console.log('View band:', band.name)}
                      >
                        View Details
                      </button>
                      {band.website && (
                        <button
                          style={{ 
                            padding: '8px 12px', 
                            backgroundColor: 'transparent',
                            border: '1px solid #4b5563',
                            borderRadius: '6px', 
                            fontSize: '0.875rem',
                            color: '#9ca3af',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(band.website, '_blank')}
                        >
                          🌐
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Feature Status */}
          <div style={{ 
            background: 'rgba(31, 41, 55, 0.6)',
            padding: '24px', 
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid #374151'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              color: '#f87171', 
              marginBottom: '16px',
              fontWeight: 'bold'
            }}>
              🚀 Platform Features
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px' 
            }}>
              <p style={{ color: '#10b981', fontSize: '0.875rem' }}>✓ Band search & discovery</p>
              <p style={{ color: '#10b981', fontSize: '0.875rem' }}>✓ Real-time data deduplication</p>
              <p style={{ color: '#10b981', fontSize: '0.875rem' }}>✓ Persistent authentication</p>
              <p style={{ color: '#10b981', fontSize: '0.875rem' }}>✓ Object storage for photos</p>
              <p style={{ color: '#10b981', fontSize: '0.875rem' }}>✓ Mobile-optimized design</p>
              <p style={{ color: '#3b82f6', fontSize: '0.875rem' }}>🤖 Background AI services</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{
        background: 'rgba(0, 0, 0, 0.9)',
        borderTop: '1px solid #374151',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          MetalHub - The Ultimate Metal Community Platform
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '8px' }}>
          Discover • Connect • Rock On 🤘
        </p>
      </footer>
    </div>
  );
}

export default App;