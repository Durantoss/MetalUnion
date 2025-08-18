// Simple App component without useAuth to test render loop fix
import { useState, useEffect } from 'react';
import { MobileFriendlyLanding } from './MobileFriendlyLanding';
import { Band } from '../types';

const SimpleApp = () => {
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/bands')
      .then(response => response.json())
      .then(data => {
        setBands(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load bands');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#dc2626',
        fontSize: '1.5rem'
      }}>
        Loading MoshUnion...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f87171',
        fontSize: '1.2rem'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <MobileFriendlyLanding 
      onSectionChange={() => {}}
      bands={bands}
      onLogin={() => {}}
      onLogout={() => {}}
    />
  );
};

export default SimpleApp;