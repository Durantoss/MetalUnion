import { createRoot } from 'react-dom/client';
import MinimalTest from './MinimalTest';

console.log('MOSHUNION: Starting app...');

const container = document.getElementById('root');
if (!container) {
  console.error('MOSHUNION: Root element not found!');
  throw new Error('Root element not found in HTML');
}

console.log('MOSHUNION: Root element found, creating React root...');

try {
  const root = createRoot(container);
  console.log('MOSHUNION: React root created, rendering...');
  
  root.render(<MinimalTest />);
  console.log('MOSHUNION: Component rendered successfully!');
} catch (error) {
  console.error('MOSHUNION: Error during rendering:', error);
}