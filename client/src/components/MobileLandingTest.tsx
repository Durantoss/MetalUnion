// Simple mobile landing page test component
export function MobileLandingTest({ onSectionChange }: { onSectionChange: (section: string) => void }) {
  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}
    >
      <h1 
        style={{
          fontSize: 'clamp(2rem, 8vw, 4rem)',
          fontWeight: 900,
          color: '#dc2626',
          marginBottom: '1rem',
          letterSpacing: '0.1em'
        }}
      >
        MOSHUNION
      </h1>
      
      <p 
        style={{
          fontSize: 'clamp(1rem, 4vw, 1.5rem)',
          color: '#9ca3af',
          marginBottom: '2rem',
          maxWidth: '600px',
          lineHeight: '1.5'
        }}
      >
        The Ultimate Metal Community - Mobile Test
      </p>
      
      <button
        onClick={() => {
          console.log('Mobile test button clicked');
          onSectionChange('bands');
        }}
        style={{
          backgroundColor: '#dc2626',
          color: '#ffffff',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          minHeight: '48px',
          minWidth: '200px',
          touchAction: 'manipulation'
        }}
      >
        Enter The Union
      </button>
      
      {/* Mobile debug info */}
      <div 
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'rgba(220, 38, 38, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}
      >
        Mobile Test Active
      </div>
    </div>
  );
}