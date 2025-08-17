import { createRoot } from "react-dom/client";
import App from "./App";

console.log("main.tsx is loading");

// Simplified version without CSS and service worker for debugging
try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  console.log("Creating React root");
  const root = createRoot(rootElement);
  
  console.log("Rendering App component");
  root.render(<App />);
  
  console.log("React app rendered successfully");
} catch (error: any) {
  console.error("Error in main.tsx:", error);
  // Fallback: show error directly in DOM
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background: black; color: red; padding: 20px; font-family: monospace;">
        <h1>MetalHub Loading Error</h1>
        <p>Error: ${error?.message || error}</p>
        <p>Check browser console for details</p>
      </div>
    `;
  }
}
