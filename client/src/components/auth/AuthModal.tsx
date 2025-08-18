import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#000000',
          border: '1px solid #374151',
          borderRadius: '12px',
          maxWidth: '28rem',
          width: '100%',
          padding: '2rem',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="auth-modal"
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
        
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#dc2626',
            marginBottom: '0.5rem'
          }}>
            Join The Union
          </h2>
          <p style={{
            color: '#9ca3af',
            fontSize: '0.9rem'
          }}>
            Create your MoshUnion metalhead profile to access community features
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setMode('register')}
            style={{
              backgroundColor: mode === 'register' ? '#dc2626' : 'transparent',
              color: mode === 'register' ? '#ffffff' : '#dc2626',
              border: '1px solid #dc2626',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode('login')}
            style={{
              backgroundColor: mode === 'login' ? '#dc2626' : 'transparent',
              color: mode === 'login' ? '#ffffff' : '#dc2626',
              border: '1px solid #dc2626',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            Sign In
          </button>
        </div>

        <div style={{ marginTop: '2rem' }}>
          {mode === 'login' ? (
            <div style={{ textAlign: 'center', color: '#d1d5db' }}>
              <p style={{ marginBottom: '1rem' }}>
                Enter your <strong style={{ color: '#facc15' }}>Stagename</strong> and <strong style={{ color: '#facc15' }}>Safeword</strong>
              </p>
              <div style={{ 
                padding: '1rem',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '6px',
                color: '#fca5a5'
              }}>
                Login functionality will be implemented in the next phase
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#d1d5db' }}>
              <p style={{ marginBottom: '1rem' }}>
                Choose your unique <strong style={{ color: '#facc15' }}>Stagename</strong> and secure <strong style={{ color: '#facc15' }}>Safeword</strong>
              </p>
              <div style={{ 
                padding: '1rem',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '6px',
                color: '#fca5a5'
              }}>
                Registration functionality will be implemented in the next phase
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}