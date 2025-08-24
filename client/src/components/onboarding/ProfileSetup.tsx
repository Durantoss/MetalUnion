import React, { useState, useRef } from 'react';
import { OnboardingState } from '../../types/UserProfile';

interface ProfileSetupProps {
  state: OnboardingState;
  onNext: () => void;
  onUpdate: (updates: Partial<OnboardingState>) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ state, onNext, onUpdate }) => {
  const [username, setUsername] = useState(state.username || '');
  const [location, setLocation] = useState(state.location || '');
  const [avatar, setAvatar] = useState(state.avatar || '');
  const [usernameError, setUsernameError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError('');
    
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
    } else if (value.length > 20) {
      setUsernameError('Username must be less than 20 characters');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, hyphens, and underscores');
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (username.length >= 3 && !usernameError) {
      onUpdate({
        username,
        location: location || undefined,
        avatar: avatar || undefined,
      });
      onNext();
    }
  };

  const canProceed = username.length >= 3 && !usernameError;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Create Your Profile</h2>
        <p style={styles.subtitle}>
          Set up your identity in the MoshUnion community
        </p>
      </div>

      <div style={styles.form}>
        {/* Avatar Upload */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarContainer} onClick={() => fileInputRef.current?.click()}>
            {avatar ? (
              <img src={avatar} alt="Avatar" style={styles.avatarImage} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span style={styles.avatarText}>Upload Photo</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Username Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Username *
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="Enter your username"
            style={{
              ...styles.input,
              borderColor: usernameError ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
            }}
            maxLength={20}
          />
          {usernameError && (
            <span style={styles.error}>{usernameError}</span>
          )}
          <span style={styles.hint}>
            This will be your display name in the community
          </span>
        </div>

        {/* Location Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Location (Optional)
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., New York, NY"
            style={styles.input}
            maxLength={50}
          />
          <span style={styles.hint}>
            Help others find local metalheads and shows
          </span>
        </div>
      </div>

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
          Continue to Genre Selection
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '2rem',
    color: '#ffffff',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
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
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
    marginBottom: '2rem',
  },
  avatarSection: {
    display: 'flex',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '2px dashed rgba(220, 38, 38, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: '50%',
  },
  avatarPlaceholder: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    color: '#9ca3af',
  },
  avatarText: {
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#facc15',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  input: {
    padding: '0.75rem',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  hint: {
    color: '#6b7280',
    fontSize: '0.75rem',
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
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
};

export default ProfileSetup;
