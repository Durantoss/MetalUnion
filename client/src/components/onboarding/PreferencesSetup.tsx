import React, { useState } from 'react';
import { OnboardingState, CONTENT_PREFERENCES, NOTIFICATION_PREFERENCES } from '../../types/UserProfile';

interface PreferencesSetupProps {
  state: OnboardingState;
  onNext: () => void;
  onUpdate: (updates: Partial<OnboardingState>) => void;
}

const PreferencesSetup: React.FC<PreferencesSetupProps> = ({ state, onNext, onUpdate }) => {
  const [contentPrefs, setContentPrefs] = useState<string[]>(state.contentPrefs || []);
  const [notificationPrefs, setNotificationPrefs] = useState<string[]>(state.notificationPrefs || []);

  const toggleContentPref = (prefId: string) => {
    const newPrefs = contentPrefs.includes(prefId)
      ? contentPrefs.filter(p => p !== prefId)
      : [...contentPrefs, prefId];
    
    setContentPrefs(newPrefs);
  };

  const toggleNotificationPref = (prefId: string) => {
    const newPrefs = notificationPrefs.includes(prefId)
      ? notificationPrefs.filter(p => p !== prefId)
      : [...notificationPrefs, prefId];
    
    setNotificationPrefs(newPrefs);
  };

  const handleNext = () => {
    onUpdate({ 
      contentPrefs,
      notificationPrefs 
    });
    onNext();
  };

  const canProceed = contentPrefs.length > 0 || notificationPrefs.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Customize Your Experience</h2>
        <p style={styles.subtitle}>
          Choose what content you want to see and how you'd like to be notified. You can change these anytime.
        </p>
      </div>

      <div style={styles.sectionsContainer}>
        {/* Content Preferences */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.sectionIcon}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Content Preferences
          </h3>
          <p style={styles.sectionDescription}>
            What type of content would you like to see in your feed?
          </p>
          <div style={styles.preferencesGrid}>
            {CONTENT_PREFERENCES.map((pref) => {
              const isSelected = contentPrefs.includes(pref.id);
              return (
                <div
                  key={pref.id}
                  onClick={() => toggleContentPref(pref.id)}
                  style={{
                    ...styles.preferenceCard,
                    backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.2)' : 'rgba(31, 41, 55, 0.8)',
                    borderColor: isSelected ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={styles.preferenceHeader}>
                    <h4 style={styles.preferenceTitle}>{pref.label}</h4>
                    {isSelected && (
                      <div style={styles.checkmark}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p style={styles.preferenceDescription}>{pref.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notification Preferences */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.sectionIcon}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            Notification Settings
          </h3>
          <p style={styles.sectionDescription}>
            How would you like to stay updated with MoshUnion?
          </p>
          <div style={styles.preferencesGrid}>
            {NOTIFICATION_PREFERENCES.map((pref) => {
              const isSelected = notificationPrefs.includes(pref.id);
              return (
                <div
                  key={pref.id}
                  onClick={() => toggleNotificationPref(pref.id)}
                  style={{
                    ...styles.preferenceCard,
                    backgroundColor: isSelected ? 'rgba(250, 204, 21, 0.2)' : 'rgba(31, 41, 55, 0.8)',
                    borderColor: isSelected ? '#facc15' : 'rgba(220, 38, 38, 0.3)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={styles.preferenceHeader}>
                    <h4 style={styles.preferenceTitle}>{pref.label}</h4>
                    {isSelected && (
                      <div style={{...styles.checkmark, color: '#facc15'}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p style={styles.preferenceDescription}>{pref.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      {(contentPrefs.length > 0 || notificationPrefs.length > 0) && (
        <div style={styles.summary}>
          <h3 style={styles.summaryTitle}>Your Selections:</h3>
          <div style={styles.summaryContent}>
            {contentPrefs.length > 0 && (
              <div style={styles.summarySection}>
                <span style={styles.summaryLabel}>Content:</span>
                <span style={styles.summaryValue}>
                  {contentPrefs.length} preference{contentPrefs.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            )}
            {notificationPrefs.length > 0 && (
              <div style={styles.summarySection}>
                <span style={styles.summaryLabel}>Notifications:</span>
                <span style={styles.summaryValue}>
                  {notificationPrefs.length} setting{notificationPrefs.length !== 1 ? 's' : ''} enabled
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={styles.actions}>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          style={{
            ...styles.nextButton,
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          Complete Setup
        </button>
        
        {!canProceed && (
          <p style={styles.requirement}>
            Please select at least one preference to continue
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    color: '#ffffff',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '900',
    color: '#dc2626',
    fontFamily: "'Oswald', sans-serif",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: '1rem',
    lineHeight: '1.5',
  },
  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3rem',
    marginBottom: '3rem',
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#facc15',
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  sectionIcon: {
    color: '#facc15',
  },
  sectionDescription: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    lineHeight: '1.5',
  },
  preferencesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  },
  preferenceCard: {
    padding: '1.5rem',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  preferenceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  preferenceTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  checkmark: {
    color: '#dc2626',
  },
  preferenceDescription: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    margin: 0,
    lineHeight: '1.4',
  },
  summary: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  summaryTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#facc15',
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  summaryContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  summarySection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
  },
  nextButton: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    transition: 'all 0.3s ease',
    fontFamily: "'Oswald', sans-serif",
  },
  requirement: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    fontStyle: 'italic',
    textAlign: 'center' as const,
  },
};

export default PreferencesSetup;
