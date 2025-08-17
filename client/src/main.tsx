import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import SimpleTest from './SimpleTest';
import './index.css';

console.log('Starting MOSHUNION app...');

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found in HTML');
}

// Always use simple test to debug
console.log('Using SimpleTest component for debugging');

const root = createRoot(container);
root.render(
  <StrictMode>
    <SimpleTest />
  </StrictMode>
);