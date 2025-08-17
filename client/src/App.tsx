import { useState } from "react";

function App() {
  const [status, setStatus] = useState("Ready");
  
  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-4xl font-bold text-red-500 mb-6">🤘 MetalHub</h1>
      <div className="space-y-4 text-lg">
        <p>✓ React rendering: {status}</p>
        <p>✓ Hooks working: {new Date().toLocaleTimeString()}</p>
        <p>✓ Tailwind CSS working</p>
        <p>✓ Server: Port 5000</p>
        <p>✓ No problematic imports</p>
      </div>
      
      <button 
        onClick={() => setStatus("Updated at " + new Date().toLocaleTimeString())}
        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
      >
        Test React State
      </button>
      
      <div className="mt-8 p-4 bg-gray-900 rounded-lg">
        <h2 className="text-xl text-red-400 mb-2">Clean Slate Status:</h2>
        <ul className="space-y-1 text-sm">
          <li>• Removed all problematic components</li>
          <li>• No useAuth or useQuery imports</li>
          <li>• Pure React with useState only</li>
          <li>• Ready to rebuild step by step</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
