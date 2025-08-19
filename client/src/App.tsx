import { useState, useEffect } from 'react';
import { BandComparison } from './components/BandComparison';
import { ModernNavigation } from './components/ModernNavigation';
import { GlobalAuthHandler } from './components/auth/GlobalAuthHandler';
import { useAuth } from './hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

import { ReviewsSection } from './components/ReviewsSection';
import { PhotosSection } from './components/PhotosSection';
import { ThePit } from './components/ThePit';
import { MobileFriendlyLanding } from './components/MobileFriendlyLanding';
import { QuickFix } from './components/QuickFix';
import { SimpleLandingFallback } from './components/SimpleLandingFallback';
import { EmergencyLanding } from './components/EmergencyLanding';
// import { MobileCompatibilityCheck } from './components/MobileCompatibilityCheck';
import { EnhancedSocialHub } from './components/EnhancedSocialHub';
import { EnhancedToursPage } from './components/EnhancedToursPage';
import { UserProfile } from './components/UserProfile';
import { NotificationCenter } from './components/NotificationCenter';
// Re-enabling messaging components for full functionality
import { BasicMessagingFallback } from './components/BasicMessagingFallback';
import { ActivityFeed } from './components/ActivityFeed';
import { GameficationDashboard } from './components/GameficationDashboard';
// Events Discovery functionality has been migrated to Tours section
import { InteractivePolls } from './components/InteractivePolls';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/auth/AuthModal';
import { SharedSectionLayout } from './components/SharedSectionLayout';
import { BandDiscovery } from './components/BandDiscovery';
import { Band } from './types';



