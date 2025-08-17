import { useState, useEffect } from 'react';
import { BandComparison } from './components/BandComparison';

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

const App = () => {
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    fetch('/api/bands')
      .then(response => response.json())
      .then(data => {
        console.log('Loaded bands:', data.length);
        setBands(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading bands:', err);
        setError('Failed to load bands');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#dc2626',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            METALHUB
          </h1>
          <p style={{ color: '#9ca3af' }}>Loading metal bands...</p>
          <div style={{ fontSize: '2rem', marginTop: '1rem' }}>🤘</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#dc2626',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            METALHUB
          </h1>
          <p style={{ color: '#f87171' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '1rem'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '4rem',
            color: '#dc2626',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            letterSpacing: '0.1em'
          }}>
            METALHUB
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#9ca3af',
            marginBottom: '2rem'
          }}>
            Metal Community Platform - {bands.length} Bands
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                console.log('Login button clicked');
                fetch('/api/login')
                  .then(response => response.json())
                  .then(data => {
                    console.log('Login response:', data);
                    alert(data.message || 'Login functionality temporarily disabled for testing');
                  })
                  .catch(err => {
                    console.error('Login error:', err);
                    alert('Login service temporarily unavailable');
                  });
              }}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Sign in with Replit
            </button>
            <button 
              onClick={() => {
                console.log('Compare Bands button clicked');
                setShowComparison(true);
              }}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#047857';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Compare Bands
            </button>
          </div>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {bands.map(band => (
            <div
              key={band.id}
              style={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#374151';
              }}
            >
              {band.imageUrl && (
                <img
                  src={band.imageUrl}
                  alt={band.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                />
              )}
              <h3 style={{
                fontSize: '1.5rem',
                color: '#dc2626',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                {band.name}
              </h3>
              <p style={{
                color: '#f87171',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                {band.genre}
              </p>
              {band.founded && (
                <p style={{
                  color: '#9ca3af',
                  fontSize: '0.8rem',
                  marginBottom: '1rem'
                }}>
                  Founded: {band.founded}
                </p>
              )}
              <p style={{
                color: '#d1d5db',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                marginBottom: '1rem'
              }}>
                {band.description}
              </p>
              {band.website && (
                <a
                  href={band.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    console.log(`Opening ${band.name} website: ${band.website}`);
                    // Let the default behavior continue
                  }}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginRight: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
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
                  Website ↗
                </a>
              )}
              {band.instagram && (
                <a
                  href={band.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    console.log(`Opening ${band.name} Instagram: ${band.instagram}`);
                    // Let the default behavior continue
                  }}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#6d28d9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#7c3aed';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Instagram ↗
                </a>
              )}
            </div>
          ))}
        </div>

        {showComparison && (
          <BandComparison 
            bands={bands} 
            onClose={() => setShowComparison(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default App;