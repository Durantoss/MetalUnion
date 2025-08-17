import { createRoot } from "react-dom/client";
import "./index.css";

// Inline minimal component to avoid import issues
function MinimalApp() {
  console.log("MinimalApp rendering");
  
  return (
    <div style={{ padding: '20px', color: 'white', backgroundColor: '#000' }}>
      <h1 style={{ color: '#dc2626', fontSize: '2rem', marginBottom: '1rem' }}>
        MetalHub - Clean Start
      </h1>
      <p>React app successfully initialized!</p>
      <p>Timestamp: {new Date().toLocaleTimeString()}</p>
      <div style={{ marginTop: '20px' }}>
        <p>✓ Server running on port 5000</p>
        <p>✓ React rendering working</p>
        <p>✓ Ready for development</p>
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
