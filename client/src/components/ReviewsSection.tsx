// Hook-free reviews section component
import { InteractionButton } from './auth/InteractionButton';

export function ReviewsSection() {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #dc2626, #facc15)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '1rem'
        }}>
          ⭐ REVIEWS & RATINGS
        </h1>
        <p style={{
          color: '#d1d5db',
          fontSize: '1.1rem'
        }}>
          Community reviews for bands, albums, and concerts
        </p>
      </div>

      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
      }}>
        {/* Sample Review Cards */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(153, 27, 27, 0.5)',
              padding: '1.5rem'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(220, 38, 38, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem'
                }}>
                  🤘
                </div>
                <span style={{ color: '#facc15', fontSize: '0.9rem', fontWeight: '600' }}>
                  MetalWarrior{i}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      color: star <= 4 ? '#facc15' : '#4b5563',
                      fontSize: '0.8rem'
                    }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
            
            <h3 style={{
              color: '#dc2626',
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Epic Performance Review
            </h3>
            
            <p style={{
              color: '#d1d5db',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              margin: 0
            }}>
              Amazing show with incredible energy. The crowd was electric and the band delivered
              an unforgettable performance. Definitely recommend checking them out live!
            </p>
            
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <InteractionButton
                onClick={() => console.log('Like review')}
                action="like reviews"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                data-testid={`button-like-review-${i}`}
              >
                🔥 {12 + i} likes
              </InteractionButton>
              <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>
                2 days ago
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(153, 27, 27, 0.5)'
      }}>
        <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>
          Share Your Experience
        </h3>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
          Join the community and share your reviews of bands, albums, and concerts
        </p>
        <InteractionButton
          onClick={() => console.log('Write review')}
          action="write reviews"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            border: 'none',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          data-testid="button-write-review"
        >
          Write a Review
        </InteractionButton>
      </div>
    </div>
  );
}