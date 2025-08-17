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

interface SimpleLandingPageProps {
  onSectionChange: (section: string) => void;
  bands: Band[];
}

export function SimpleLandingPage({ onSectionChange, bands }: SimpleLandingPageProps) {
  const featuredBands = bands?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-void-black via-void-black to-fire-red/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center p-6">
        <div className="text-3xl font-black font-mono gradient-text-fire">
          MOSHUNION
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => onSectionChange('bands')}
            className="px-6 py-2 bg-fire-red/20 border border-fire-red rounded-lg font-mono text-fire-red hover:bg-fire-red hover:text-white transition-all"
            data-testid="button-discover"
          >
            DISCOVER
          </button>
          <button
            onClick={() => onSectionChange('social')}
            className="px-6 py-2 bg-electric-yellow/20 border border-electric-yellow rounded-lg font-mono text-electric-yellow hover:bg-electric-yellow hover:text-void-black transition-all"
            data-testid="button-social"
          >
            SOCIAL HUB
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-black font-mono gradient-text-fire mb-6 tracking-wider">
          METAL UNITED
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl">
          The ultimate social platform for metal and rock music communities
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-fire-red">{bands.length}</div>
            <div className="text-sm text-muted-foreground">BANDS</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-electric-yellow">500+</div>
            <div className="text-sm text-muted-foreground">REVIEWS</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-lava-orange">1.2K</div>
            <div className="text-sm text-muted-foreground">PHOTOS</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">50+</div>
            <div className="text-sm text-muted-foreground">TOURS</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => onSectionChange('social')}
            className="px-8 py-4 bg-gradient-to-r from-fire-red to-lava-orange text-white font-bold rounded-lg hover:scale-105 transition-all duration-200 shadow-lg"
            data-testid="button-join-community"
          >
            JOIN THE COMMUNITY
          </button>
          <button
            onClick={() => onSectionChange('bands')}
            className="px-8 py-4 border-2 border-electric-yellow text-electric-yellow font-bold rounded-lg hover:bg-electric-yellow hover:text-void-black transition-all duration-200"
            data-testid="button-explore-bands"
          >
            EXPLORE BANDS
          </button>
        </div>
      </div>

      {/* Featured Bands */}
      {featuredBands.length > 0 && (
        <div className="relative z-10 px-6 pb-16">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text-fire">
            FEATURED BANDS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {featuredBands.map((band) => (
              <div
                key={band.id}
                className="bg-border/10 border border-border rounded-lg p-4 hover:border-fire-red transition-all duration-200 hover:scale-105"
              >
                {band.imageUrl && (
                  <img
                    src={band.imageUrl}
                    alt={band.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-bold text-fire-red mb-2">{band.name}</h3>
                <p className="text-sm text-electric-yellow mb-2">{band.genre}</p>
                <p className="text-xs text-muted-foreground line-clamp-3">{band.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}