import React from 'react';
import { ActivityFeed } from './ActivityFeed';
import { BasicMessagingFallback } from './BasicMessagingFallback';
import { ProximityMatcher } from './ProximityMatcher';
import { CommunityFeed } from './CommunityFeed';
import { CommunityHub } from './CommunityHub';
import { MessageCircle, Users, TrendingUp, Heart, Calendar, Camera, Bell, Settings, Star, Music, Zap, Navigation, MapPin } from 'lucide-react';

interface SocialHubProps {
  userId?: string;
  initialTab?: string;
}

export function EnhancedSocialHub({ userId = 'demo-user', initialTab = 'feed' }: SocialHubProps) {
  // Using state for reliable tab management
  const [currentActiveTab, setCurrentActiveTab] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace('#', '') || 'social-feed';
      return currentHash.split('-')[1] || 'feed';
    }
    return 'feed';
  });
  
  const activeTab = currentActiveTab;

  const stats = {
    onlineUsers: 147,
    activeConversations: 8,
    newNotifications: 12,
    todaysPosts: 34,
    upcomingEvents: 12,
    totalMembers: 3247
  };

  const handleTabChange = (tab: string) => {
    console.log('Tab change requested:', tab);
    setCurrentActiveTab(tab);
    window.location.hash = `social-${tab}`;
    // Force re-render by triggering a small DOM update
    document.body.classList.add('tab-changing');
    setTimeout(() => {
      document.body.classList.remove('tab-changing');
    }, 100);
  };

  // Listen for hash changes (back/forward navigation)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '') || 'social-feed';
      const newTab = currentHash.split('-')[1] || 'feed';
      setCurrentActiveTab(newTab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const tabs = [
    {
      id: 'feed',
      name: 'The Pit',
      icon: Users,
      badge: stats.todaysPosts,
      description: 'Metal discussions, feed, and community',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'messaging',
      name: 'Secure Messages',
      icon: MessageCircle,
      badge: stats.activeConversations,
      description: 'End-to-end encrypted messaging',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'events',
      name: 'Events Hub',
      icon: Calendar,
      badge: stats.upcomingEvents,
      description: 'Concerts, meetups, and festivals',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'proximity',
      name: 'Concert Proximity',
      icon: Navigation,
      badge: 0,
      description: 'Find metalheads at your concert venue',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <CommunityHub stats={stats} />;
      case 'messaging':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-3xl font-bold text-white">Secure Messages</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-lg border border-green-500/30">
                  <MessageCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-semibold">End-to-End Encrypted</span>
                </div>
                <button
                  onClick={() => {
                    console.log('Advanced Messaging button clicked');
                    window.location.href = `/?section=advanced-messaging`;
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  data-testid="button-advanced-messaging"
                >
                  <Zap className="w-4 h-4" />
                  Advanced Messaging
                </button>
              </div>
            </div>
            <BasicMessagingFallback />
          </div>
        );

      case 'events':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Events Hub</h2>
            <div className="bg-black/40 border border-red-900/30 rounded-lg p-8 text-center">
              <Calendar className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-4">Event Discovery</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Discover concerts, festivals, and metal events near you with AI-powered recommendations. 
                Get personalized suggestions based on your musical taste and location.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
                  <Star className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">AI Recommendations</div>
                  <div className="text-gray-400 text-sm">Smart event matching</div>
                </div>
                <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                  <Calendar className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">Local Events</div>
                  <div className="text-gray-400 text-sm">Concerts near you</div>
                </div>
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                  <Music className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">Genre Filter</div>
                  <div className="text-gray-400 text-sm">Metal & rock focus</div>
                </div>
              </div>
              <button 
                onClick={() => window.location.hash = 'events'}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 touch-manipulation"
              >
                Explore Event Discovery
              </button>
            </div>
          </div>
        );
      case 'proximity':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">Concert Proximity</h2>
                <p className="text-gray-400 mt-2">Find and connect with metalheads at your concert venue</p>
              </div>
              <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-lg border border-purple-500/30">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span className="text-purple-400 font-semibold">Location-Based Discovery</span>
              </div>
            </div>
            
            <ProximityMatcher />
          </div>
        );
      default:
        return <ActivityFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900">
      {/* Header */}
      <div className="bg-black/50 border-b border-red-900/30 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
                🤘 Social Hub
              </h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{stats.onlineUsers} online</span>
                <span className="text-gray-600">•</span>
                <span>{stats.totalMembers} members</span>
              </div>
            </div>
            
            {/* Notifications */}
            <div className="flex items-center space-x-4">
              <div className="relative cursor-pointer">
                <Bell className="h-6 w-6 text-gray-400 hover:text-red-400 transition-colors" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.newNotifications}
                </span>
              </div>
              <Settings className="h-6 w-6 text-gray-400 hover:text-red-400 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Navigation Tabs */}
      <div className="bg-black/30 border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  onTouchStart={() => {}} // Ensure touch events are registered
                  className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 px-3 md:px-6 py-3 md:py-4 border-b-2 transition-all min-w-fit touch-manipulation active:scale-95 ${
                    isActive
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-transparent text-gray-400 hover:text-red-300 hover:border-red-300/50 active:bg-red-500/5'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {tab.badge > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <div className="font-semibold text-xs md:text-sm">{tab.name}</div>
                    <div className="text-xs opacity-75 hidden lg:block">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {renderTabContent()}
      </div>
      
      {/* Mobile Bottom Padding for Safe Area */}
      <div className="h-6 md:hidden"></div>
    </div>
  );
}