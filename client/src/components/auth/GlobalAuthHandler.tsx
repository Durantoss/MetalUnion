import React from 'react';
import { AuthModal } from './AuthModal';
import { useQueryClient } from '@tanstack/react-query';

export function GlobalAuthHandler() {
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authAction, setAuthAction] = React.useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const handleAuthRequired = (event: CustomEvent) => {
      setAuthAction(event.detail.action || 'access this feature');
      setShowAuthModal(true);
    };

    window.addEventListener('auth-required', handleAuthRequired as EventListener);
    
    return () => {
      window.removeEventListener('auth-required', handleAuthRequired as EventListener);
    };
  }, []);

  const handleAuthSuccess = (user: any) => {
    // Update the query cache with the authenticated user - no need to invalidate since we're setting fresh data
    queryClient.setQueryData(['/api/auth/user'], user);
    setShowAuthModal(false);
    console.log('Global auth success:', user);
  };

  return (
    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      onAuthSuccess={handleAuthSuccess}
    />
  );
}