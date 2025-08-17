// Hook-free ThePit community section component

export function ThePit() {
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
          🔥 THE PIT
        </h1>
        <p style={{
          color: '#d1d5db',
          fontSize: '1.1rem'
        }}>
          The heart of the metal community - discussions, debates, and discoveries
        </p>
      </div>

      {/* Featured Discussion Categories */}
      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        marginBottom: '3rem'
      }}>
        {[
          { icon: '🎸', title: 'Band Discussions', desc: 'Talk about your favorite metal acts' },
          { icon: '🏟️', title: 'Tour Talk', desc: 'Share concert experiences and upcoming shows' },
          { icon: '🎧', title: 'Gear & Equipment', desc: 'Discuss instruments, amps, and sound gear' },
          { icon: '📰', title: 'Metal News', desc: 'Latest updates from the metal world' }
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
              fontSize: '2rem',
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
              margin: 0
            }}>
              {category.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Sample Discussion Threads */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(153, 27, 27, 0.5)',
        padding: '2rem'
      }}>
        <h2 style={{
          color: '#dc2626',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          🔥 Hot Discussions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { title: 'Best Metal Albums of 2025?', author: 'MetalMaster', replies: 23, category: 'bands' },
            { title: 'Epic Concert Stories - Share Yours!', author: 'ConcertCrazy', replies: 15, category: 'tours' },
            { title: 'Guitar Tone Discussion: Tube vs Digital', author: 'GearHead', replies: 31, category: 'gear' }
          ].map((thread, i) => (
            <div
              key={i}
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <h3 style={{
                  color: '#facc15',
                  fontSize: '1rem',
                  fontWeight: '600',
                  margin: 0
                }}>
                  {thread.title}
                </h3>
                <span style={{
                  color: '#9ca3af',
                  fontSize: '0.8rem'
                }}>
                  💬 {thread.replies} replies
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                  by {thread.author}
                </span>
                <span style={{
                  color: '#6b7280',
                  fontSize: '0.8rem',
                  backgroundColor: 'rgba(107, 114, 128, 0.2)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  #{thread.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(234, 179, 8, 0.3)'
        }}>
          <h3 style={{ color: '#facc15', marginBottom: '0.5rem' }}>
            🤘 Join The Pit Community
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
            Interactive discussions and community features coming soon
          </p>
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid rgba(220, 38, 38, 0.5)',
            borderRadius: '4px',
            color: '#dc2626',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Community System In Development
          </div>
        </div>
      </div>
    </div>
  );
}