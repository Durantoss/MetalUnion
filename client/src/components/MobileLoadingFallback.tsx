import { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, RefreshCw } from 'lucide-react';

export function MobileLoadingFallback() {
  const [showFallback, setShowFallback] = useState(false);
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/mobile-health');
      const data = await response.json();
      setHealthCheck(data);
      return true;
    } catch (error) {
      setHealthCheck({ error: error.toString() });
      return false;
    }
  };

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          stagename: 'demo-001',
          safeword: 'test123'
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Demo login successful! Refreshing page...');
        window.location.reload();
      } else {
        alert(`❌ Login failed: ${data.error}`);
      }
    } catch (error) {
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
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-lg shadow-lg"
            data-testid="button-test-demo-login"
          >
            <Wifi className="w-5 h-5" />
            🔑 Test Demo Login Now!
          </button>

          <button
            onClick={checkHealth}
            className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded-lg text-sm"
            data-testid="button-check-health"
          >
            Check Connection
          </button>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-red-600/20 to-yellow-600/20 rounded-lg border border-red-500/30">
          <div className="text-center">
            <h3 className="text-yellow-400 font-bold text-sm mb-2">🎸 DEMO ACCESS 🎸</h3>
            <div className="bg-black/50 p-3 rounded text-xs font-mono">
              <div className="text-green-400 mb-1">Username: <span className="text-white">demo-001</span></div>
              <div className="text-green-400 mb-1">Username: <span className="text-white">demo-002</span></div>
              <div className="text-green-400 mb-1">Username: <span className="text-white">demo-003</span></div>
              <div className="text-gray-400 text-center mt-2">...through demo-010</div>
              <div className="text-yellow-400 mt-2 text-center">Password: <span className="text-white">Any password works!</span></div>
            </div>
            <div className="mt-2 text-xs text-gray-300">
              Admin Access: <span className="text-red-400">durantoss-demo-001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
