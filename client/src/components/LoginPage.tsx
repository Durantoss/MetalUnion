import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

interface LoginPageProps {
  onBack?: () => void;
}

export function LoginPage({ onBack }: LoginPageProps) {
  const { user, isAuthenticated, extendSession } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  // Check if user has an active session
  useEffect(() => {
    if (isAuthenticated && user) {
      setRememberMe(user.rememberMe || false);
    }
  }, [isAuthenticated, user]);

  const handleLogin = () => {
    // Redirect to Replit OAuth
    window.location.href = '/api/login';
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (extendSession) {
      extendSession(checked);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b69 50%, #000000 100%)',
        color: '#ffffff', 
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          maxWidth: '400px', 
          width: '100%',
          background: 'rgba(31, 41, 55, 0.8)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #374151',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            color: '#dc2626', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Welcome to MetalHub
          </h1>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {user.profileImageUrl && (
              <img 
                src={user.profileImageUrl}
                alt="Profile"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  objectFit: 'cover'
                }}
              />
            )}
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.email || 'Rock Fan'
              }
            </h2>
            {user.email && (
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                {user.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#f87171' }}>
              Session Settings
            </h3>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                style={{ accentColor: '#dc2626' }}
              />
              <span style={{ fontSize: '0.875rem' }}>
                Remember me (extend session to 90 days)
              </span>
            </label>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.75rem', 
              marginTop: '8px' 
            }}>
              {rememberMe 
                ? 'Your session will last up to 90 days' 
                : 'Your session will last up to 30 days'
              }
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                Back to App
              </button>
            )}
            <button
              onClick={() => window.location.href = '/api/logout'}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#dc2626',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      color: '#ffffff', 
      padding: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        backgroundColor: '#1f2937',
        padding: '48px 32px',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>🤘</span>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#dc2626', 
            marginBottom: '8px'
          }}>
            MetalHub
          </h1>
          <p style={{ color: '#d1d5db', fontSize: '1rem' }}>
            The Ultimate Metal Community
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '16px',
            color: '#f87171'
          }}>
            Join the Community
          </h2>
          <p style={{ 
            color: '#9ca3af', 
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            Access exclusive features including band reviews, photo uploads, 
            and personalized recommendations. Sign in with your Replit account.
          </p>
          
          <div style={{ 
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(220, 38, 38, 0.3)'
          }}>
            <h3 style={{ 
              fontSize: '1rem', 
              color: '#fca5a5', 
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Member Benefits
            </h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              textAlign: 'left'
            }}>
              <li style={{ color: '#d1d5db', fontSize: '0.875rem', marginBottom: '4px' }}>
                ✓ Upload band photos and reviews
              </li>
              <li style={{ color: '#d1d5db', fontSize: '0.875rem', marginBottom: '4px' }}>
                ✓ Save favorite bands and get recommendations
              </li>
              <li style={{ color: '#d1d5db', fontSize: '0.875rem', marginBottom: '4px' }}>
                ✓ Participate in community discussions
              </li>
              <li style={{ color: '#d1d5db', fontSize: '0.875rem', marginBottom: '4px' }}>
                ✓ Track tour dates and events
              </li>
            </ul>
          </div>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            marginBottom: '24px',
            justifyContent: 'center'
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: '#dc2626' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
              Remember me for 90 days
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
          >
            Sign in with Replit
          </button>
          
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#9ca3af',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Back to Browse
            </button>
          )}
        </div>

        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.75rem', 
          marginTop: '24px',
          lineHeight: '1.4'
        }}>
          By signing in, you agree to our terms and join the MetalHub community. 
          Your session will be {rememberMe ? 'extended to 90 days' : 'set to 30 days'}.
        </p>
      </div>
    </div>
  );
}