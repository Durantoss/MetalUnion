import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("main.tsx is loading");

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('MetalHub PWA registered successfully');
      })
      .catch((registrationError) => {
        console.log('PWA registration failed: ', registrationError);
      });
  });
}

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
  console.log("Creating React root");
  const root = createRoot(rootElement);
  console.log("Rendering App component");
  root.render(
    // Remove StrictMode if it's causing issues with hooks
    <App />
  );
  console.log("React app rendered successfully");
} else {
  console.error("Root element not found!");
}
