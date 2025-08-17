import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, DollarSign, Users, Search, Filter, Star } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TourStop {
  city: string;
  state?: string;
  country?: string;
  venue: string;
  date: string;
  ticketUrl?: string;
}

interface TourInfo {
  id: string;
  tourName: string;
  bands: string[];
  headliner: string;
  currentStops: TourStop[];
  posterUrl?: string;
  description?: string;
  genre?: string;
  startDate?: string;
  endDate?: string;
  ticketPriceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  relevanceScore?: number;
  aiRecommendationReason?: string;
}

interface TourSearchFilters {
  query: string;
  location: string;
  preferredGenres: string[];
  favoriteArtists: string[];
  priceRange: {
    min: number;
    max: number;
  };
  radius: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export function EnhancedToursPage() {
  const [searchFilters, setSearchFilters] = useState<TourSearchFilters>({
    query: '',
    location: '',
    preferredGenres: ['metal', 'rock'],
    favoriteArtists: [],
    priceRange: { min: 20, max: 300 },
    radius: 100
  });

  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const { data: tours = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/tours/discover', searchFilters],
    queryFn: async () => {
      const response = await apiRequest('/api/tours/discover', {
        method: 'POST',
        body: searchFilters
      });
      return response as TourInfo[];
    },
    enabled: hasSearched
  });

  const handleSearch = () => {
    setHasSearched(true);
    
    // Add to search history if query exists
    if (searchFilters.query && !searchHistory.includes(searchFilters.query)) {
      setSearchHistory(prev => [searchFilters.query, ...prev.slice(0, 4)]);
    }
    
    setShowSuggestions(false);
    refetch();
  };

  // Popular tour searches and band suggestions
  const popularSearches = [
    'metallica tour', 'iron maiden tour', 'black sabbath tour', 'judas priest tour',
    'megadeth tour', 'slayer tour', 'pantera tour', 'anthrax tour', 'testament tour',
    'metal tour 2025', 'rock festival', 'death metal tour', 'thrash metal tour'
  ];

