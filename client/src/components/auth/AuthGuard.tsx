import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';

interface AuthGuardProps {
  children: React.ReactNode;
  action?: string;
  fallback?: React.ReactNode;
  onAuthRequired?: () => void;
}

export function AuthGuard({ 
  children, 
  action = "perform this action", 
  fallback,
  onAuthRequired 
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const handleAuthRequired = () => {
    if (onAuthRequired) {
      onAuthRequired();
    } else {
      setShowAuthModal(true);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#d1d5db'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {fallback || (
          <div
            onClick={handleAuthRequired}
            style={{
              cursor: 'pointer',
              padding: '1rem',
              border: '2px dashed rgba(220, 38, 38, 0.5)',
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#d1d5db',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.5)';
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#facc15' }}>
              Sign Up Required
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
              You need to create an account to {action}
            </p>
            <div style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(220, 38, 38, 0.8)',
              color: 'white',
              borderRadius: '4px',
              display: 'inline-block',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              Click to Sign Up
            </div>
          </div>
        )}
        
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialMode="register"
          />
        )}
      </>
    );
  }

  return <>{children}</>;
}