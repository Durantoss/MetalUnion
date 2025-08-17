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
      backgroundColor: '#000000', 
      color: '#ffffff', 
      padding: '32px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#dc2626', 
            margin: 0
          }}>
            🤘 MetalHub Band Database
          </h1>
          
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
                Login to MetalHub
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search bands by name, genre, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>
        {/* Authentication Status */}
        <div style={{ 
          backgroundColor: '#1f2937', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px' 
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            color: '#f87171', 
            marginBottom: '12px'
          }}>
            Authentication Status
          </h3>
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ color: '#10b981', fontSize: '0.875rem' }}>✓ Logged in as {user?.firstName || user?.email || 'User'}</p>
              <p style={{ color: '#10b981', fontSize: '0.875rem' }}>✓ Session active with persistent login</p>
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={() => window.location.href = '/api/logout'}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid #374151',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ color: '#fbbf24', fontSize: '0.875rem' }}>⚠ Not logged in</p>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Login to access all features</p>
            </div>
          )}
        </div>
        
        {/* Error Display */}
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
        
        {/* Band Results Section */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            color: '#f87171', 
            marginBottom: '16px' 
          }}>
            Band Search Results ({loading ? '...' : `${filteredBands.length} of ${bands.length}`} bands)
          </h2>
          
          {loading ? (
            <div style={{ 
              backgroundColor: '#1f2937', 
              padding: '24px', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <p style={{ color: '#9ca3af' }}>Loading bands...</p>
            </div>
          ) : filteredBands.length === 0 ? (
            <div style={{ 
              backgroundColor: '#1f2937', 
              padding: '24px', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <p style={{ color: '#9ca3af' }}>
                {searchQuery ? `No bands found for "${searchQuery}"` : 'No bands found'}
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
              gap: '16px' 
            }}>
              {filteredBands.map((band, index) => (
                <div 
                  key={`${band.id}-${index}`}
                  style={{ 
                    backgroundColor: '#1f2937', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    backgroundColor: '#374151', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {band.imageUrl ? (
                      <img 
                        src={band.imageUrl} 
                        alt={band.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        🎸
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{band.name}</h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{band.genre}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{band.description}</p>
                    
                    {band.founded && (
                      <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px' }}>
                        Founded: {band.founded}
                      </p>
                    )}
                    
                    {band.members && band.members.length > 0 && (
                      <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px' }}>
                        Members: {band.members.slice(0, 2).join(', ')}
                        {band.members.length > 2 && ` +${band.members.length - 2} more`}
                      </p>
                    )}
                  </div>
                  <button
                    style={{ 
                      padding: '4px 12px', 
                      backgroundColor: '#dc2626', 
                      borderRadius: '4px', 
                      fontSize: '0.875rem',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                    onClick={() => console.log('Selected band:', band.name)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;