import { useState } from 'react';

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

interface BandComparisonProps {
  bands: Band[];
  onClose: () => void;
}

export function BandComparison({ bands, onClose }: BandComparisonProps) {
  const [selectedBands, setSelectedBands] = useState<Band[]>([]);
  const [showSelection, setShowSelection] = useState(true);

  const addBandToComparison = (band: Band) => {
    if (selectedBands.length < 3 && !selectedBands.find(b => b.id === band.id)) {
      setSelectedBands([...selectedBands, band]);
    }
  };

  const removeBandFromComparison = (bandId: string) => {
    setSelectedBands(selectedBands.filter(b => b.id !== bandId));
  };

  const startComparison = () => {
    if (selectedBands.length >= 2) {
      setShowSelection(false);
    }
  };

  if (showSelection) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          padding: '2rem',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>

          <h2 style={{
            fontSize: '2rem',
            color: '#dc2626',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Band Comparison Tool
          </h2>

          <p style={{
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            Select 2-3 bands to compare side by side
          </p>

          {selectedBands.length > 0 && (
            <div style={{
              backgroundColor: '#374151',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: '#f87171', marginBottom: '1rem' }}>
                Selected Bands ({selectedBands.length}/3):
              </h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {selectedBands.map(band => (
                  <div
                    key={band.id}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    {band.name}
                    <button
                      onClick={() => removeBandFromComparison(band.id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {selectedBands.length >= 2 && (
                <button
                  onClick={startComparison}
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    marginTop: '1rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Compare Bands
                </button>
              )}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {bands.map(band => {
              const isSelected = selectedBands.find(b => b.id === band.id);
              const canAdd = selectedBands.length < 3;
              
              return (
                <div
                  key={band.id}
                  style={{
                    backgroundColor: isSelected ? '#dc2626' : '#374151',
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: canAdd && !isSelected ? 'pointer' : 'default',
                    opacity: !canAdd && !isSelected ? 0.5 : 1,
                    transition: 'all 0.2s',
                    border: isSelected ? '2px solid #f87171' : '2px solid transparent'
                  }}
                  onClick={() => !isSelected && canAdd && addBandToComparison(band)}
                >
                  {band.imageUrl && (
                    <img
                      src={band.imageUrl}
                      alt={band.name}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        marginBottom: '0.5rem'
                      }}
                    />
                  )}
                  <h4 style={{
                    color: 'white',
                    fontSize: '1rem',
                    marginBottom: '0.25rem',
                    fontWeight: 'bold'
                  }}>
                    {band.name}
                  </h4>
                  <p style={{
                    color: isSelected ? '#fca5a5' : '#d1d5db',
                    fontSize: '0.8rem'
                  }}>
                    {band.genre}
                  </p>
                  {isSelected && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.8rem',
                      color: '#fca5a5',
                      fontWeight: '600'
                    }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000,
      padding: '2rem',
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '12px',
        padding: '2rem',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            color: '#dc2626',
            margin: 0
          }}>
            Band Comparison
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowSelection(true)}
              style={{
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              Change Selection
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${selectedBands.length}, 1fr)`,
          gap: '2rem'
        }}>
          {selectedBands.map(band => (
            <div
              key={band.id}
              style={{
                backgroundColor: '#374151',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '2px solid #dc2626'
              }}
            >
              {band.imageUrl && (
                <img
                  src={band.imageUrl}
                  alt={band.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                />
              )}
              
              <h3 style={{
                color: '#dc2626',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {band.name}
              </h3>

              <div style={{ color: 'white', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#f87171' }}>Genre:</strong>
                  <div style={{ color: '#d1d5db', marginTop: '0.25rem' }}>{band.genre}</div>
                </div>

                {band.founded && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#f87171' }}>Founded:</strong>
                    <div style={{ color: '#d1d5db', marginTop: '0.25rem' }}>{band.founded}</div>
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#f87171' }}>Description:</strong>
                  <div style={{ 
                    color: '#d1d5db', 
                    marginTop: '0.25rem',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {band.description}
                  </div>
                </div>

                {band.members && band.members.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#f87171' }}>Members:</strong>
                    <div style={{ color: '#d1d5db', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                      {band.members.join(', ')}
                    </div>
                  </div>
                )}

                {band.albums && band.albums.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#f87171' }}>Notable Albums:</strong>
                    <div style={{ color: '#d1d5db', marginTop: '0.25rem', fontSize: '0.9rem' }}>
                      {band.albums.slice(0, 3).join(', ')}
                      {band.albums.length > 3 && '...'}
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  {band.website && (
                    <a
                      href={band.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      Website
                    </a>
                  )}
                  {band.instagram && (
                    <a
                      href={band.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}