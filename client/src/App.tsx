import { useState, useEffect } from 'react';

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
          <button 
            onClick={() => window.location.href = '/api/login'}
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
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginRight: '0.5rem'
                  }}
                >
                  Website
                </a>
              )}
              {band.instagram && (
                <a
                  href={band.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  Instagram
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;