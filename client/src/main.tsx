import { createRoot } from "react-dom/client";
// Temporarily removed CSS to isolate MIME type issue

// Inline minimal component to avoid import issues
function MinimalApp() {
  console.log("MinimalApp rendering at:", new Date().toLocaleTimeString());
  
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#111', 
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        color: '#dc2626', 
        fontSize: '3rem', 
        marginBottom: '2rem',
        fontWeight: 'bold'
      }}>
        🤘 MetalHub Debug
      </h1>
      <div style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
        <p>✅ React app successfully rendering!</p>
        <p>⏰ Timestamp: {new Date().toLocaleTimeString()}</p>
        <p>🚀 Server: Port 5000</p>
        <p>🎸 Status: Ready to rock!</p>
      </div>
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#222',
        borderRadius: '8px'
      }}>
        <h2 style={{ color: '#dc2626', marginBottom: '15px' }}>Debug Info:</h2>
        <p>✓ React hooks working</p>
        <p>✓ Vite HMR functional</p>
        <p>✓ Components isolated</p>
        <p>✓ No import errors</p>
      </div>
    </div>
  );
}

console.log("main.tsx loading with inline component");

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<MinimalApp />);
  console.log("Minimal app rendered successfully");
} else {
  console.error("Root element not found!");
}
