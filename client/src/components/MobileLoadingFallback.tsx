import { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, RefreshCw } from 'lucide-react';

export function MobileLoadingFallback() {
  const [showFallback, setShowFallback] = useState(false);
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkHealth = async () => {
    try {
      console.log('🔍 Checking mobile health endpoint...');
      const response = await fetch('/api/mobile-health');
      const data = await response.json();
      console.log('✅ Health check response:', data);
      setHealthCheck(data);
      return true;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      setHealthCheck({ error: error.toString() });
      return false;
    }
  };

  const testLogin = async () => {
    try {
      console.log('🔍 Testing alpha login...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          stagename: 'alpha-001',
          safeword: 'test123'
        })
      });
      const data = await response.json();
      console.log('🔐 Login test result:', data);
      
      if (response.ok) {
        alert('✅ Alpha login successful! Refreshing page...');
        window.location.reload();
      } else {
        alert(`❌ Login failed: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Login test failed:', error);
      alert(`❌ Login test failed: ${error}`);
    }
  };

  useEffect(() => {
    // Show fallback after 5 seconds if app hasn't loaded
    const timer = setTimeout(() => {
      setShowFallback(true);
      checkHealth();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const retry = () => {
    setRetryCount(prev => prev + 1);
    checkHealth();
    window.location.reload();
  };

  if (!showFallback) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full text-white">
        <div className="text-center mb-6">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Mobile Loading Issue</h2>
          <p className="text-gray-300 text-sm">
            The app is taking longer than expected to load on your mobile device.
          </p>
        </div>

        {healthCheck && (
          <div className="mb-4 p-3 bg-gray-800 rounded text-xs">
            <strong>Debug Info:</strong>
            <pre className="whitespace-pre-wrap mt-1">
              {JSON.stringify(healthCheck, null, 2)}
            </pre>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={retry}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2"
            data-testid="button-retry-loading"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Loading ({retryCount})
          </button>

          <button
            onClick={testLogin}
            className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2"
            data-testid="button-test-alpha-login"
          >
            <Wifi className="w-4 h-4" />
            Test Alpha Login
          </button>

          <button
            onClick={checkHealth}
            className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded-lg text-sm"
            data-testid="button-check-health"
          >
            Check Connection
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>Alpha Testing Mode</p>
          <p>Use: alpha-001, alpha-002, etc. with any password</p>
        </div>
      </div>
    </div>
  );
}