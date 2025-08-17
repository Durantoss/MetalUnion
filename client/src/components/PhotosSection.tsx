import { useState, useEffect } from 'react';

interface Photo {
  id: string;
  bandName: string;
  imageUrl: string;
  caption?: string;
  category: 'live' | 'promo' | 'backstage' | 'equipment';
  uploadedBy: string;
  createdAt: string;
}

export function PhotosSection() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'promo' | 'backstage' | 'equipment'>('all');

  useEffect(() => {
    fetch('/api/photos')
      .then(response => response.json())
      .then(data => {
        setPhotos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading photos:', err);
        setLoading(false);
      });
  }, []);

  const filteredPhotos = filter === 'all' ? photos : photos.filter(p => p.category === filter);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#9ca3af'
      }}>
        Loading photos...
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
        Community Photos
      </h2>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {(['all', 'live', 'promo', 'backstage', 'equipment'] as const).map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            style={{
              backgroundColor: filter === category ? '#dc2626' : '#374151',
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
              if (filter !== category) {
                e.currentTarget.style.backgroundColor = '#4b5563';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== category) {
                e.currentTarget.style.backgroundColor = '#374151';
              }
            }}
          >
            {category}
          </button>
        ))}
      </div>
      
      {filteredPhotos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '1.2rem',
          padding: '4rem 0'
        }}>
          No photos available. Upload some to get started!
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              style={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                overflow: 'hidden',
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
              <img
                src={photo.imageUrl}
                alt={photo.caption || `${photo.bandName} photo`}
                style={{
                  width: '100%',
                  height: '250px',
                  objectFit: 'cover'
                }}
              />
              
              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  color: '#dc2626',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {photo.bandName}
                </h3>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    backgroundColor: '#374151',
                    color: '#d1d5db',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    textTransform: 'capitalize'
                  }}>
                    {photo.category}
                  </span>
                </div>
                
                {photo.caption && (
                  <p style={{
                    color: '#d1d5db',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                  }}>
                    {photo.caption}
                  </p>
                )}
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#9ca3af',
                  fontSize: '0.8rem'
                }}>
                  <span>by {photo.uploadedBy}</span>
                  <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}