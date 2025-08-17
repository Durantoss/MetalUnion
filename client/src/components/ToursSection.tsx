import { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';

interface Tour {
  id: string;
  bandName: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  ticketUrl?: string;
}

export function ToursSection() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/tours')
      .then(response => response.json())
      .then(data => {
        setTours(data);
        setFilteredTours(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading tours:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredTours(tours);
    } else {
      const filtered = tours.filter(tour =>
        tour.bandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tour.city + ' ' + tour.country).toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTours(filtered);
    }
  }, [tours, searchQuery]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#9ca3af'
      }}>
        Loading tours...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{
        fontSize: '2.5rem',
        color: '#dc2626',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        Upcoming Tours
      </h2>
      
      <SearchBar 
        onSearch={setSearchQuery}
        placeholder="Search tours by band, venue, or location..."
        section="tours"
      />
      
      {filteredTours.length === 0 ? (
        searchQuery ? (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '1.2rem',
            padding: '4rem 0'
          }}>
            No tours found matching "{searchQuery}". Try different search terms.
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '1.2rem',
            padding: '4rem 0'
          }}>
            No upcoming tours available. Check back soon!
          </div>
        )
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '2rem'
        }}>
          {filteredTours.map(tour => (
            <div
              key={tour.id}
              style={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#374151';
              }}
            >
              <h3 style={{
                fontSize: '1.5rem',
                color: '#dc2626',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                {tour.bandName}
              </h3>
              
              <div style={{ color: '#d1d5db', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#f87171' }}>Venue:</strong> {tour.venue}
              </div>
              
              <div style={{ color: '#d1d5db', marginBottom: '0.5rem' }}>
                <strong style={{ color: '#f87171' }}>Location:</strong> {tour.city}, {tour.country}
              </div>
              
              <div style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
                <strong style={{ color: '#f87171' }}>Date:</strong> {new Date(tour.date).toLocaleDateString()}
              </div>
              
              {tour.ticketUrl && (
                <a
                  href={tour.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                >
                  Get Tickets ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}