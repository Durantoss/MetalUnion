import React from 'react';

interface SharedSectionLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function SharedSectionLayout({ children, title, subtitle }: SharedSectionLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundImage: `
        linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%),
        radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
      `,
      backgroundColor: '#0a0a0a',
      backgroundSize: '100% 100%, 300px 300px, 300px 300px, 200px 200px',
      backgroundPosition: '0 0, 0 0, 100% 0, 50% 50%',
      backgroundRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 98px,
            rgba(220, 38, 38, 0.03) 100px
          ),
          repeating-linear-gradient(
            180deg,
            transparent,
            transparent 98px,
            rgba(220, 38, 38, 0.03) 100px
          )
        `,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          paddingTop: '2rem'
        }}>
          <h1 style={{
            fontSize: window.innerWidth < 768 ? '2.5rem' : '4rem',
            fontWeight: '900',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #dc2626, #ffffff, #facc15)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.1em',
            textShadow: '0 0 40px rgba(220, 38, 38, 0.5)'
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem',
              color: '#9ca3af',
              marginBottom: '2rem',
              fontWeight: '500'
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Section Content */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '16px',
          padding: window.innerWidth < 768 ? '1.5rem' : '2rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}