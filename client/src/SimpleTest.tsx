// Simple test component to verify React is working
import { useState } from 'react';

export default function SimpleTest() {
  const [count, setCount] = useState(0);
  
  console.log('SimpleTest component rendered');
  
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#000',
      color: '#fff',
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ color: '#ff0000', fontSize: '3rem' }}>MOSHUNION TEST</h1>
      <p>React is working! Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff0000',
          color: '#fff',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Click me: {count}
      </button>
    </div>
  );
}