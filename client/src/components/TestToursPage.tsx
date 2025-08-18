export function TestToursPage() {
  console.log('TEST TOURS PAGE IS WORKING!');
  
  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{
        fontSize: '3rem',
        color: '#dc2626',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        🔥 TOURS SEARCH TEST 🔥
      </h1>
      
      <div style={{
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        border: '2px solid #dc2626',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%'
      }}>
        <input
          type="text"
          placeholder="🎸 Search for tours here..."
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '1px solid #dc2626',
            borderRadius: '8px',
            color: 'white',
            marginBottom: '1rem'
          }}
        />
        <button
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔍 SEARCH TOURS
        </button>
      </div>
      
      <p style={{
        color: '#facc15',
        fontSize: '1.2rem',
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        If you can see this, the tours component is working!
      </p>
    </div>
  );
}