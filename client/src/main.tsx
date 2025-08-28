import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { queryClient } from './lib/queryClient';
import './index.css';

// Mobile-optimized initialization

// Force permanent dark mode
document.documentElement.classList.add('dark');
document.body.style.backgroundColor = 'hsl(0, 0%, 4%)';

// Add mobile loading indicator
const loadingDiv = document.createElement('div');
loadingDiv.innerHTML = `
  <div style="
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-family: sans-serif;
    text-align: center;
    z-index: 9999;
  ">
    <div style="font-size: 24px; margin-bottom: 10px;">🎸</div>
    <div>Loading MoshUnion...</div>
  </div>
`;
loadingDiv.id = 'mobile-loading';
document.body.appendChild(loadingDiv);

const container = document.getElementById('root');
if (!container) {
  console.error('❌ Root element not found in HTML');
  throw new Error('Root element not found in HTML');
}


try {
  const root = createRoot(container);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
  
  // Remove loading indicator after a delay
  setTimeout(() => {
    const loading = document.getElementById('mobile-loading');
    if (loading) loading.remove();
  }, 3000);
  
} catch (error) {
  console.error('❌ Failed to render React app:', error);
  // Show error message to user
  document.body.innerHTML = `
    <div style="color: white; font-family: sans-serif; padding: 20px; text-align: center;">
      <h2>🚨 App Loading Error</h2>
      <p>Failed to load the app. Please refresh the page.</p>
      <p style="font-size: 12px; opacity: 0.7; margin-top: 20px;">Error: ${error}</p>
      <button onclick="location.reload()" style="background: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px; cursor: pointer;">Refresh Page</button>
    </div>
  `;
}
