import { useQuery } from '@tanstack/react-query';

interface Band {
  id: string;
  name: string;
  genre: string;
  description: string;
  imageUrl?: string;
  founded?: number;
  members?: string[];
  albums?: string[];
  website?: string;
  instagram?: string;
}

export function BandListPage() {
  const { data: bands, isLoading, error } = useQuery<Band[]>({
    queryKey: ['/api/bands'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12 border-b-2 border-red-600 pb-8">
            <h1 className="text-6xl font-black text-red-600 mb-4 tracking-wider">METALHUB</h1>
            <p className="text-xl text-gray-300">GAZE INTO THE ABYSS</p>
          </header>
          <div className="text-center">
            <h2 className="text-2xl text-red-600 mb-4">Loading metal bands...</h2>
            <div className="text-4xl animate-bounce">🤘</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12 border-b-2 border-red-600 pb-8">
            <h1 className="text-6xl font-black text-red-600 mb-4 tracking-wider">METALHUB</h1>
            <p className="text-xl text-gray-300">GAZE INTO THE ABYSS</p>
          </header>
          <div className="text-center">
            <h2 className="text-2xl text-red-600">Error loading bands</h2>
            <p className="text-gray-400 mt-2">Please refresh the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12 border-b-2 border-red-600 pb-8">
          <h1 className="text-6xl font-black text-red-600 mb-4 tracking-wider">METALHUB</h1>
          <p className="text-xl text-gray-300">GAZE INTO THE ABYSS</p>
        </header>

        <div className="mb-8">
          <h2 className="text-3xl text-red-600 mb-6">Featured Bands</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bands?.map((band) => (
              <div
                key={band.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 hover:transform hover:-translate-y-1 hover:shadow-xl hover:border-red-600 transition-all duration-200"
              >
                <h3 className="text-xl font-bold text-red-600 mb-2" data-testid={`text-band-name-${band.id}`}>
                  {band.name}
                </h3>
                <p className="text-gray-400 mb-3" data-testid={`text-band-genre-${band.id}`}>
                  {band.genre}
                </p>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3" data-testid={`text-band-description-${band.id}`}>
                  {band.description}
                </p>
                
                {band.founded && (
                  <p className="text-gray-500 text-sm mb-2">
                    Founded: {band.founded}
                  </p>
                )}
                
                {band.members && band.members.length > 0 && (
                  <p className="text-gray-500 text-sm mb-4">
                    Members: {band.members.slice(0, 3).join(', ')}
                    {band.members.length > 3 && '...'}
                  </p>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors"
                    onClick={() => window.open(`https://www.ticketmaster.com/search?q=${encodeURIComponent(band.name)}`, '_blank')}
                    data-testid={`button-tickets-${band.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    🎫 GET TICKETS
                  </button>
                  
                  {band.website && (
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
                      onClick={() => window.open(band.website, '_blank')}
                      data-testid={`button-website-${band.id}`}
                    >
                      🌐 WEBSITE
                    </button>
                  )}
                  
                  {band.instagram && (
                    <button
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded font-medium transition-colors"
                      onClick={() => window.open(band.instagram, '_blank')}
                      data-testid={`button-instagram-${band.id}`}
                    >
                      📸 INSTAGRAM
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}