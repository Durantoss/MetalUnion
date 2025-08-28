import React, { useState, useEffect } from 'react';
import { OnboardingState } from '../../types/UserProfile';
import { Band } from '../../types';

interface BandSelectionProps {
  state: OnboardingState;
  onNext: () => void;
  onUpdate: (updates: Partial<OnboardingState>) => void;
}

const BandSelection: React.FC<BandSelectionProps> = ({ state, onNext, onUpdate }) => {
  const [selectedBands, setSelectedBands] = useState<string[]>(state.bands || []);
  const [availableBands, setAvailableBands] = useState<Band[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [customBand, setCustomBand] = useState('');

  useEffect(() => {
    fetchBands();
  }, []);

  const fetchBands = async () => {
    try {
      const response = await fetch('/api/bands');
      if (response.ok) {
        const bands = await response.json();
        setAvailableBands(bands);
      } else {
        // Fallback to mock data if API fails
        setAvailableBands(mockBands);
      }
    } catch (error) {
      console.error('Failed to fetch bands:', error);
      setAvailableBands(mockBands);
    } finally {
      setLoading(false);
    }
  };

  const filteredBands = availableBands.filter(band =>
    band.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    band.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBand = (bandName: string) => {
    const newSelection = selectedBands.includes(bandName)
      ? selectedBands.filter(b => b !== bandName)
      : [...selectedBands, bandName];
    
    setSelectedBands(newSelection);
  };

  const addCustomBand = () => {
    if (customBand.trim() && !selectedBands.includes(customBand.trim())) {
      const newSelection = [...selectedBands, customBand.trim()];
      setSelectedBands(newSelection);
      setCustomBand('');
    }
  };

  const handleNext = () => {
    if (selectedBands.length > 0) {
      onUpdate({ bands: selectedBands });
      onNext();
    }
  };

  const canProceed = selectedBands.length > 0;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading bands...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Choose Your Bands</h2>
        <p style={styles.subtitle}>
          Select your favorite metal bands or add your own. This helps us recommend similar artists.
        </p>
        <div style={styles.counter}>
          {selectedBands.length} band{selectedBands.length !== 1 ? 's' : ''} selected
        </div>
      </div>

      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search bands by name or genre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.customBandSection}>
        <div style={styles.customBandInput}>
          <input
            type="text"
            placeholder="Add a band not in the list..."
            value={customBand}
            onChange={(e) => setCustomBand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomBand()}
            style={styles.input}
          />
          <button
            onClick={addCustomBand}
            disabled={!customBand.trim()}
            style={{
              ...styles.addButton,
              opacity: customBand.trim() ? 1 : 0.5,
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div style={styles.bandsGrid}>
        {filteredBands.map((band) => {
          const isSelected = selectedBands.includes(band.name);
          return (
            <div
              key={band.id}
              onClick={() => toggleBand(band.name)}
              style={{
                ...styles.bandCard,
                backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.2)' : 'rgba(31, 41, 55, 0.8)',
                borderColor: isSelected ? '#dc2626' : 'rgba(220, 38, 38, 0.3)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {band.imageUrl && (
                <img
                  src={band.imageUrl}
                  alt={band.name}
                  style={styles.bandImage}
                />
              )}
              <div style={styles.bandInfo}>
                <h3 style={styles.bandName}>{band.name}</h3>
                <p style={styles.bandGenre}>{band.genre}</p>
                {band.founded && (
                  <p style={styles.bandYear}>Est. {band.founded}</p>
                )}
              </div>
              {isSelected && (
                <div style={styles.selectedIndicator}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedBands.length > 0 && (
        <div style={styles.selectedBands}>
          <h3 style={styles.selectedTitle}>Selected Bands:</h3>
          <div style={styles.selectedList}>
            {selectedBands.map((band) => (
              <span
                key={band}
                style={styles.selectedBand}
                onClick={() => toggleBand(band)}
              >
                {band}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </span>
            ))}
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
          Continue to Preferences
        </button>
        
        {!canProceed && (
          <p style={styles.requirement}>
            Please select at least one band to continue
          </p>
        )}
      </div>
    </div>
  );
};

// Mock bands data for fallback
const mockBands: Band[] = [
  { id: '1', name: 'Metallica', genre: 'Thrash Metal', description: 'Legendary thrash metal band' },
  { id: '2', name: 'Iron Maiden', genre: 'Heavy Metal', description: 'British heavy metal pioneers' },
  { id: '3', name: 'Black Sabbath', genre: 'Heavy Metal', description: 'Godfathers of heavy metal' },
  { id: '4', name: 'Slayer', genre: 'Thrash Metal', description: 'Aggressive thrash metal legends' },
  { id: '5', name: 'Megadeth', genre: 'Thrash Metal', description: 'Technical thrash metal masters' },
  { id: '6', name: 'Judas Priest', genre: 'Heavy Metal', description: 'Metal gods' },
  { id: '7', name: 'Pantera', genre: 'Groove Metal', description: 'Groove metal pioneers' },
  { id: '8', name: 'Death', genre: 'Death Metal', description: 'Death metal innovators' },
  { id: '9', name: 'Opeth', genre: 'Progressive Metal', description: 'Progressive death metal' },
  { id: '10', name: 'Tool', genre: 'Progressive Metal', description: 'Progressive metal artists' },
];

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
    color: '#ffffff',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
    padding: '4rem',
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
  searchSection: {
    marginBottom: '1rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
  },
  customBandSection: {
    marginBottom: '2rem',
  },
  customBandInput: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#facc15',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  bandsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  bandCard: {
    padding: '1rem',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    border: '1px solid rgba(220, 38, 38, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'relative' as const,
  },
  bandImage: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover' as const,
  },
  bandInfo: {
    flex: 1,
  },
  bandName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 0.25rem 0',
  },
  bandGenre: {
    fontSize: '0.875rem',
    color: '#facc15',
    margin: '0 0 0.25rem 0',
  },
  bandYear: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    margin: 0,
  },
  selectedIndicator: {
    color: '#dc2626',
    position: 'absolute' as const,
    top: '0.5rem',
    right: '0.5rem',
  },
  selectedBands: {
    marginBottom: '2rem',
  },
  selectedTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#facc15',
    marginBottom: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  selectedList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  selectedBand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    borderRadius: '20px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
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

export default BandSelection;
