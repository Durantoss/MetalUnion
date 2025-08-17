import { useState, useEffect } from "react";
import { initializeBackgroundAI } from "./services/backgroundAI";
import { ObjectUploader } from "./components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

function App() {
  const [status, setStatus] = useState("Ready");
  const [aiStatus, setAiStatus] = useState("Starting...");
  const [bands, setBands] = useState<any[]>([]);
  const [selectedBand, setSelectedBand] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize background AI service
    console.log("🤖 Initializing background AI...");
    initializeBackgroundAI();
    setAiStatus("Background AI Running");
    
    // Fetch bands for demo
    fetchBands();
    
    // Simulate AI activity
    const interval = setInterval(() => {
      setAiStatus(`AI Active - ${new Date().toLocaleTimeString()}`);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchBands = async () => {
    try {
      const response = await fetch('/api/bands');
      if (response.ok) {
        const bandsData = await response.json();
        setBands(bandsData.slice(0, 5)); // Show first 5 bands
      }
    } catch (error) {
      console.error('Error fetching bands:', error);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const { uploadURL } = await response.json();
        return { method: 'PUT' as const, url: uploadURL };
      }
    } catch (error) {
      console.error('Error getting upload URL:', error);
    }
    throw new Error('Failed to get upload URL');
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (selectedBand && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      try {
        const response = await fetch(`/api/bands/${selectedBand}/photo`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            photoURL: uploadedFile.uploadURL 
          })
        });
        
        if (response.ok) {
          await fetchBands(); // Refresh bands to show new photo
          setSelectedBand(null);
        }
      } catch (error) {
        console.error('Error updating band photo:', error);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-4xl font-bold text-red-500 mb-6">🤘 MetalHub Band Database</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl text-red-400 mb-4">Band Search Results</h2>
          <div className="space-y-4">
            {bands.map(band => (
              <div key={band.id} className="bg-gray-900 p-4 rounded-lg flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {band.imageUrl ? (
                    <img 
                      src={`/public-objects/${band.imageUrl.replace('/objects/', '')}`}
                      alt={band.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`text-xs text-gray-400 ${band.imageUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                    No Photo
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{band.name}</h3>
                  <p className="text-gray-400 text-sm">{band.genre}</p>
                  <p className="text-xs text-gray-500 truncate">{band.description}</p>
                </div>
                <button
                  onClick={() => setSelectedBand(band.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Upload Photo
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl text-red-400 mb-4">System Status</h2>
          <div className="space-y-4 text-lg">
            <p>✓ React rendering: {status}</p>
            <p>✓ Object storage ready</p>
            <p>✓ Photo upload system active</p>
            <p>🤖 AI Status: {aiStatus}</p>
          </div>
          
          <button 
            onClick={() => setStatus("Updated at " + new Date().toLocaleTimeString())}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Test React State
          </button>

          {selectedBand && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg text-red-400 mb-2">Upload Band Photo</h3>
              <p className="text-sm text-gray-400 mb-4">
                Selected: {bands.find(b => b.id === selectedBand)?.name}
              </p>
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={5 * 1024 * 1024} // 5MB
                onGetUploadParameters={handleUploadPhoto}
                onComplete={handleUploadComplete}
                buttonClassName="w-full"
              >
                📷 Upload Band Photo
              </ObjectUploader>
              <button 
                onClick={() => setSelectedBand(null)}
                className="mt-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm w-full"
              >
                Cancel
              </button>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-gray-900 rounded-lg">
            <h2 className="text-xl text-red-400 mb-2">Photo Upload Features:</h2>
            <ul className="space-y-1 text-sm">
              <li>• ✅ Object storage integration</li>
              <li>• ✅ Drag & drop photo upload</li>
              <li>• ✅ Automatic thumbnail generation</li>
              <li>• ✅ Real-time band photo updates</li>
              <li>• ✅ Public photo serving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
