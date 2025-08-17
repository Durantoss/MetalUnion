import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { user, isAuthenticated, extendSession } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [showRememberOption, setShowRememberOption] = useState(false);

  // Check if user has an active session
  useEffect(() => {
    if (isAuthenticated && user) {
      setRememberMe(user.rememberMe || false);
      setShowRememberOption(true);
    }
  }, [isAuthenticated, user]);

  const handleLogin = () => {
    // Redirect to Replit OAuth
    window.location.href = '/api/login';
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    extendSession(checked);
  };

  if (isAuthenticated && user) {
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
          padding: '32px',
          borderRadius: '12px'
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

          {showRememberOption && (
            <div style={{ 
              backgroundColor: '#374151',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => handleRememberMeChange(e.target.checked)}
                  style={{
                    marginRight: '8px',
                    accentColor: '#dc2626'
                  }}
                />
                Remember me for 90 days
              </label>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '0.75rem', 
                marginTop: '8px' 
              }}>
                {rememberMe 
                  ? "You'll stay logged in for 90 days of inactivity"
                  : "You'll stay logged in for 30 days of inactivity"
                }
              </p>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px' 
          }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Continue to MetalHub
            </button>
            
            <button
              onClick={() => window.location.href = '/api/logout'}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                border: '1px solid #374151',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>

          {user.sessionStart && (
            <div style={{ 
              marginTop: '24px', 
              padding: '12px',
              backgroundColor: '#111827',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              <p>Session started: {new Date(user.sessionStart).toLocaleString()}</p>
              {user.expiresAt && (
                <p>Expires: {new Date(user.expiresAt).toLocaleString()}</p>
              )}
            </div>
          )}
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
        padding: '32px',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#dc2626', 
          marginBottom: '16px' 
        }}>
          🤘 MetalHub
        </h1>
        
        <p style={{ 
          color: '#9ca3af', 
          marginBottom: '32px',
          fontSize: '1.125rem'
        }}>
          Join the ultimate metal community
        </p>

        <div style={{ marginBottom: '32px' }}>
          <p style={{ color: '#d1d5db', marginBottom: '16px' }}>
            Discover bands, read reviews, and connect with metalheads worldwide
          </p>
          <ul style={{ 
            textAlign: 'left', 
            color: '#9ca3af', 
            fontSize: '0.875rem',
            listStyle: 'none',
            padding: 0
          }}>
            <li style={{ marginBottom: '8px' }}>🎸 Discover new metal bands</li>
            <li style={{ marginBottom: '8px' }}>📝 Write and read reviews</li>
            <li style={{ marginBottom: '8px' }}>📷 Share band photos</li>
            <li style={{ marginBottom: '8px' }}>🎫 Find tour dates</li>
            <li style={{ marginBottom: '8px' }}>💬 Connect with fans</li>
          </ul>
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.125rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }}
        >
          Login with Replit
        </button>

        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.75rem', 
          marginTop: '16px' 
        }}>
          Secure authentication powered by Replit
        </p>
      </div>
    </div>
  );
}