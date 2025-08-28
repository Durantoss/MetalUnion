import React, { useState } from 'react';
import { OnboardingState, METAL_GENRES } from '../../types/UserProfile';

interface GenreSelectionProps {
  state: OnboardingState;
  onNext: () => void;
  onUpdate: (updates: Partial<OnboardingState>) => void;
}

const GenreSelection: React.FC<GenreSelectionProps> = ({ state, onNext, onUpdate }) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(state.genres || []);

  const toggleGenre = (genre: string) => {
    const newSelection = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    
    setSelectedGenres(newSelection);
  };

  const handleNext = () => {
    if (selectedGenres.length > 0) {
      onUpdate({ genres: selectedGenres });
      onNext();
    }
  };

  const canProceed = selectedGenres.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Choose Your Metal</h2>
        <p style={styles.subtitle}>
          Select the metal genres that fuel your soul. Choose as many as you like.
        </p>
        <div style={styles.counter}>
          {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      <div style={styles.genreGrid}>
        {METAL_GENRES.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          return (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              style={{
                ...styles.genreButton,
                backgroundColor: isSelected ? '#dc2626' : 'rgba(31, 41, 55, 0.8)',
                borderColor: isSelected ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected ? '0 4px 20px rgba(220, 38, 38, 0.4)' : 'none',
              }}
            >
              <span style={styles.genreText}>{genre}</span>
              {isSelected && (
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                  style={styles.checkIcon}
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </button>
          );
        })}
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
          Continue to Band Selection
        </button>
        
        {!canProceed && (
          <p style={styles.requirement}>
            Please select at least one genre to continue
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
    marginBottom: '1rem',
  },
  counter: {
    color: '#facc15',
    fontSize: '0.875rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  genreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  genreButton: {
    padding: '1rem',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '8px',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '60px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  genreText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    textAlign: 'left' as const,
    flex: 1,
  },
  checkIcon: {
    color: '#ffffff',
    marginLeft: '0.5rem',
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

export default GenreSelection;
