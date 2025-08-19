import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Band } from '../types';

interface BandDiscoveryProps {
  bands: Band[];
}

export function BandDiscovery({ bands }: BandDiscoveryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  // Extract unique genres from bands
  const genres = ['all', ...Array.from(new Set(bands.flatMap(band => band.genres || [])))];

  // Filter bands based on search and genre
  const filteredBands = bands.filter(band => {
    const matchesSearch = band.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          band.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || 
                         (band.genres && band.genres.includes(selectedGenre));
    return matchesSearch && matchesGenre;
  });

  return (
    <div style={{
      padding: '1rem',
      maxWidth: '100%'
    }}>
      {/* Search and Filter Controls */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <input
          type="text"
          placeholder="Search bands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-band-search"
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #374151',
            backgroundColor: '#111827',
            color: '#ffffff',
            fontSize: '1rem'
          }}
        />
        
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          data-testid="select-genre-filter"
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #374151',
            backgroundColor: '#111827',
            color: '#ffffff',
            fontSize: '1rem'
          }}
        >
          {genres.map(genre => (
            <option key={genre} value={genre}>
              {genre === 'all' ? 'All Genres' : genre}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div style={{
        marginBottom: '1rem',
        color: '#9ca3af',
        fontSize: '0.875rem'
      }}>
        {filteredBands.length} band{filteredBands.length !== 1 ? 's' : ''} found
      </div>

      {/* Band Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredBands.map(band => (
          <Card 
            key={band.id} 
            data-testid={`card-band-${band.id}`}
            style={{
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <CardHeader>
              <CardTitle data-testid={`text-band-name-${band.id}`}>
                {band.name}
              </CardTitle>
              {band.genres && band.genres.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  {band.genres.map(genre => (
                    <span
                      key={genre}
                      data-testid={`badge-genre-${genre}`}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {band.imageUrl && (
                <img
                  src={band.imageUrl}
                  alt={band.name}
                  data-testid={`img-band-${band.id}`}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                />
              )}
              
              {band.description && (
                <p 
                  data-testid={`text-band-description-${band.id}`}
                  style={{
                    color: '#d1d5db',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '1rem'
                  }}
                >
                  {band.description}
                </p>
              )}
              
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <button
                  data-testid={`button-view-profile-${band.id}`}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                  onClick={() => {
                    console.log('View profile for:', band.name);
                    // Add navigation to band profile here
                  }}
                >
                  View Profile
                </button>
                
                <button
                  data-testid={`button-follow-${band.id}`}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onClick={() => {
                    console.log('Follow band:', band.name);
                    // Add follow functionality here
                  }}
                >
                  Follow
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredBands.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#9ca3af'
        }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#ffffff' }}>
            No bands found
          </h3>
          <p>
            Try adjusting your search terms or genre filter
          </p>
          <button
            data-testid="button-clear-filters"
            onClick={() => {
              setSearchTerm('');
              setSelectedGenre('all');
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}