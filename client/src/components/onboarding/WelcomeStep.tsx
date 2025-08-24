import React, { useState } from 'react';
import { OnboardingState } from '../../types/UserProfile';
import { submitOnboardingData } from '../../utils/onboarding';

interface WelcomeStepProps {
  state: OnboardingState;
  userId?: string;
  onComplete: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ state, userId, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnterPit = async () => {
    if (!userId) {
      setError('User authentication required. Please try logging in again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await submitOnboardingData(state, userId);
      if (success) {
        onComplete();
      } else {
        setError('Failed to save your profile. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <svg width="300" height="90" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <style>
                {`
                  .text {
                    font-family: 'Oswald', sans-serif;
                    font-weight: 900;
                    font-size: 64px;
                    fill: white;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                  }
                  .highlight {
                    fill: #B00020;
                  }
                  .distress {
                    filter: url(#roughen);
                  }
                `}
              </style>
              <filter id="roughen">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="noise"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
            </defs>

            <text x="10" y="80" className="text highlight distress">M</text>
            <text x="310" y="80" className="text highlight distress">U</text>
            <text x="60" y="80" className="text distress">osh</text>
            <text x="160" y="80" className="text distress">Union</text>
          </svg>
        </div>

        {/* Welcome Message */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.title}>Welcome to the Pit!</h1>
          <p style={styles.subtitle}>
            Your profile is ready, {state.username}. You're now part of the MoshUnion community.
          </p>
        </div>

        {/* Profile Summary */}
        <div style={styles.summaryCard}>
          <h2 style={styles.summaryTitle}>Your Profile Summary</h2>
          
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <div style={styles.summaryLabel}>Username</div>
                <div style={styles.summaryValue}>{state.username}</div>
              </div>
            </div>

            {state.location && (
              <div style={styles.summaryItem}>
                <div style={styles.summaryIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div style={styles.summaryLabel}>Location</div>
                  <div style={styles.summaryValue}>{state.location}</div>
                </div>
              </div>
            )}

            <div style={styles.summaryItem}>
              <div style={styles.summaryIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div>
                <div style={styles.summaryLabel}>Favorite Genres</div>
                <div style={styles.summaryValue}>
                  {state.genres.length} genre{state.genres.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            </div>

            <div style={styles.summaryItem}>
              <div style={styles.summaryIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <div style={styles.summaryLabel}>Favorite Bands</div>
                <div style={styles.summaryValue}>
                  {state.bands.length} band{state.bands.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div style={styles.featuresSection}>
          <h3 style={styles.featuresTitle}>What's Next?</h3>
          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🎸</span>
              <span>Discover new bands based on your preferences</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🎤</span>
              <span>Connect with fellow metalheads in The Pit</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🎵</span>
              <span>Get personalized tour and concert recommendations</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📸</span>
              <span>Share concert photos and reviews</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Action Button */}
        <div style={styles.actions}>
          <button
            onClick={handleEnterPit}
            disabled={isSubmitting}
            style={{
              ...styles.enterButton,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? (
              <div style={styles.loadingContent}>
                <div style={styles.spinner}></div>
                <span>Setting up your profile...</span>
              </div>
            ) : (
              'ENTER THE PIT'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
  },
  content: {
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center' as const,
    color: '#ffffff',
  },
  logoContainer: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'center',
  },
  welcomeSection: {
    marginBottom: '3rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#dc2626',
    fontFamily: "'Oswald', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#9ca3af',
    lineHeight: '1.6',
  },
  summaryCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    textAlign: 'left' as const,
  },
  summaryTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#facc15',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  summaryGrid: {
    display: 'grid',
    gap: '1rem',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
  },
  summaryIcon: {
    color: '#dc2626',
    flexShrink: 0,
  },
  summaryLabel: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: '1rem',
    color: '#ffffff',
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: '3rem',
  },
  featuresTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#facc15',
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    textAlign: 'left' as const,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#d1d5db',
  },
  featureIcon: {
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.875rem',
    margin: 0,
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
  },
  enterButton: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '1rem 3rem',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.125rem',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    transition: 'all 0.3s ease',
    fontFamily: "'Oswald', sans-serif",
    minWidth: '200px',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default WelcomeStep;
