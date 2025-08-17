import { useState, useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { CommentSection } from './CommentSection';

interface Review {
  id: string;
  bandId: string;
  stagename: string;
  rating: number;
  title: string;
  content: string;
  reviewType: 'band' | 'album' | 'concert';
  targetName?: string;
  likes: number;
  createdAt: string;
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    let filtered = reviews;
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(review => review.reviewType === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.stagename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.targetName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredReviews(filtered);
  }, [reviews, searchQuery, filter]);

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
      
      <SearchBar 
        onSearch={setSearchQuery}
        placeholder="Search reviews by title, content, reviewer, or target..."
        section="reviews"
      />
      
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
        searchQuery || filter !== 'all' ? (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '1.2rem',
            padding: '4rem 0'
          }}>
            No reviews found matching your criteria. Try different filters or search terms.
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '1.2rem',
            padding: '4rem 0'
          }}>
            No reviews available yet. Be the first to write one!
          </div>
        )
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
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#374151';
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    color: '#dc2626',
                    fontWeight: 'bold',
                    margin: 0
                  }}>
                    {review.title}
                  </h3>
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
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {renderStars(review.rating)}
                  <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                    ({review.rating}/5)
                  </span>
                </div>
                
                <p style={{
                  color: '#9ca3af',
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  by {review.stagename} • {new Date(review.createdAt).toLocaleDateString()}
                  {review.targetName && ` • ${review.targetName}`}
                </p>
              </div>

              <p style={{
                color: '#d1d5db',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                {review.content}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  👍 {review.likes}
                </button>
              </div>

              {/* Comment Section for each review */}
              <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem' }}>
                <CommentSection 
                  targetType="review" 
                  targetId={review.id} 
                  targetTitle={review.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}