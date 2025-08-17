import { useState } from "react";

export function LoginPage() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Redirect to Replit OAuth
    window.location.href = '/api/login';
  };

  return (
    <div 
      className="responsive-login-container"
      style={{ 
        minHeight: '100vh', 
        backgroundColor: '#000000', 
        color: '#ffffff', 
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="responsive-login-modal"
        style={{ 
          maxWidth: '400px', 
          width: '100%',
          backgroundColor: '#1f2937',
          padding: '48px 32px',
          borderRadius: '12px',
          textAlign: 'center'
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <span 
            className="responsive-login-icon"
            style={{ 
              fontSize: '4rem', 
              display: 'block', 
              marginBottom: '16px' 
            }}
          >🤘</span>
          <h1 
            className="responsive-login-title"
            style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#dc2626',
              marginBottom: '8px'
            }}
          >
            METALHUB
          </h1>
          <p 
            className="responsive-login-subtitle"
            style={{ 
              color: '#9ca3af', 
              fontSize: '1rem' 
            }}
          >
            Join the metal community
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
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
            data-testid="button-login"
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
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Sign in with Replit
          </button>
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