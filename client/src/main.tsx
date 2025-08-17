import { createRoot } from "react-dom/client";
import { createElement } from "react";

// Simple component using createElement to avoid JSX issues
function MinimalApp() {
  console.log("MinimalApp rendering at:", new Date().toLocaleTimeString());
  
  const timestamp = new Date().toLocaleTimeString();
  
  return createElement("div", {
    style: { 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#111', 
      color: '#fff',
      minHeight: '100vh'
    }
  },
    createElement("h1", {
      style: { 
        color: '#dc2626', 
        fontSize: '3rem', 
        marginBottom: '2rem',
        fontWeight: 'bold'
      }
    }, "🤘 MetalHub - Working!"),
    
    createElement("div", {
      style: { fontSize: '1.2rem', lineHeight: '1.6' }
    },
      createElement("p", null, "✅ React app successfully rendering!"),
      createElement("p", null, `⏰ Timestamp: ${timestamp}`),
      createElement("p", null, "🚀 Server: Port 5000"),
      createElement("p", null, "🎸 Status: Ready to rock!")
    ),
    
    createElement("div", {
      style: { 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#222',
        borderRadius: '8px'
      }
    },
      createElement("h2", {
        style: { color: '#dc2626', marginBottom: '15px' }
      }, "Debug Info:"),
      createElement("p", null, "✓ React working with createElement"),
      createElement("p", null, "✓ Vite connected successfully"),
      createElement("p", null, "✓ No JSX preamble errors"),
      createElement("p", null, "✓ Port mapping: 5000 → 80")
    )
  );
}

console.log("main.tsx loading with inline component");

// Add more detailed debugging
console.log("Document ready state:", document.readyState);
console.log("Looking for root element...");

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
  console.log("Creating React root...");
  const root = createRoot(rootElement);
  console.log("Rendering MinimalApp...");
  root.render(createElement(MinimalApp));
  console.log("Minimal app rendered successfully");
} else {
  console.error("Root element not found! Available elements:");
  console.error("Body children:", document.body.children);
  
  // Try to create root element if missing
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  newRoot.style.cssText = "width: 100%; height: 100vh;";
  document.body.appendChild(newRoot);
  console.log("Created new root element");
  
  const root = createRoot(newRoot);
  root.render(createElement(MinimalApp));
  console.log("Rendered with created root element");
}
