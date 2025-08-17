import { useState, useEffect } from 'react';

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

interface LandingPageProps {
  onSectionChange: (section: string) => void;
  bands: Band[];
}

export function LandingPage({ onSectionChange, bands }: LandingPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Featured bands for the hero carousel
  const featuredBands = bands.slice(0, 3);

  useEffect(() => {
    if (featuredBands.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % featuredBands.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [featuredBands.length]);

  const sections = [
    {
      id: 'bands',
      title: 'DISCOVER BANDS',
      description: 'Explore metal and rock bands from around the world',
      icon: '🎸',
      stats: `${bands.length} Bands`,
      gradient: 'from-red-600 to-red-800',
      hoverGradient: 'from-red-500 to-red-700'
    },
    {
      id: 'tours',
      title: 'TOUR DATES',
      description: 'Never miss a live show with our tour tracking',
      icon: '🎫',
      stats: 'Live Updates',
      gradient: 'from-purple-600 to-purple-800',
      hoverGradient: 'from-purple-500 to-purple-700'
    },
    {
      id: 'reviews',
      title: 'REVIEWS',
      description: 'Read and write reviews for albums and concerts',
      icon: '⭐',
      stats: 'Community Driven',
      gradient: 'from-blue-600 to-blue-800',
      hoverGradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 'photos',
      title: 'PHOTOS',
      description: 'Share concert memories and band photography',
      icon: '📸',
      stats: 'Visual Stories',
      gradient: 'from-green-600 to-green-800',
      hoverGradient: 'from-green-500 to-green-700'
    },
    {
      id: 'pit',
      title: 'THE PIT',
      description: 'Connect with metalheads in our message board',
      icon: '🤘',
      stats: 'Community Hub',
      gradient: 'from-orange-600 to-orange-800',
      hoverGradient: 'from-orange-500 to-orange-700'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Floating Navigation Button */}
      <button
        onClick={() => onSectionChange('bands')}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full 
                   transition-all duration-300 transform hover:scale-110 shadow-lg"
        data-testid="button-floating-nav"
        title="Go to Bands"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images Carousel */}
        <div className="absolute inset-0 z-0">
          {featuredBands.map((band, index) => (
            <div
              key={band.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-30' : 'opacity-0'
              }`}
              style={{
                backgroundImage: band.imageUrl ? `url(${band.imageUrl})` : 'linear-gradient(45deg, #1a1a1a, #2d2d2d)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-6"
            style={{
              background: 'linear-gradient(45deg, #dc2626, #b91c1c, #991b1b)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(220, 38, 38, 0.5)',
              letterSpacing: '0.1em'
            }}
          >
            MOSHUNION
          </h1>
          
          <p className="text-xl md:text-3xl lg:text-4xl mb-8 font-bold text-gray-300">
            GAZE INTO THE ABYSS
          </p>
          
          <p className="text-lg md:text-xl mb-12 text-gray-400 max-w-3xl mx-auto">
            The ultimate destination for metal and rock enthusiasts. Discover bands, 
            track tours, share reviews, and connect with the global metal community.
          </p>

          {/* Featured Band Indicator */}
          {featuredBands.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-gray-500 mb-2">NOW FEATURING</p>
              <p className="text-2xl font-bold text-red-400">
                {featuredBands[currentImageIndex]?.name}
              </p>
            </div>
          )}

          <button
            onClick={() => onSectionChange('bands')}
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 
                     text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 
                     transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
            data-testid="button-enter-site"
          >
            ENTER THE UNION
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Interactive Sections Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-4 text-red-500">
            EXPLORE THE UNION
          </h2>
          <p className="text-xl text-center text-gray-400 mb-16 max-w-3xl mx-auto">
            Dive deep into every aspect of the metal community with our comprehensive platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`relative group cursor-pointer transform transition-all duration-500 
                          hover:scale-105 ${index === 2 ? 'lg:col-span-1 lg:col-start-2' : ''}`}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => onSectionChange(section.id)}
                data-testid={`section-${section.id}`}
              >
                <div className={`relative h-80 rounded-2xl bg-gradient-to-br ${
                  hoveredSection === section.id ? section.hoverGradient : section.gradient
                } p-8 overflow-hidden transition-all duration-500 
                border-2 border-gray-700 hover:border-gray-500`}>
                  
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" 
                         style={{
                           backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                                           radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
                           backgroundSize: '40px 40px'
                         }} />
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-6xl mb-4 transform transition-transform duration-300 
                                    group-hover:scale-110">
                        {section.icon}
                      </div>
                      
                      <h3 className="text-2xl font-black mb-3 text-white">
                        {section.title}
                      </h3>
                      
                      <p className="text-gray-200 text-sm leading-relaxed mb-4">
                        {section.description}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full 
                                     text-white backdrop-blur-sm">
                        {section.stats}
                      </span>
                      
                      <div className="text-white/60 group-hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M13 7l5 5-5 5M6 12h12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 
                                 ${hoveredSection === section.id ? 'opacity-20' : 'opacity-0'}
                                 bg-gradient-to-r from-white to-transparent`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-12 text-white">
            THE NUMBERS SPEAK
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: bands.length.toString(), label: 'BANDS', icon: '🎸' },
              { number: '∞', label: 'TOURS', icon: '🎫' },
              { number: '∞', label: 'REVIEWS', icon: '⭐' },
              { number: '∞', label: 'PHOTOS', icon: '📸' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-125">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-5xl font-black text-red-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-bold tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-red-500">
            JOIN THE UNION
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Ready to dive into the ultimate metal community? 
            Start exploring bands, tracking tours, and connecting with fellow metalheads.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onSectionChange('bands')}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 
                       text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 
                       transform hover:scale-105"
              data-testid="button-discover-bands"
            >
              DISCOVER BANDS
            </button>
            
            <button
              onClick={() => onSectionChange('pit')}
              className="bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 
                       text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 
                       transform hover:scale-105 border-2 border-gray-600 hover:border-gray-500"
              data-testid="button-join-pit"
            >
              ENTER THE PIT
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}