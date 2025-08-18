import React from 'react';
import { AuthModal } from './AuthModal';

export function GlobalAuthHandler() {
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authAction, setAuthAction] = React.useState('');

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

  return (
    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      initialMode="register"
    />
  );
}