import React, { useState, useEffect } from 'react';
import { OnboardingState } from '../../types/UserProfile';
import { saveOnboardingState, loadOnboardingState, validateOnboardingStep } from '../../utils/onboarding';
import ProgressBar from './ProgressBar';
import ProfileSetup from './ProfileSetup';
import GenreSelection from './GenreSelection';
import BandSelection from './BandSelection';
import PreferencesSetup from './PreferencesSetup';
import WelcomeStep from './WelcomeStep';

interface OnboardingFlowProps {
  userId?: string;
  onComplete: () => void;
}

const TOTAL_STEPS = 4;

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId, onComplete }) => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    genres: [],
    bands: [],
    contentPrefs: [],
    notificationPrefs: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadOnboardingState();
    if (savedState) {
      setState(savedState);
    }
    setIsLoading(false);
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveOnboardingState(state);
    }
  }, [state, isLoading]);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates,
    }));
  };

  const nextStep = () => {
    const canProceed = validateOnboardingStep(state.currentStep, state);
    if (canProceed && state.currentStep < TOTAL_STEPS) {
      updateState({ currentStep: state.currentStep + 1 });
    }
  };

  const previousStep = () => {
    if (state.currentStep > 1) {
      updateState({ currentStep: state.currentStep - 1 });
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header with Logo */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <svg width="200" height="60" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
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
        </div>

        {/* Progress Bar - only show for steps 1-4 */}
        {state.currentStep <= TOTAL_STEPS && (
          <ProgressBar currentStep={state.currentStep} totalSteps={TOTAL_STEPS} />
        )}

        {/* Navigation - only show for steps 2-4 */}
        {state.currentStep > 1 && state.currentStep <= TOTAL_STEPS && (
          <div style={styles.navigation}>
            <button
              onClick={previousStep}
              style={styles.backButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6" />
              </svg>
              Back
            </button>
          </div>
        )}

        {/* Step Content */}
        <div style={styles.stepContent}>
          {state.currentStep === 1 && (
            <ProfileSetup
              state={state}
              onNext={nextStep}
              onUpdate={updateState}
            />
          )}
          
          {state.currentStep === 2 && (
            <GenreSelection
              state={state}
              onNext={nextStep}
              onUpdate={updateState}
            />
          )}
          
          {state.currentStep === 3 && (
            <BandSelection
              state={state}
              onNext={nextStep}
              onUpdate={updateState}
            />
          )}
          
          {state.currentStep === 4 && (
            <PreferencesSetup
              state={state}
              onNext={nextStep}
              onUpdate={updateState}
            />
          )}
          
          {state.currentStep === 5 && (
            <WelcomeStep
              state={state}
              userId={userId}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>

      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .onboarding-step {
            animation: fadeIn 0.4s ease-out;
          }
          
          @media (max-width: 768px) {
            .onboarding-container {
              padding: 1rem;
            }
            
            .onboarding-content {
              max-width: 100%;
            }
          }
        `
      }} />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  loadingContainer: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
    color: '#9ca3af',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(220, 38, 38, 0.3)',
    borderTop: '3px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '1rem',
    fontWeight: '500',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '2rem',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'transparent',
    color: '#9ca3af',
    border: '1px solid rgba(156, 163, 175, 0.3)',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  stepContent: {
    // Animation will be handled by global CSS
  },
};

export default OnboardingFlow;
