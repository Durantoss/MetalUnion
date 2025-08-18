export function EmergencyLanding({ onSectionChange, bands }: { onSectionChange: (section: string) => void; bands: any[] }) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      background: '#000',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#dc2626', fontSize: '3rem', marginBottom: '1rem' }}>
        MOSHUNION
      </h1>
      <p style={{ color: '#facc15', fontSize: '1.2rem', marginBottom: '2rem' }}>
        Metal Community Platform
      </p>
      <div style={{ marginBottom: '2rem' }}>
        Loaded {bands?.length || 0} bands
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={() => onSectionChange('bands')}
          style={{
            background: '#dc2626',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🎸 Bands
        </button>
        <button 
          onClick={() => onSectionChange('tours')}
          style={{
            background: '#dc2626',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🚌 Tours
        </button>
        <button 
          onClick={() => onSectionChange('events')}
          style={{
            background: '#dc2626',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🎯 Events
        </button>
      </div>
    </div>
  );
}