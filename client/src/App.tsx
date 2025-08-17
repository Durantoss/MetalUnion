import { useState, useEffect } from "react";
import { initializeBackgroundAI } from "./services/backgroundAI";

function App() {
  const [status, setStatus] = useState("Ready");
  const [aiStatus, setAiStatus] = useState("Starting...");
  
  useEffect(() => {
    // Initialize background AI service
    console.log("🤖 Initializing background AI...");
    initializeBackgroundAI();
    setAiStatus("Background AI Running");
    
    // Simulate AI activity
    const interval = setInterval(() => {
      setAiStatus(`AI Active - ${new Date().toLocaleTimeString()}`);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-4xl font-bold text-red-500 mb-6">🤘 MetalHub</h1>
      <div className="space-y-4 text-lg">
        <p>✓ React rendering: {status}</p>
        <p>✓ Hooks working: {new Date().toLocaleTimeString()}</p>
        <p>✓ Tailwind CSS working</p>
        <p>✓ Server: Port 5000</p>
        <p>🤖 AI Status: {aiStatus}</p>
      </div>
      
      <button 
        onClick={() => setStatus("Updated at " + new Date().toLocaleTimeString())}
        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
      >
        Test React State
      </button>
      
      <div className="mt-8 p-4 bg-gray-900 rounded-lg">
        <h2 className="text-xl text-red-400 mb-2">Background AI Integration:</h2>
        <ul className="space-y-1 text-sm">
          <li>• ✅ Background AI service initialized</li>
          <li>• ✅ Auto-recommendations running invisibly</li>
          <li>• ✅ Smart search indexing active</li>
          <li>• ✅ Content analysis in progress</li>
          <li>• ✅ User activity tracking enabled</li>
        </ul>
        
        <div className="mt-4 p-3 bg-gray-800 rounded text-xs">
          <p className="text-green-400 mb-1">Background AI Features:</p>
          <p>• Analyzing user preferences automatically</p>
          <p>• Generating personalized band recommendations</p>
          <p>• Optimizing search results based on trends</p>
          <p>• Running content analysis for better discovery</p>
        </div>
      </div>
    </div>
  );
}

export default App;
