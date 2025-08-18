import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import TestApp from './TestApp';
import { queryClient } from './lib/queryClient';
import './index.css';

console.log('MOSHUNION: Starting full app...');

// Force permanent dark mode
document.documentElement.classList.add('dark');
document.body.style.backgroundColor = 'hsl(0, 0%, 4%)';

const container = document.getElementById('root');
console.log('Container element:', container);
console.log('QueryClient:', queryClient);
if (!container) {
  throw new Error('Root element not found in HTML');
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TestApp />
    </QueryClientProvider>
  </StrictMode>
);