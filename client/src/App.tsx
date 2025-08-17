import { useState } from "react";

function App() {
  console.log("Minimal App rendering - timestamp:", Date.now());
  
  // Test simple React hook to isolate the issue
  const [test, setTest] = useState("test");
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-4">MetalHub Debug</h1>
      <p className="text-xl">App timestamp: {Date.now()}</p>
      <p>Hook test: {test}</p>
      <div className="mt-8">
        <p>✓ Server running on port 5000</p>
        <p>✓ React app initialized</p>
        <p>⚡ Ready to rock!</p>
      </div>
    </div>
  );
}

export default App;
