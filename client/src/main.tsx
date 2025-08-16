import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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

createRoot(document.getElementById("root")!).render(<App />);
