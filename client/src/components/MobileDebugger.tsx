import { useState, useEffect } from 'react';

interface DebugInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  connection: string;
  online: boolean;
  cookiesEnabled: boolean;
  javascriptEnabled: boolean;
  localStorageAvailable: boolean;
  sessionStorageAvailable: boolean;
  webGLAvailable: boolean;
  serviceWorkerSupported: boolean;
  fetchSupported: boolean;
  promiseSupported: boolean;
  errors: string[];
}

export function MobileDebugger() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Collect debug information
    const errors: string[] = [];
    
    // Test various browser features
    const tests = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
      javascriptEnabled: true, // If this runs, JS is enabled
      localStorageAvailable: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch {
          errors.push('localStorage not available');
          return false;
        }
      })(),
      sessionStorageAvailable: (() => {
        try {
          sessionStorage.setItem('test', 'test');
          sessionStorage.removeItem('test');
          return true;
        } catch {
          errors.push('sessionStorage not available');
          return false;
        }
      })(),
      webGLAvailable: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
          return false;
        }
      })(),
      serviceWorkerSupported: 'serviceWorker' in navigator,
      fetchSupported: 'fetch' in window,
      promiseSupported: 'Promise' in window,
      errors
    };

    setDebugInfo(tests);

    // Auto-show on mobile devices that might have issues
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && window.innerWidth < 768) {
      setVisible(true);
    }

    // Listen for errors
    const errorHandler = (event: ErrorEvent) => {
      errors.push(`JS Error: ${event.message} at ${event.filename}:${event.lineno}`);
      setDebugInfo(prev => prev ? { ...prev, errors: [...errors] } : null);
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      errors.push(`Promise Rejection: ${event.reason}`);
      setDebugInfo(prev => prev ? { ...prev, errors: [...errors] } : null);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);

  const testNetworkConnection = async () => {
    try {
      const start = performance.now();
      const response = await fetch('/api/health');
      const end = performance.now();
      const status = response.ok ? '✅' : '❌';
      alert(`Network Test ${status}\nStatus: ${response.status}\nTime: ${Math.round(end - start)}ms`);
    } catch (error) {
      alert(`Network Test ❌\nError: ${error}`);
    }
  };

  const testAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/user', { credentials: 'include' });
      const data = await response.json();
      alert(`Auth Test\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Auth Test ❌\nError: ${error}`);
    }
  };

  if (!debugInfo) {
    return <div className="fixed top-4 right-4 z-50 bg-red-600 text-white p-2 rounded">Loading debug info...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setVisible(!visible)}
        className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm mb-2 block"
        data-testid="button-debug-toggle"
      >
        🔧 Debug {visible ? '▼' : '▲'}
      </button>
      
      {visible && (
        <div className="bg-black/90 text-white p-4 rounded-lg shadow-xl max-w-sm max-h-96 overflow-auto text-xs">
          <h3 className="font-bold mb-2 text-green-400">Mobile Debug Info</h3>
          
          <div className="space-y-1">
            <div><strong>Device:</strong> {debugInfo.viewport.width}x{debugInfo.viewport.height}</div>
            <div><strong>Connection:</strong> {debugInfo.connection}</div>
            <div><strong>Online:</strong> {debugInfo.online ? '✅' : '❌'}</div>
            <div><strong>Cookies:</strong> {debugInfo.cookiesEnabled ? '✅' : '❌'}</div>
            <div><strong>LocalStorage:</strong> {debugInfo.localStorageAvailable ? '✅' : '❌'}</div>
            <div><strong>Fetch API:</strong> {debugInfo.fetchSupported ? '✅' : '❌'}</div>
            <div><strong>Promises:</strong> {debugInfo.promiseSupported ? '✅' : '❌'}</div>
            <div><strong>ServiceWorker:</strong> {debugInfo.serviceWorkerSupported ? '✅' : '❌'}</div>
          </div>

          {debugInfo.errors.length > 0 && (
            <div className="mt-3">
              <strong className="text-red-400">Errors:</strong>
              <div className="bg-red-900/50 p-2 rounded mt-1 max-h-20 overflow-auto">
                {debugInfo.errors.map((error, i) => (
                  <div key={i} className="text-xs">{error}</div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 space-y-1">
            <button
              onClick={testNetworkConnection}
              className="w-full bg-green-600 px-2 py-1 rounded text-xs"
              data-testid="button-test-network"
            >
              Test Network
            </button>
            <button
              onClick={testAuthentication}
              className="w-full bg-blue-600 px-2 py-1 rounded text-xs"
              data-testid="button-test-auth"
            >
              Test Auth
            </button>
          </div>

          <details className="mt-2">
            <summary className="cursor-pointer text-gray-300">User Agent</summary>
            <div className="text-xs mt-1 break-all">{debugInfo.userAgent}</div>
          </details>
        </div>
      )}
    </div>
  );
}