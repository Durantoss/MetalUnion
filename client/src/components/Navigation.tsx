import { useState } from 'react';

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onShowComparison: () => void;
  onShowLogin: () => void;
  onReturnHome?: () => void;
}

export function Navigation({ currentSection, onSectionChange, onShowComparison, onShowLogin, onReturnHome }: NavigationProps) {
  const [animatingWord, setAnimatingWord] = useState<'mosh' | 'union' | null>(null);

  const handleLogoClick = () => {
    console.log('Logo clicked, onReturnHome type:', typeof onReturnHome);
    // Start animation sequence
    setAnimatingWord('mosh');
    setTimeout(() => {
      setAnimatingWord('union');
      setTimeout(() => {
        setAnimatingWord(null);
        if (onReturnHome && typeof onReturnHome === 'function') {
          console.log('Calling onReturnHome function');
          onReturnHome();
        } else {
          console.log('onReturnHome not available, using section change fallback');
          onSectionChange('landing');
        }
      }, 150);
    }, 150);
  };
  return (
    <nav style={{
      backgroundColor: '#1f2937',
      borderBottom: '2px solid #374151',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={handleLogoClick}
          style={{
            background: 'none',
            border: 'none',
            fontSize: window.innerWidth < 768 ? '1.25rem' : '1.5rem',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            padding: window.innerWidth < 768 ? '0.75rem' : '0.5rem',
            borderRadius: '4px',
            transition: 'all 0.2s',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            minHeight: '44px',
            minWidth: '120px'
          }}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window)) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <span style={{
            color: animatingWord === 'mosh' ? '#ffffff' : '#dc2626',
            transition: 'color 0.15s ease'
          }}>
            MOSH
          </span>
          <span style={{
            color: animatingWord === 'union' ? '#dc2626' : '#ffffff',
            transition: 'color 0.15s ease'
          }}>
            UNION
          </span>
        </button>
        
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <button
            onClick={() => onSectionChange('bands')}
            style={{
              background: 'none',
              border: 'none',
              color: currentSection === 'bands' ? '#dc2626' : '#d1d5db',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentSection !== 'bands') {
                e.currentTarget.style.color = '#f87171';
              }
            }}
            onMouseLeave={(e) => {
              if (currentSection !== 'bands') {
                e.currentTarget.style.color = '#d1d5db';
              }
            }}
          >
            Bands
          </button>
          
          <button
            onClick={() => onSectionChange('tours')}
            style={{
              background: 'none',
              border: 'none',
              color: currentSection === 'tours' ? '#dc2626' : '#d1d5db',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentSection !== 'tours') {
                e.currentTarget.style.color = '#f87171';
              }
            }}
            onMouseLeave={(e) => {
              if (currentSection !== 'tours') {
                e.currentTarget.style.color = '#d1d5db';
              }
            }}
          >
            Tours
          </button>
          
          <button
            onClick={() => onSectionChange('reviews')}
            style={{
              background: 'none',
              border: 'none',
              color: currentSection === 'reviews' ? '#dc2626' : '#d1d5db',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentSection !== 'reviews') {
                e.currentTarget.style.color = '#f87171';
              }
            }}
            onMouseLeave={(e) => {
              if (currentSection !== 'reviews') {
                e.currentTarget.style.color = '#d1d5db';
              }
            }}
          >
            Reviews
          </button>
          
          <button
            onClick={() => onSectionChange('photos')}
            style={{
              background: 'none',
              border: 'none',
              color: currentSection === 'photos' ? '#dc2626' : '#d1d5db',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentSection !== 'photos') {
                e.currentTarget.style.color = '#f87171';
              }
            }}
            onMouseLeave={(e) => {
              if (currentSection !== 'photos') {
                e.currentTarget.style.color = '#d1d5db';
              }
            }}
          >
            Photos
          </button>
          
          <button
            onClick={() => onSectionChange('admin')}
            style={{
              background: 'none',
              border: 'none',
              color: currentSection === 'admin' ? '#facc15' : '#d1d5db',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (currentSection !== 'admin') {
                e.currentTarget.style.color = '#facc15';
              }
            }}
            onMouseLeave={(e) => {
              if (currentSection !== 'admin') {
                e.currentTarget.style.color = '#d1d5db';
              }
            }}
          >
            🛡️ Admin
          </button>

        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onShowComparison}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#047857';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
          >
            Compare
          </button>
          
          <button 
            onClick={onShowLogin}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}