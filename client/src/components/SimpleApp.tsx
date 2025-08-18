// Ultra minimal app to test render loop fix
const SimpleApp = () => {
  console.log('SimpleApp render');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#dc2626',
      fontSize: '2rem',
      fontWeight: 'bold'
    }}>
      MOSHUNION - TEST
    </div>
  );
};

export default SimpleApp;