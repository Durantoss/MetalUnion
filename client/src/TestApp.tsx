export default function TestApp() {
  console.log('TestApp rendering...');
  
  return (
    <div style={{
      padding: '2rem',
      background: '#000',
      color: '#fff',
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#dc2626', fontSize: '3rem' }}>
        MOSHUNION TEST
      </h1>
      <p style={{ color: '#facc15', fontSize: '1.2rem' }}>
        If you can see this, React is working!
      </p>
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => alert('Button works!')}
          style={{
            background: '#dc2626',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}