export default function App() {
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [currentSection, setCurrentSection] = useState('landing');
  
  // Enhanced debugging for state changes
  useEffect(() => {
    console.log('🔄 APP STATE CHANGED - currentSection is now:', currentSection);
  }, [currentSection]);
  
  // Enhanced section change handler with comprehensive debugging
  const debugSetCurrentSection = (newSection: string) => {
    console.log('🔄 SECTION CHANGE START');
    console.log('🔄 From:', currentSection, '(type:', typeof currentSection, ')');
    console.log('🔄 To:', newSection, '(type:', typeof newSection, ')');
    console.log('🔄 Valid sections: bands, social, tours, reviews, photos, messaging');
    
    if (!newSection || typeof newSection !== 'string') {
      console.error('❌ Invalid section provided:', newSection);
      return;
    }
    
    console.log('✅ Calling setCurrentSection with:', newSection);
    setCurrentSection(newSection);
    console.log('🔄 SECTION CHANGE END');
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  console.log('🎸 MoshUnion App - Section:', currentSection, '| Bands:', bands.length);
  
  // Use useAuth hook for persistent authentication
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  console.log('Auth state:', { currentUser, authLoading });
  
  // Check URL parameters for section navigation - ONLY on mount, not on every section change
  useEffect(() => {
    console.log('App mount - checking URL params');
    
    // Check for section in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlSection = urlParams.get('section');
    
    if (urlSection && ['bands', 'social', 'tours', 'reviews', 'photos', 'feed', 'gamification', 'polls', 'messaging', 'admin'].includes(urlSection)) {
      console.log('Setting section from URL:', urlSection);
      setCurrentSection(urlSection);
    } else {
      console.log('No valid section in URL, defaulting to landing');
      setCurrentSection('landing');
    }
  }, []); // Empty dependency array - only run on mount

  const handleReturnHome = () => {
    console.log('handleReturnHome called - navigation to landing');
    // Clear URL params first to prevent trap
    window.history.replaceState({}, '', window.location.pathname);
    debugSetCurrentSection('landing');
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

  if (loading || authLoading) {
    const loadingMessages = [
      "Initializing the pit...",
      "Tuning distorted guitars...",
      "Loading brutal riffs...",
      "Summoning the metal gods...",
      "Cranking the amplifiers to 11...",
      "Warming up the circle pit...",
      "Charging the mosh zone...",
      "Preparing headbanging protocols...",
      "Loading underground scenes...",
      "Activating metal detector..."
    ];
    
    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            marginBottom: '2rem',
            background: 'linear-gradient(45deg, #dc2626, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.1em'
          }}>
            MOSHUNION
          </h1>
          
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                animation: 'pulse 1.5s ease-in-out infinite 0.2s'
              }}></div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                animation: 'pulse 1.5s ease-in-out infinite 0.4s'
              }}></div>
            </div>
            <p style={{
              color: '#dc2626',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              fontFamily: 'monospace'
            }}>
              $ loading --metal-community
            </p>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.9rem'
            }}>
              {randomMessage}
            </p>
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
    console.log('Login button clicked - opening auth modal');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (user: any) => {
    // Update React Query cache with user data for immediate persistence
    queryClient.setQueryData(['/api/auth/user'], user);
    setShowAuthModal(false);
    console.log('User authenticated:', user);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      // Clear auth cache
      queryClient.setQueryData(['/api/auth/user'], null);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderContent = () => {
    console.log('🔍 RENDER DEBUG - Current section:', currentSection, 'Type:', typeof currentSection, 'Bands:', bands.length);
    
    // Only show landing page if explicitly set to 'landing' or initially undefined
    if (currentSection === 'landing' || currentSection === null || currentSection === undefined) {
      console.log('📱 Rendering MobileFriendlyLanding component');
      
      return (
        <MobileFriendlyLanding 
          onSectionChange={debugSetCurrentSection}
          bands={bands}
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      );
    }
    
    console.log('🔄 Loading section:', currentSection);
    switch (currentSection) {
      case 'bands':
        console.log('🎸 Rendering Band Discovery');
        return (
          <SharedSectionLayout 
            title="Band Discovery" 
            subtitle="Discover your next favorite metal and rock bands"
          >
            <BandDiscovery bands={bands} />
          </SharedSectionLayout>
        );
        return (
          <SharedSectionLayout 
            title="DISCOVER BANDS" 
            subtitle={`Explore ${bands.length} metal and rock bands from around the world`}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {bands.map(band => (
                <div
                  key={band.id}
                  style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(5px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
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
                    color: '#facc15',
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
                    >
                      Website ↗
                    </a>
                  )}
                  {band.instagram && (
                    <a
                      href={band.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#facc15',
                        color: '#000',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Instagram ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </SharedSectionLayout>
        );
      case 'social':
        console.log('🔥 Rendering The Pit');
        return (
          <SharedSectionLayout title="THE PIT" subtitle="Connect with fellow metalheads and rock fans">
            <EnhancedSocialHub />
          </SharedSectionLayout>
        );
      case 'feed':
        return (
          <SharedSectionLayout title="ACTIVITY FEED" subtitle="Stay updated with the latest community action">
            <ActivityFeed />
          </SharedSectionLayout>
        );
      case 'gamification':
        return (
          <SharedSectionLayout title="ACHIEVEMENTS" subtitle="Unlock rewards and climb the leaderboards">
            <GameficationDashboard />
          </SharedSectionLayout>
        );
      case 'polls':
        return (
          <SharedSectionLayout title="COMMUNITY POLLS" subtitle="Vote and shape the future of metal">
            <InteractivePolls />
          </SharedSectionLayout>
        );
      case 'tours':
        console.log('🎫 Rendering Tours');
        return (
          <SharedSectionLayout title="TOUR DISCOVERY" subtitle="Find live shows and concerts near you">
            <EnhancedToursPage />
          </SharedSectionLayout>
        );
      case 'reviews':
        console.log('⭐ Rendering Reviews');
        return (
          <SharedSectionLayout title="BAND REVIEWS" subtitle="Read and write reviews of your favorite bands">
            <ReviewsSection />
          </SharedSectionLayout>
        );
      case 'photos':
        console.log('📷 Rendering Photos');
        return (
          <SharedSectionLayout title="CONCERT PHOTOS" subtitle="Share and explore amazing concert photography">
            <PhotosSection />
          </SharedSectionLayout>
        );

      // Messaging cases with shared design
      case 'messaging-demo':
      case 'messaging':
        console.log('💬 Rendering Messages');
        return (
          <SharedSectionLayout 
            title="Messages" 
            subtitle="Connect with fellow metalheads"
          >
            <BasicMessagingFallback />
          </SharedSectionLayout>
        );
      case 'admin':
        return (
          <SharedSectionLayout title="PRIVATE MESSAGES" subtitle="Connect privately with other metalheads">
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              color: '#9ca3af'
            }}>
              <p>Private messaging feature coming soon...</p>
            </div>
          </SharedSectionLayout>
        );
      default:
        console.log('⚠️ Unknown section:', currentSection);
        return (
          <SharedSectionLayout 
            title="SECTION ERROR" 
            subtitle={`Unknown section: ${currentSection}`}
          >
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#dc2626'
            }}>
              <h2>🚨 Section "{currentSection}" not found</h2>
              <p>Available sections: bands, social, tours, reviews, photos, messaging</p>
              <button 
                onClick={() => debugSetCurrentSection('landing')}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Return to Landing
              </button>
            </div>
          </SharedSectionLayout>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
      {currentSection !== 'landing' && (
        <ModernNavigation
          currentSection={currentSection}
          onSectionChange={debugSetCurrentSection}
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
            onClick={() => debugSetCurrentSection('feed')}
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
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />
      
      {/* Authentication Modal - Disabled for testing */}
      {false && showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Global Authentication Handler */}
      <GlobalAuthHandler />

    </div>
  );
};

