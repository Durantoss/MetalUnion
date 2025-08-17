// Clean test component
const App = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '3rem',
          color: '#dc2626',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          METALHUB
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#9ca3af',
          marginBottom: '2rem'
        }}>
          Metal Community Platform
        </p>
        <button 
          onClick={() => window.location.href = '/api/login'}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Sign in with Replit
        </button>
        <div style={{ fontSize: '2rem', marginTop: '2rem' }}>🤘</div>
      </div>
    </div>
  );
};

export default App;