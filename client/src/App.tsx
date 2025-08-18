import { useState, useEffect } from 'react';
import { BandComparison } from './components/BandComparison';
import { ModernNavigation } from './components/ModernNavigation';

import { ReviewsSection } from './components/ReviewsSection';
import { PhotosSection } from './components/PhotosSection';
import { ThePit } from './components/ThePit';
import { MobileFriendlyLanding } from './components/MobileFriendlyLanding';
import { QuickFix } from './components/QuickFix';
import { SimpleLandingFallback } from './components/SimpleLandingFallback';
import { EmergencyLanding } from './components/EmergencyLanding';
import { MobileCompatibilityCheck } from './components/MobileCompatibilityCheck';
import { EnhancedSocialHub } from './components/EnhancedSocialHub';
import { EnhancedEventsPage } from './components/EnhancedEventsPage';
import { SimpleToursPage } from './components/SimpleToursPage';
import { UserProfile } from './components/UserProfile';
import { NotificationCenter } from './components/NotificationCenter';
import { ActivityFeed } from './components/ActivityFeed';
import { GameficationDashboard } from './components/GameficationDashboard';
// Removed EventsHub - using EnhancedEventsPage instead
import { InteractivePolls } from './components/InteractivePolls';
import { Band } from './types';



const App = () => {
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [currentSection, setCurrentSection] = useState('landing');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Force landing page on mobile for debugging
  useEffect(() => {
    console.log('App useEffect - currentSection:', currentSection);
    if (!currentSection || currentSection === '') {
      console.log('Setting currentSection to landing');
      setCurrentSection('landing');
    }
  }, [currentSection]);

  const handleReturnHome = () => {
    console.log('handleReturnHome called');
    setCurrentSection('landing');
    setShowComparison(false);
  };

  useEffect(() => {
    console.log('App component mounted - React is working!');
    
    // Ensure dark mode is always applied
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    
    fetch('/api/bands')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('API call successful - Loaded bands:', data.length);
        setBands(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading bands:', err);
        setError('Failed to load bands. Please try again.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-6xl font-black gradient-text-neon mb-6 glow-text font-mono">
            MOSHUNION
          </h1>
          <div className="glass neo-border rounded-2xl p-6 mb-6 font-mono">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-neon-purple animate-pulse delay-100"></div>
              <div className="w-3 h-3 rounded-full bg-neon-pink animate-pulse delay-200"></div>
            </div>
            <p className="text-neon-cyan text-sm">$ system --initialize</p>
            <p className="text-muted-foreground">Loading neural networks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '3rem',
            color: '#dc2626',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            MOSHUNION
          </h1>
          <p style={{ color: '#f87171' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '1rem'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    console.log('Login button clicked');
    fetch('/api/login')
      .then(response => response.json())
      .then(data => {
        console.log('Login response:', data);
        alert(data.message || 'Login functionality temporarily disabled for testing');
      })
      .catch(err => {
        console.error('Login error:', err);
        alert('Login service temporarily unavailable');
      });
  };

  const renderContent = () => {
    console.log('Rendering section:', currentSection, 'with', bands.length, 'bands');
    
    // Force landing page display for mobile debugging
    if (currentSection === 'landing' || !currentSection || currentSection === '' || currentSection === undefined) {
      console.log('Rendering MobileFriendlyLanding component');
      
      // Use QuickFix for guaranteed loading
      return (
        <QuickFix 
          onSectionChange={setCurrentSection}
          bands={bands}
        />
      );
    }
    
    switch (currentSection) {
      case 'bands':
        return (
          <div>
            <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
              <h1 style={{
                fontSize: '4rem',
                color: '#dc2626',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                letterSpacing: '0.1em'
              }}>
                DISCOVER BANDS
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#9ca3af',
                marginBottom: '2rem'
              }}>
                Explore {bands.length} metal and rock bands from around the world
              </p>
            </header>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
              padding: '0 2rem'
            }}>
              {bands.map(band => (
                <div
                  key={band.id}
                  style={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'transform 0.2s, border-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#374151';
                  }}
                >
                  {band.imageUrl && (
                    <img
                      src={band.imageUrl}
                      alt={band.name}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                      }}
                    />
                  )}
                  <h3 style={{
                    fontSize: '1.5rem',
                    color: '#dc2626',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}>
                    {band.name}
                  </h3>
                  <p style={{
                    color: '#f87171',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem',
                    fontWeight: '600'
                  }}>
                    {band.genre}
                  </p>
                  {band.founded && (
                    <p style={{
                      color: '#9ca3af',
                      fontSize: '0.8rem',
                      marginBottom: '1rem'
                    }}>
                      Founded: {band.founded}
                    </p>
                  )}
                  <p style={{
                    color: '#d1d5db',
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    marginBottom: '1rem'
                  }}>
                    {band.description}
                  </p>
                  {band.website && (
                    <a
                      href={band.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        console.log(`Opening ${band.name} website: ${band.website}`);
                      }}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginRight: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#b91c1c';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Website ↗
                    </a>
                  )}
                  {band.instagram && (
                    <a
                      href={band.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        console.log(`Opening ${band.name} Instagram: ${band.instagram}`);
                      }}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#6d28d9';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#7c3aed';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Instagram ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'social':
        return <EnhancedSocialHub />;
      case 'feed':
        return <ActivityFeed />;
      case 'gamification':
        return <GameficationDashboard />;
      case 'events':
        return <EnhancedEventsPage />;
      case 'polls':
        return <InteractivePolls />;
      case 'tours':
        return <SimpleToursPage />;
      case 'reviews':
        return (
          <div style={{ padding: '0 2rem' }}>
            <ReviewsSection />
          </div>
        );
      case 'photos':
        return (
          <div style={{ padding: '0 2rem' }}>
            <PhotosSection />
          </div>
        );
      case 'pit':
        return (
          <div style={{ padding: '0 2rem' }}>
            <ThePit />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
      {currentSection !== 'landing' && (
        <ModernNavigation
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          onShowComparison={() => setShowComparison(true)}
          onShowLogin={handleLogin}
          onReturnHome={handleReturnHome}
        />
      )}
      
      <main style={{ width: '100%' }}>
        <div>
          {renderContent()}
        </div>
        
        {showComparison && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-lg">
            <BandComparison 
              bands={bands} 
              onClose={() => setShowComparison(false)} 
            />
          </div>
        )}

        {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-lg">
            <div className="bg-background border border-border rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <NotificationCenter onClose={() => setShowNotifications(false)} />
            </div>
          </div>
        )}

        {showUserProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-lg">
            <div className="bg-background border border-border rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <UserProfile userId="demo-user" isOwnProfile={true} onClose={() => setShowUserProfile(false)} />
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Buttons for Social Features */}
      {currentSection !== 'landing' && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
          <button
            onClick={() => setShowNotifications(true)}
            className="bg-fire-red hover:bg-fire-red/80 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 relative"
            data-testid="button-notifications"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-electric-yellow text-void-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              3
            </span>
          </button>

          <button
            onClick={() => setShowUserProfile(true)}
            className="bg-electric-yellow hover:bg-electric-yellow/80 text-void-black rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            data-testid="button-profile"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentSection('feed')}
            className={`${currentSection === 'feed' ? 'bg-lava-orange' : 'bg-border hover:bg-border/80'} text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110`}
            data-testid="button-activity-feed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* Global CSS animations for smooth transitions */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .section-transition {
          animation: fadeInUp 0.4s ease-out;
        }
        
        .smooth-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .smooth-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(220, 38, 38, 0.3);
        }
        
        .page-enter {
          opacity: 0;
          transform: translateY(20px);
        }
        
        .page-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.4s ease-out;
        }
        
        /* Ensure consistent background colors */
        .unified-section {
          background: rgba(0, 0, 0, 0.95);
          min-height: 100vh;
          color: white;
        }
      `}</style>
      <MobileCompatibilityCheck />
    </div>
  );
};

export default App;