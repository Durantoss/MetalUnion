interface Band {
  id: string;
  name: string;
  genre: string;
  description: string;
  imageUrl?: string;
}

interface SimpleLandingProps {
  onSectionChange: (section: string) => void;
  bands: Band[];
}

export function SimpleLanding({ onSectionChange, bands }: SimpleLandingProps) {
  const featuredBands = bands?.slice(0, 3) || [];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#dc2626',
          marginBottom: '1rem'
        }}>
          MOSHUNION
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#9ca3af'
        }}>
          The Ultimate Metal Community Platform
        </p>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        <button
          onClick={() => onSectionChange('bands')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Discover Bands
        </button>
        <button
          onClick={() => onSectionChange('events')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Event Discovery
        </button>
        <button
          onClick={() => onSectionChange('reviews')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Reviews
        </button>
        <button
          onClick={() => onSectionChange('social')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Social Hub
        </button>
      </div>

      {/* Featured Bands */}
      <div style={{
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '2rem',
          color: '#fbbf24',
          marginBottom: '2rem'
        }}>
          Featured Bands
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {featuredBands.map((band) => (
            <div
              key={band.id}
              style={{
                backgroundColor: '#1f2937',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px solid #374151'
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
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}
                />
              )}
              <h3 style={{
                fontSize: '1.5rem',
                color: '#dc2626',
                marginBottom: '0.5rem'
              }}>
                {band.name}
              </h3>
              <p style={{
                color: '#fbbf24',
                marginBottom: '0.5rem'
              }}>
                {band.genre}
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.9rem'
              }}>
                {band.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        marginTop: '4rem',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          color: '#fbbf24',
          marginBottom: '1rem'
        }}>
          Community Stats
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '2rem', color: '#dc2626', fontWeight: 'bold' }}>{bands.length}</div>
            <div style={{ color: '#9ca3af' }}>Bands</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '2rem', color: '#dc2626', fontWeight: 'bold' }}>342</div>
            <div style={{ color: '#9ca3af' }}>Reviews</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '2rem', color: '#dc2626', fontWeight: 'bold' }}>1.2K</div>
            <div style={{ color: '#9ca3af' }}>Photos</div>
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '2rem', color: '#dc2626', fontWeight: 'bold' }}>89</div>
            <div style={{ color: '#9ca3af' }}>Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}