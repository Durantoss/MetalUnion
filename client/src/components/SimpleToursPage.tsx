import React, { useState } from 'react';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';

export function SimpleToursPage() {
  console.log('SimpleToursPage component is rendering!');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/tours/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          location: '',
          preferredGenres: ['metal', 'rock'],
          priceRange: { min: 20, max: 300 }
        })
      });
      
      const tours = await response.json();
      setSearchResults(tours || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 50%, #1a1a1a 100%)',
      padding: '1rem',
      paddingTop: '2rem'
    }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 8vw, 4rem)',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #dc2626, #facc15)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '1rem'
        }}>
          🚌 TOUR DATES
        </h1>
        <p style={{
          color: '#d1d5db',
          fontSize: '1.2rem',
          marginBottom: '2rem'
        }}>
          Discover epic tours powered by AI recommendations
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 2rem auto',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '16px',
          padding: '1rem',
          border: '2px solid rgba(220, 38, 38, 0.4)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)',
          margin: '0 0.5rem'
        }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="🔍 Search tours: metallica, iron maiden, metal tour 2025..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '16px 100px 16px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '12px 24px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </div>

          {/* Quick Search Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                setSearchQuery('metal tour 2025');
                setTimeout(() => handleSearch(), 100);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                color: '#eab308',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🤘 Metal Tours
            </button>
            
            <button
              onClick={() => {
                setSearchQuery('rock festival');
                setTimeout(() => handleSearch(), 100);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                color: '#dc2626',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🎸 Rock Festivals
            </button>
            
            <button
              onClick={() => {
                setSearchQuery('metallica tour');
                setTimeout(() => handleSearch(), 100);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ⚡ Metallica
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {searchResults.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {searchResults.map((tour, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {tour.posterUrl && (
                  <img
                    src={tour.posterUrl}
                    alt={tour.tourName}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      marginBottom: '1rem'
                    }}
                  />
                )}
                <h3 style={{
                  color: '#dc2626',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {tour.tourName}
                </h3>
                <p style={{
                  color: '#eab308',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}>
                  {tour.headliner} • {tour.bands?.join(', ')}
                </p>
                {tour.description && (
                  <p style={{
                    color: '#d1d5db',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    lineHeight: '1.4'
                  }}>
                    {tour.description}
                  </p>
                )}
                {tour.currentStops && tour.currentStops.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ color: '#facc15', fontSize: '1rem', marginBottom: '0.5rem' }}>
                      Upcoming Shows:
                    </h4>
                    {tour.currentStops.slice(0, 3).map((stop, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <div style={{ color: 'white', fontSize: '0.9rem' }}>
                          📍 {stop.city}, {stop.state || stop.country}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                          {stop.venue} • {stop.date}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(220, 38, 38, 0.3)'
          }}>
            <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>
              No tours found for "{searchQuery}"
            </h3>
            <p style={{ color: '#9ca3af' }}>
              Try searching for different bands or tour names
            </p>
          </div>
        )}

        {!searchQuery && !isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '12px',
            border: '1px solid rgba(220, 38, 38, 0.3)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              🎸
            </div>
            <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>
              Ready to discover amazing tours?
            </h3>
            <p style={{ color: '#9ca3af' }}>
              Search for your favorite bands or use the quick search buttons above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}