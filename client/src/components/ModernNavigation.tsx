// Static navigation component without hooks for stability
interface ModernNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onShowComparison: () => void;
  onShowLogin: () => void;
  onReturnHome?: () => void;
}

export function ModernNavigation({ 
  currentSection, 
  onSectionChange, 
  onShowComparison, 
  onShowLogin, 
  onReturnHome 
}: ModernNavigationProps) {
  const handleLogoClick = () => {
    if (onReturnHome && typeof onReturnHome === 'function') {
      onReturnHome();
    } else {
      onSectionChange('landing');
    }
  };

  const navItems = [
    { id: 'bands', label: 'DISCOVER' },
    { id: 'social', label: 'THE PIT' },
    { id: 'events', label: 'EVENT DISCOVERY' },
    { id: 'tours', label: 'TOURS' },
    { id: 'reviews', label: 'REVIEWS' },
    { id: 'photos', label: 'PHOTOS' }
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(153, 27, 27, 0.3)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4rem'
      }}>
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          data-testid="logo-button"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0rem',
            fontSize: '1.5rem',
            fontWeight: '900',
            fontFamily: 'monospace'
          }}>
            <span style={{
              color: '#dc2626',
              textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              MOSH
            </span>
            <span style={{
              color: '#ffffff',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              UNION
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentSection === item.id ? 'rgba(220, 38, 38, 0.2)' : 'transparent',
                color: currentSection === item.id ? '#facc15' : '#d1d5db',
                border: currentSection === item.id ? '1px solid rgba(220, 38, 38, 0.5)' : '1px solid transparent',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'monospace'
              }}
              onMouseEnter={(e) => {
                if (currentSection !== item.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                  e.currentTarget.style.color = '#facc15';
                }
              }}
              onMouseLeave={(e) => {
                if (currentSection !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#d1d5db';
                }
              }}
              data-testid={`nav-${item.id}`}
            >

              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <button
            onClick={onShowComparison}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              color: '#facc15',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'monospace'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)';
            }}
            data-testid="compare-button"
          >
            COMPARE
          </button>

          <button
            onClick={onShowLogin}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(45deg, #dc2626, #facc15)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'monospace'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            data-testid="login-button"
          >
            LOGIN
          </button>
        </div>
      </div>
    </nav>
  );
}