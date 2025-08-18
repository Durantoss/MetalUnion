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

interface SimpleLandingFallbackProps {
  onSectionChange: (section: string) => void;
  bands: Band[];
}

export function SimpleLandingFallback({ onSectionChange, bands }: SimpleLandingFallbackProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 50%, #1a1a1a 100%)',
      color: '#ffffff',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #dc2626, #facc15)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '1rem'
        }}>
          MOSHUNION
        </h1>
        <p style={{
          color: '#d1d5db',
          fontSize: '1.2rem',
          marginBottom: '2rem'
        }}>
          Metal & Rock Community Platform
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '3rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(220, 38, 38, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', color: '#facc15' }}>🎸</div>
          <div style={{ color: '#dc2626', fontWeight: 'bold' }}>{bands.length}</div>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Bands</div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(220, 38, 38, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', color: '#facc15' }}>🎯</div>
          <div style={{ color: '#dc2626', fontWeight: 'bold' }}>Live</div>
          <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Events</div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {[
          { id: 'bands', title: 'Bands', icon: '🎸', desc: 'Discover metal bands' },
          { id: 'tours', title: 'Tours', icon: '🚌', desc: 'Find concert dates' },
          { id: 'events', title: 'Events', icon: '🎯', desc: 'AI-powered discovery' },
          { id: 'social', title: 'Social', icon: '💬', desc: 'Connect with fans' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              borderRadius: '16px',
              padding: '2rem',
              color: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.5)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{section.icon}</div>
            <h3 style={{
              color: '#facc15',
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem'
            }}>
              {section.title}
            </h3>
            <p style={{
              color: '#9ca3af',
              fontSize: '1rem'
            }}>
              {section.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}