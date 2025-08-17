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
  const featuredBands = bands?.slice(0, 3) || [];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      position: 'relative'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '900',
          color: '#dc2626',
          fontFamily: 'monospace'
        }}>
          MOSHUNION
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onSectionChange('bands')}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              color: '#dc2626',
              fontSize: '12px',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
            data-testid="button-discover"
          >
            BANDS
          </button>
          <button
            onClick={() => onSectionChange('social')}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(251, 191, 36, 0.2)',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              color: '#fbbf24',
              fontSize: '12px',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
            data-testid="button-social"
          >
            SOCIAL
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: '#dc2626',
          fontFamily: 'monospace',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          marginBottom: '1rem',
          lineHeight: '1.2'
        }}>
          METAL UNITED
        </h1>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#9ca3af',
          marginBottom: '2rem',
          maxWidth: '400px',
          lineHeight: '1.5'
        }}>
          The ultimate social platform for metal and rock music communities
        </p>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          marginBottom: '2rem',
          width: '100%',
          maxWidth: '300px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
              {bands.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>BANDS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>500+</div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>REVIEWS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f97316' }}>1.2K</div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>PHOTOS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>50+</div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>TOURS</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '300px'
        }}>
          <button
            onClick={() => onSectionChange('social')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(to right, #dc2626, #f97316)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
            data-testid="button-join-community"
          >
            JOIN THE COMMUNITY
          </button>
          <button
            onClick={() => onSectionChange('bands')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#fbbf24',
              border: '2px solid #fbbf24',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            data-testid="button-explore-bands"
          >
            EXPLORE BANDS
          </button>
        </div>
      </div>

      {/* Featured Bands */}
      {featuredBands.length > 0 && (
        <div style={{
          padding: '20px',
          paddingBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#dc2626'
          }}>
            FEATURED BANDS
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {featuredBands.map((band) => (
              <div
                key={band.id}
                style={{
                  backgroundColor: 'rgba(31, 41, 55, 0.8)',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '16px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = '#374151';
                }}
              >
                {band.imageUrl && (
                  <img
                    src={band.imageUrl}
                    alt={band.name}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}
                  />
                )}
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: '#dc2626',
                  marginBottom: '8px'
                }}>
                  {band.name}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#fbbf24',
                  marginBottom: '8px'
                }}>
                  {band.genre}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  lineHeight: '1.4'
                }}>
                  {band.description.length > 100 
                    ? band.description.substring(0, 100) + '...' 
                    : band.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}