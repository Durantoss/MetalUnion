// SimpleToursPage component - temporarily simplified to prevent hooks errors
export function SimpleToursPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 p-4 pt-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent mb-4">
          🚌 TOUR DATES
        </h1>
        <p className="text-gray-400 text-lg">Discover upcoming metal and rock concerts</p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Tour discovery is being optimized...</p>
        <p className="text-sm text-gray-500">Check back soon for enhanced tour search features</p>
      </div>
    </div>
  );
}