import { useState, useEffect } from 'react';

interface Review {
  id: string;
  bandName?: string;
  albumName?: string;
  concertVenue?: string;
  rating: number;
  comment: string;
  reviewType: 'band' | 'album' | 'concert';
  reviewerName: string;
  createdAt: string;
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'band' | 'album' | 'concert'>('all');

  useEffect(() => {
    fetch('/api/reviews')
      .then(response => response.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading reviews:', err);
        setLoading(false);
      });
  }, []);

  const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.reviewType === filter);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < rating ? '#fbbf24' : '#6b7280',
          fontSize: '1.2rem'
        }}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#9ca3af'
      }}>
        Loading reviews...
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
        Community Reviews
      </h2>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {(['all', 'band', 'album', 'concert'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              backgroundColor: filter === type ? '#dc2626' : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (filter !== type) {
                e.currentTarget.style.backgroundColor = '#4b5563';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== type) {
                e.currentTarget.style.backgroundColor = '#374151';
              }
            }}
          >
            {type}
          </button>
        ))}
      </div>
      
      {filteredReviews.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '1.2rem',
          padding: '4rem 0'
        }}>
          No reviews available. Be the first to write one!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {filteredReviews.map(review => (
            <div
              key={review.id}
              style={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#374151';
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  color: '#dc2626',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {review.reviewType === 'band' && review.bandName}
                  {review.reviewType === 'album' && `${review.bandName} - ${review.albumName}`}
                  {review.reviewType === 'concert' && `${review.bandName} at ${review.concertVenue}`}
                </h3>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  {renderStars(review.rating)}
                  <span style={{
                    backgroundColor: '#374151',
                    color: '#d1d5db',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    textTransform: 'capitalize'
                  }}>
                    {review.reviewType}
                  </span>
                </div>
              </div>
              
              <p style={{
                color: '#d1d5db',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                {review.comment}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#9ca3af',
                fontSize: '0.9rem'
              }}>
                <span>by {review.reviewerName}</span>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}