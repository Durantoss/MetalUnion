import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [stagename, setStagename] = useState('');
  const [safeword, setSafeword] = useState('');
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: { stagename: string; safeword: string; rememberMe: boolean }) => {
      console.log('Frontend: Starting login mutation with data:', { stagename: data.stagename, hasPassword: !!data.safeword });
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      console.log('Frontend: Login mutation completed successfully');
      return result;
    },
    onSuccess: (response) => {
      console.log('Frontend: Login mutation onSuccess triggered with:', response);
      onAuthSuccess(response.user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onClose();
      setError('');
    },
    onError: (error: any) => {
      console.error('Frontend: Login mutation error:', error);
      console.error('Frontend: Error details:', { message: error.message, stack: error.stack });
      setError(error.message || 'Login failed');
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { stagename: string; safeword: string; email?: string }) => {
      return apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (response) => {
      onAuthSuccess(response.user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onClose();
      setError('');
    },
    onError: (error: any) => {
      setError(error.message || 'Registration failed');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!stagename || !safeword) {
      setError('Stagename and safeword are required');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ stagename, safeword, rememberMe });
      } else {
        await registerMutation.mutateAsync({ stagename, safeword, email: email || undefined });
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStagename('');
    setSafeword('');
    setEmail('');
    setRememberMe(false);
    setError('');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #374151'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#dc2626',
            margin: 0
          }}>
            {isLogin ? 'Enter The Pit' : 'Join The Union'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Stagename
            </label>
            <input
              type="text"
              value={stagename}
              onChange={(e) => setStagename(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '1rem'
              }}
              placeholder="Your metal alias"
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Safeword
            </label>
            <input
              type="password"
              value={safeword}
              onChange={(e) => setSafeword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '1rem'
              }}
              placeholder="Your secret code"
              required
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                color: '#d1d5db',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '1rem'
                }}
                placeholder="your.email@example.com"
              />
            </div>
          )}

          {isLogin && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="rememberMe" style={{
                color: '#d1d5db',
                fontSize: '0.9rem'
              }}>
                Remember me for 30 days
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Enter' : 'Join')}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: '#9ca3af',
          fontSize: '0.9rem'
        }}>
          {isLogin ? "New to the pit? " : "Already have an account? "}
          <button
            onClick={switchMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Join The Union' : 'Enter The Pit'}
          </button>
        </div>
      </div>
    </div>
  );
}