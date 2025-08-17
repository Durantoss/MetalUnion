import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BandListPage } from './components/BandListPage';
import { LoginPage } from './components/LoginPage';
import { queryClient } from './lib/queryClient';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    fetch('/api/me', {
      credentials: 'include',
    })
      .then(async (response) => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch((error) => {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4 text-red-600">METALHUB</div>
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-950 text-white">
        {isAuthenticated ? <BandListPage /> : <LoginPage />}
      </div>
    </QueryClientProvider>
  );
}

export default App;