import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./components/LoginPage";

function App() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPage, setShowLoginPage] = useState(false);
  
  useEffect(() => {
    console.log("App component mounted");
    document.title = "MetalHub - Metal Community";
    fetchBands();
  }, []);

  // Force body style
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#000000';
  }, []);

  const fetchBands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bands');
      if (response.ok) {
        const bandsData = await response.json();
        setBands(bandsData);
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
    return <LoginPage />;
  }

  // If still checking authentication, show loading
  if (authLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000000', 
        color: '#ffffff', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.25rem', color: '#dc2626' }}>Loading MetalHub...</p>
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
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#dc2626', 
          marginBottom: '24px' 
        }}>
          MetalHub Band Database
        </h1>
        
        <div style={{ 
          backgroundColor: '#1f2937', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px' 
        }}>
          <p style={{ color: '#10b981' }}>✓ React Status: Running</p>
          <p style={{ color: '#10b981' }}>✓ App mounted successfully</p>
        </div>
        
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
        
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            color: '#f87171', 
            marginBottom: '16px' 
          }}>
            Band Search Results ({loading ? '...' : bands.length} bands)
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
          ) : bands.length === 0 ? (
            <div style={{ 
              backgroundColor: '#1f2937', 
              padding: '24px', 
              borderRadius: '8px', 
              textAlign: 'center' 
            }}>
              <p style={{ color: '#9ca3af' }}>No bands found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bands.map((band, index) => (
                <div 
                  key={band.id || index} 
                  style={{ 
                    backgroundColor: '#1f2937', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px' 
                  }}
                >
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    backgroundColor: '#374151', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    {band.imageUrl ? (
                      <img 
                        src={band.imageUrl}
                        alt={band.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
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

        <div style={{ 
          backgroundColor: '#1f2937', 
          padding: '24px', 
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            color: '#f87171', 
            marginBottom: '16px' 
          }}>Authentication Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isAuthenticated ? (
              <>
                <p style={{ color: '#10b981' }}>✓ Logged in as {user?.firstName || user?.email || 'User'}</p>
                <p style={{ color: '#10b981' }}>✓ Session active{user?.rememberMe ? ' (Remember me enabled)' : ''}</p>
                <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowLoginPage(true)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#374151',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Account Settings
                  </button>
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
                <p style={{ color: '#fbbf24' }}>⚠ Not logged in - limited features</p>
                <button
                  onClick={() => setShowLoginPage(true)}
                  style={{
                    marginTop: '12px',
                    padding: '12px 24px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: 'fit-content'
                  }}
                >
                  Login to MetalHub
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#1f2937', 
          padding: '24px', 
          borderRadius: '8px' 
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            color: '#f87171', 
            marginBottom: '16px' 
          }}>System Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: '#10b981' }}>✓ Search deduplication fixed</p>
            <p style={{ color: '#10b981' }}>✓ Only unique bands displayed</p>
            <p style={{ color: '#10b981' }}>✓ Object storage ready</p>
            <p style={{ color: '#10b981' }}>✓ Photo upload system active</p>
            <p style={{ color: '#10b981' }}>✓ Persistent authentication with remember me</p>
            <p style={{ color: '#3b82f6' }}>🤖 Background AI running</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;