import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { queryClient } from './lib/queryClient';
import './index.css';

// Force permanent dark mode
document.documentElement.classList.add('dark');
document.body.style.backgroundColor = 'hsl(0, 0%, 4%)';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found in HTML');
}

const root = createRoot(container);
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);