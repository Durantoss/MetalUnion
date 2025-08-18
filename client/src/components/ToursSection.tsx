// Hook-free tours section component

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
          🚌 TOUR DATES
        </h1>
        <p style={{
          color: '#d1d5db',
          fontSize: '1.1rem'
        }}>
          Discover upcoming metal and rock concerts worldwide
        </p>
      </div>

      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(153, 27, 27, 0.5)',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🎸
          </div>
          
          <h3 style={{
            color: '#facc15',
            fontSize: '1.25rem',
            fontWeight: '600',
            margin: 0
          }}>
            Tour Database Loading
          </h3>
          
          <p style={{
            color: '#9ca3af',
            margin: 0,
            maxWidth: '400px'
          }}>
            We're building an extensive database of metal and rock tour dates. 
            Check back soon for comprehensive concert listings!
          </p>

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '6px',
            color: '#facc15',
            fontSize: '0.9rem'
          }}>
            💡 Pro Tip: Check out EVENT DISCOVERY for Smart concert recommendations!
          </div>
        </div>
      </div>
    </div>
  );
}