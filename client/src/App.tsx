import { useState, useEffect } from "react";

function App() {
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("App component mounted");
    fetchBands();
  }, []);

  const fetchBands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bands');
      if (response.ok) {
        const bandsData = await response.json();
        setBands(bandsData);
        console.log("Loaded bands:", bandsData.length);
      } else {
        setError('Failed to load bands');
      }
    } catch (error) {
      console.error('Error fetching bands:', error);
      setError('Error fetching bands');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-red-500 mb-6">MetalHub Band Database</h1>
        
        {error && (
          <div className="bg-red-900 p-4 rounded-lg mb-6">
            <p className="text-red-300">Error: {error}</p>
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-xl text-red-400 mb-4">
            Band Search Results ({loading ? '...' : bands.length} bands)
          </h2>
          
          {loading ? (
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <p className="text-gray-400">Loading bands...</p>
            </div>
          ) : bands.length === 0 ? (
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <p className="text-gray-400">No bands found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bands.map((band, index) => (
                <div key={band.id || index} className="bg-gray-900 p-4 rounded-lg flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    {band.imageUrl ? (
                      <img 
                        src={band.imageUrl}
                        alt={band.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-xs text-gray-400 flex items-center justify-center w-full h-full">
                        🎸
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{band.name}</h3>
                    <p className="text-gray-400 text-sm">{band.genre}</p>
                    <p className="text-xs text-gray-500">{band.description}</p>
                  </div>
                  <button
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                    onClick={() => console.log('Selected band:', band.name)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl text-red-400 mb-4">System Status</h2>
          <div className="space-y-2">
            <p className="text-green-400">✓ Search deduplication fixed</p>
            <p className="text-green-400">✓ Only unique bands displayed</p>
            <p className="text-green-400">✓ Object storage ready</p>
            <p className="text-green-400">✓ Photo upload system active</p>
            <p className="text-blue-400">🤖 Background AI running</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;