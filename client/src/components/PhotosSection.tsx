// Hook-free photos section component

export function PhotosSection() {
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
          📸 METAL PHOTOS
        </h1>
        <p style={{
          color: '#d1d5db',
          fontSize: '1.1rem'
        }}>
          Capture and share the metal experience
        </p>
      </div>

      {/* Photo Categories */}
      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        marginBottom: '3rem'
      }}>
        {[
          { icon: '🎸', title: 'Live Concert Photos', desc: 'Epic shots from metal shows', count: 143 },
          { icon: '🎤', title: 'Band Portraits', desc: 'Professional band photography', count: 89 },
          { icon: '🥁', title: 'Backstage Moments', desc: 'Behind-the-scenes captures', count: 67 },
          { icon: '🔥', title: 'Equipment & Gear', desc: 'Instruments and stage setups', count: 125 }
        ].map((category, i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(153, 27, 27, 0.5)',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(153, 27, 27, 0.5)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            }}
          >
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem'
            }}>
              {category.icon}
            </div>
            <h3 style={{
              color: '#facc15',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {category.title}
            </h3>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.9rem',
              marginBottom: '0.75rem'
            }}>
              {category.desc}
            </p>
            <div style={{
              color: '#dc2626',
              fontSize: '0.8rem',
              fontWeight: '600',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              {category.count} photos
            </div>
          </div>
        ))}
      </div>

      {/* Featured Photo Grid */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(153, 27, 27, 0.5)',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          color: '#dc2626',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          🔥 Featured Metal Photography
        </h2>

        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                aspectRatio: '4/3',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderRadius: '8px',
                border: '2px dashed rgba(220, 38, 38, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.6)';
                e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
                e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                📷
              </div>
              <div style={{
                color: '#facc15',
                fontSize: '0.9rem',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Metal Photo #{i}
              </div>
              <div style={{
                color: '#9ca3af',
                fontSize: '0.7rem',
                marginTop: '0.25rem'
              }}>
                Click to view
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(153, 27, 27, 0.5)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          📸
        </div>
        <h3 style={{
          color: '#facc15',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1rem'
        }}>
          Share Your Metal Moments
        </h3>
        <p style={{
          color: '#9ca3af',
          fontSize: '1rem',
          marginBottom: '2rem',
          maxWidth: '500px',
          margin: '0 auto 2rem auto'
        }}>
          Upload and share your best concert photos, band shots, and metal experiences 
          with the global community
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(45deg, #dc2626, #facc15)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            📤 Upload Photos
          </button>

          <button style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            color: '#facc15',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)';
          }}>
            🖼️ Browse Gallery
          </button>
        </div>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          maxWidth: '400px',
          margin: '2rem auto 0 auto'
        }}>
          <div style={{
            color: '#facc15',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            📷 Photo Upload System Coming Soon
          </div>
          <div style={{
            color: '#9ca3af',
            fontSize: '0.8rem'
          }}>
            Advanced photo sharing and gallery features in development
          </div>
        </div>
      </div>
    </div>
  );
}