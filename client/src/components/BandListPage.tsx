// Simple band list page without hooks for testing
export function BandListPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 border-b-2 border-red-600 pb-8">
          <h1 className="text-6xl font-black text-red-600 mb-4 tracking-wider">METALHUB</h1>
          <p className="text-xl text-gray-300">GAZE INTO THE ABYSS</p>
        </header>

        <div className="mb-8">
          <h2 className="text-3xl text-red-600 mb-6">Featured Bands</h2>
          
          <div className="text-center">
            <p className="text-gray-400">Welcome to MetalHub! Sign in to view the featured bands.</p>
          </div>
        </div>
      </div>
    </div>
  );
}