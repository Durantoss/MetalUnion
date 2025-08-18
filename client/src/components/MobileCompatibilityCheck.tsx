import { useEffect, useState } from 'react';

interface MobileDebugInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  connection: string;
  errors: string[];
}

export function MobileCompatibilityCheck() {
  const [debugInfo, setDebugInfo] = useState<MobileDebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const info: MobileDebugInfo = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      errors: []
    };

    // Add error listener
    const errorHandler = (error: ErrorEvent) => {
      info.errors.push(`${error.message} at ${error.filename}:${error.lineno}`);
      setDebugInfo({...info});
    };

    window.addEventListener('error', errorHandler);
    setDebugInfo(info);

    // Show debug panel after 3 seconds if there are issues
    const timer = setTimeout(() => {
      if (info.errors.length > 0) {
        setIsVisible(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('error', errorHandler);
      clearTimeout(timer);
    };
  }, []);

  if (!debugInfo || !isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      right: '10px',
      backgroundColor: 'rgba(255, 0, 0, 0.9)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 10000,
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <div>
        <strong>Mobile Debug Info:</strong>
        <br />UA: {debugInfo.userAgent.substring(0, 50)}...
        <br />Viewport: {debugInfo.viewport.width}x{debugInfo.viewport.height}
        <br />Connection: {debugInfo.connection}
        {debugInfo.errors.length > 0 && (
          <>
            <br /><strong>Errors:</strong>
            {debugInfo.errors.map((error, i) => (
              <div key={i}>{error}</div>
            ))}
          </>
        )}
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'white',
          color: 'red',
          border: 'none',
          borderRadius: '50%',
          width: '20px',
          height: '20px'
        }}
      >
        ×
      </button>
    </div>
  );
}