  const handleQueryChange = (value: string) => {
    setSearchFilters(prev => ({ ...prev, query: value }));
    
    if (value.length > 2) {
      const suggestions = popularSearches
        .filter(search => search.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSearchSuggestions([...new Set([...suggestions, ...searchHistory])]);
      setShowSuggestions(suggestions.length > 0 || searchHistory.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchFilters(prev => ({ ...prev, query: suggestion }));
    setShowSuggestions(false);
    setHasSearched(true);
    refetch();
  };

  const genreOptions = ['metal', 'rock', 'hardcore', 'punk', 'progressive', 'alternative', 'thrash', 'death metal', 'black metal'];

  const formatPrice = (price: { min: number; max: number; currency: string }) => {
    return `$${price.min} - $${price.max}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Animated Background Effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.3,
        pointerEvents: 'none',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(234, 179, 8, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridSlide 20s linear infinite'
        }} />
        
        {/* Floating Energy Orbs */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${60 + i * 20}px`,
            height: `${60 + i * 20}px`,
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, rgba(220, 38, 38, 0.1) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(234, 179, 8, 0.6) 0%, rgba(234, 179, 8, 0.1) 70%, transparent 100%)',
            borderRadius: '50%',
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
            animation: `float ${8 + i * 2}s ease-in-out infinite`,
            filter: 'blur(15px)'
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '2rem 1rem' }}>
        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #dc2626 0%, #eab308 50%, #ffffff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '1rem',
            textShadow: '0 0 30px rgba(220, 38, 38, 0.5)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            TOUR RADAR
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Discover epic tours powered by Google search and AI recommendations
          </p>
        </div>

        {/* Primary Search Bar */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 1rem auto',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '16px',
            padding: '1rem',
            border: '2px solid rgba(220, 38, 38, 0.4)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)'
          }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search tours: metallica, iron maiden, metal tour 2025..."
                value={searchFilters.query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => {
                  if (searchFilters.query.length > 2) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                style={{
                  width: '100%',
                  padding: '16px 120px 16px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '18px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                data-testid="input-tour-search"
              />
              <button
                onClick={handleSearch}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '12px 24px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
                data-testid="button-search-tours"
              >
                SEARCH
              </button>
              
              {/* Search Suggestions */}
              {showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '0 0 12px 12px',
                  zIndex: 20,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  backdropFilter: 'blur(10px)',
                  marginTop: '4px'
                }}>
                  {searchHistory.length > 0 && (
                    <>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(220, 38, 38, 0.2)' }}>
                        <p style={{ color: '#eab308', fontSize: '14px', margin: 0, fontWeight: '600' }}>
                          Recent Searches
                        </p>
                      </div>
                      {searchHistory.slice(0, 3).map((item, index) => (
                        <div
                          key={`history-${index}`}
                          onClick={() => selectSuggestion(item)}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          data-testid={`search-history-${index}`}
                        >
                          <Clock size={16} style={{ marginRight: '12px', color: '#eab308' }} />
                          {item}
                        </div>
                      ))}
                    </>
                  )}
                  
                  {searchSuggestions.filter(s => !searchHistory.includes(s)).slice(0, 6).map((suggestion, index) => (
                    <div
                      key={`suggestion-${index}`}
                      onClick={() => selectSuggestion(suggestion)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '16px',
                        borderBottom: index < 5 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      data-testid={`search-suggestion-${index}`}
                    >
                      <Search size={16} style={{ marginRight: '12px', color: '#dc2626' }} />
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center', 
              marginTop: '16px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => selectSuggestion('metal tour 2025')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                  color: '#eab308',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                data-testid="button-quick-metal"
              >
                🤘 Metal Tours
              </button>
              
              <button
                onClick={() => selectSuggestion('rock festival')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  color: '#dc2626',
                  border: '1px solid rgba(220, 38, 38, 0.4)',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                data-testid="button-quick-rock"
              >
                🎸 Rock Festivals
              </button>
              
              <button
                onClick={() => selectSuggestion('metallica tour')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                data-testid="button-quick-metallica"
              >
                ⚡ Metallica
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 2rem auto',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{ 
              color: '#eab308', 
              fontSize: '18px', 
              margin: 0, 
              fontWeight: '600' 
            }}>
              Advanced Filters
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 16px',
                backgroundColor: showFilters ? '#dc2626' : 'rgba(220, 38, 38, 0.2)',
                color: showFilters ? 'white' : '#dc2626',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              data-testid="button-toggle-filters"
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#eab308', 
                fontWeight: '600' 
              }}>
                Location
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="City, State or ZIP"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  data-testid="input-location"
                />
                <MapPin style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#dc2626',
                  width: '20px',
                  height: '20px'
                }} />
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#eab308', 
                fontWeight: '600' 
              }}>
                Price Range
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={searchFilters.priceRange.min}
                  onChange={(e) => setSearchFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, min: parseInt(e.target.value) || 0 } 
                  }))}
                  style={{
                    width: '80px',
                    padding: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  data-testid="input-price-min"
                />
                <span style={{ color: 'white' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={searchFilters.priceRange.max}
                  onChange={(e) => setSearchFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, max: parseInt(e.target.value) || 500 } 
                  }))}
                  style={{
                    width: '80px',
                    padding: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  data-testid="input-price-max"
                />
              </div>
            </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              style={{
                padding: '12px 32px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)'
              }}
              data-testid="button-search-tours"
            >
              {isLoading ? 'Searching Tours...' : 'Search Tours'}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                color: '#eab308',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              data-testid="button-toggle-filters"
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(234, 179, 8, 0.2)'
            }}>
              <h3 style={{ color: '#eab308', marginBottom: '1rem' }}>Advanced Filters</h3>
              
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#eab308' }}>
                    Preferred Genres
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {genreOptions.map(genre => (
                      <button
                        key={genre}
                        onClick={() => {
                          const isSelected = searchFilters.preferredGenres.includes(genre);
                          setSearchFilters(prev => ({
                            ...prev,
                            preferredGenres: isSelected 
                              ? prev.preferredGenres.filter(g => g !== genre)
                              : [...prev.preferredGenres, genre]
                          }));
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: searchFilters.preferredGenres.includes(genre) 
                            ? '#dc2626' 
                            : 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          border: searchFilters.preferredGenres.includes(genre)
                            ? '1px solid #dc2626'
                            : '1px solid rgba(220, 38, 38, 0.3)',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        data-testid={`genre-${genre}`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '3px solid rgba(220, 38, 38, 0.3)',
                borderTop: '3px solid #dc2626',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem auto'
              }} />
              <p style={{ fontSize: '1.2rem', color: '#eab308' }}>Searching for tours...</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Using Google Search and AI recommendations</p>
            </div>
          </div>
        )}

        {/* Demo Tours Notice */}
        {!isLoading && tours.length > 0 && tours[0].id?.startsWith('demo-') && (
          <div style={{
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            maxWidth: '1200px',
            margin: '0 auto 2rem auto',
            color: '#eab308',
            textAlign: 'center'
          }}>
            <p>
              <strong>Demo Tours:</strong> Showing sample tour data while Google API processes your search. 
              Add more API keys (SeatGeek, Ticketmaster, Bandsintown) for complete real tour information.
            </p>
          </div>
        )}

        {/* Tours Grid */}
        {tours.length > 0 && !isLoading && (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
          }}>
            {tours.map((tour, index) => (
              <div
                key={tour.id}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}
                data-testid={`tour-card-${index}`}
              >
                {/* Tour Poster */}
                {tour.posterUrl && (
                  <div style={{
                    position: 'relative',
                    height: '200px',
                    backgroundImage: `url(${tour.posterUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)'
                    }} />
                    
                    {/* AI Score Badge */}
                    {tour.relevanceScore && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(234, 179, 8, 0.9)',
                        color: 'black',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Star size={12} fill="currentColor" />
                        {Math.round(tour.relevanceScore * 100)}%
                      </div>
                    )}

                    {/* Genre Tag */}
                    {tour.genre && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(220, 38, 38, 0.9)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {tour.genre}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ padding: '1.5rem' }}>
                  {/* Tour Info */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: 'white',
                      marginBottom: '0.5rem',
                      lineHeight: 1.2
                    }}>
                      {tour.tourName}
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '0.5rem'
                    }}>
                      <Users size={16} style={{ color: '#dc2626' }} />
                      <span style={{ color: '#eab308', fontWeight: '600' }}>
                        {tour.headliner}
                      </span>
                      {tour.bands.length > 1 && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                          + {tour.bands.length - 1} more
                        </span>
                      )}
                    </div>

                    {/* All Bands */}
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        fontSize: '0.9rem',
                        lineHeight: 1.4 
                      }}>
                        {tour.bands.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Tour Stops */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ 
                      color: '#eab308', 
                      fontSize: '1rem', 
                      marginBottom: '0.5rem',
                      fontWeight: '600'
                    }}>
                      Upcoming Stops
                    </h4>
                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {tour.currentStops.slice(0, 3).map((stop, stopIndex) => (
                        <div key={stopIndex} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 0',
                          borderBottom: stopIndex < tour.currentStops.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                        }}>
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '2px'
                            }}>
                              <MapPin size={14} style={{ color: '#dc2626' }} />
                              <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>
                                {stop.city}{stop.state && `, ${stop.state}`}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <Calendar size={12} style={{ color: '#eab308' }} />
                              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8rem' }}>
                                {formatDate(stop.date)}
                              </span>
                            </div>
                            <p style={{ 
                              color: 'rgba(255, 255, 255, 0.6)', 
                              fontSize: '0.8rem',
                              margin: '2px 0 0 20px' 
                            }}>
                              {stop.venue}
                            </p>
                          </div>
                          
                          {stop.ticketUrl && (
                            <a
                              href={stop.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                              }}
                              data-testid={`ticket-link-${stopIndex}`}
                            >
                              Tickets
                            </a>
                          )}
                        </div>
                      ))}
                      
                      {tour.currentStops.length > 3 && (
                        <p style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          padding: '8px 0',
                          fontStyle: 'italic'
                        }}>
                          + {tour.currentStops.length - 3} more stops
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price and AI Recommendation */}
                  <div style={{ marginTop: '1rem' }}>
                    {tour.ticketPriceRange && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '0.5rem'
                      }}>
                        <DollarSign size={16} style={{ color: '#eab308' }} />
                        <span style={{ color: 'white', fontWeight: '600' }}>
                          {formatPrice(tour.ticketPriceRange)}
                        </span>
                      </div>
                    )}

                    {tour.aiRecommendationReason && (
                      <div style={{
                        backgroundColor: 'rgba(234, 179, 8, 0.1)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginTop: '1rem'
                      }}>
                        <p style={{
                          color: '#eab308',
                          fontSize: '0.85rem',
                          lineHeight: 1.4,
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          <strong>AI Recommendation:</strong> {tour.aiRecommendationReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {hasSearched && !isLoading && tours.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <h3 style={{ color: '#eab308', marginBottom: '1rem', fontSize: '1.5rem' }}>
              No tours found
            </h3>
            <p style={{ marginBottom: '2rem', maxWidth: '500px', margin: '0 auto' }}>
              Try adjusting your search terms, location, or expanding your genre preferences to discover more tours.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setSearchFilters({
                    query: '',
                    location: '',
                    preferredGenres: ['metal', 'rock'],
                    favoriteArtists: [],
                    priceRange: { min: 20, max: 300 },
                    radius: 100
                  });
                  setHasSearched(false);
                  setSearchHistory([]);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                data-testid="button-reset-search"
              >
                Reset Search
              </button>
              
              {/* Quick Search Buttons */}
              <button
                onClick={() => selectSuggestion('metal tour 2025')}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                  color: '#eab308',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                data-testid="button-quick-metal"
              >
                Metal Tours
              </button>
              
              <button
                onClick={() => selectSuggestion('rock festival')}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  color: '#dc2626',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                data-testid="button-quick-rock"
              >
                Rock Festivals
              </button>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && !isLoading && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <h3 style={{ color: '#eab308', marginBottom: '1rem', fontSize: '1.5rem' }}>
              Ready to discover epic tours?
            </h3>
            <p style={{ maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Search for your favorite bands, explore tours by genre, or discover new music experiences. 
              Our Google-powered search and AI recommendations will help you find the perfect shows.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes gridSlide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}