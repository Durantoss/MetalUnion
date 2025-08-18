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

interface QuickFixProps {
  bands: Band[];
  onSectionChange: (section: string) => void;
}

export function QuickFix({ bands, onSectionChange }: QuickFixProps) {
  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          color: '#dc2626',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          🤘 MOSHUNION 🤘
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#9ca3af',
          marginBottom: '2rem'
        }}>
          The Ultimate Metal Community Platform
        </p>
        <p style={{
          fontSize: '1rem',
          color: '#facc15'
        }}>
          {bands.length} Metal Bands • Live Community • Tour Dates
        </p>
      </header>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '3rem'
      }}>
        {[
          { id: 'tours', title: '🎯 Events & Tours', bg: '#dc2626' },
          { id: 'social', title: '💬 Social Hub', bg: '#7c3aed' },
          { id: 'reviews', title: '⭐ Reviews', bg: '#059669' },
          { id: 'photos', title: '📸 Photo Gallery', bg: '#ea580c' }
        ].map(section => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            style={{
              backgroundColor: section.bg,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {bands.slice(0, 6).map(band => (
          <div
            key={band.id}
            style={{
              backgroundColor: '#1f2937',
              border: '2px solid #374151',
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
              color: '#facc15',
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
              {band.description?.substring(0, 100)}...
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
                  fontWeight: '600'
                }}
              >
                Visit Website ↗
              </a>
            )}
          </div>
        ))}
      </div>

      <footer style={{
        textAlign: 'center',
        marginTop: '3rem',
        padding: '2rem',
        borderTop: '1px solid #374151'
      }}>
        <p style={{ color: '#9ca3af' }}>
          MoshUnion - Connecting metalheads worldwide 🤘
        </p>
      </footer>
    </div>
  );
}