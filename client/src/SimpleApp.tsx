import { useState, useEffect } from "react";

// Simple version without hooks to test basic functionality
export default function SimpleApp() {
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBands();
  }, []);

  const fetchBands = async () => {
    try {
      const response = await fetch('/api/bands');
      if (response.ok) {
        const bandsData = await response.json();
        setBands(bandsData);
      }
    } catch (error) {
      console.error('Error fetching bands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#0a0a0a', 
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>MetalHub</h1>
          <p>Loading metal bands...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#0a0a0a', 
      color: '#ffffff',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        borderBottom: '2px solid #dc2626',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          color: '#dc2626', 
          fontSize: '3rem', 
          margin: '0',
          textShadow: '2px 2px 4px rgba(220, 38, 38, 0.3)'
        }}>
          METALHUB
        </h1>
        <p style={{ color: '#ccc', marginTop: '8px' }}>
          GAZE INTO THE ABYSS
        </p>
      </header>

      <main>
        <h2 style={{ color: '#dc2626', marginBottom: '20px' }}>
          Featured Bands ({bands.length})
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {bands.map((band, index) => (
            <div 
              key={band.id || index}
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '20px',
                color: '#fff'
              }}
            >
              <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>
                {band.name}
              </h3>
              <p style={{ color: '#ccc', marginBottom: '8px' }}>
                {band.genre}
              </p>
              <p style={{ color: '#999', fontSize: '0.9rem' }}>
                {band.description}
              </p>
              <button
                onClick={() => window.open(`https://www.ticketmaster.com/search?q=${encodeURIComponent(band.name)}`, '_blank')}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                🎫 GET TICKETS
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}