import { ActivityFeed } from './ActivityFeed';
import { SecureDirectMessaging } from './SecureDirectMessaging';
import { MessageCircle, Users, TrendingUp, Heart, Calendar, Camera, Bell, Settings, Star, Music, Zap } from 'lucide-react';

interface SocialHubProps {
  userId?: string;
  initialTab?: string;
}

export function EnhancedSocialHub({ userId = 'demo-user', initialTab = 'feed' }: SocialHubProps) {
  // Using hash-based navigation instead of hooks to avoid compatibility issues
  const currentHash = window.location.hash.replace('#', '') || 'social-feed';
  const activeTab = currentHash.split('-')[1] || 'feed';

  const stats = {
    onlineUsers: 147,
    activeConversations: 8,
    newNotifications: 12,
    todaysPosts: 34,
    upcomingEvents: 12,
    totalMembers: 3247
  };

  const handleTabChange = (tab: string) => {
    window.location.hash = `social-${tab}`;
    // Simple navigation without page refresh for better mobile UX
  };

  const tabs = [
    {
      id: 'feed',
      name: 'Community Feed',
      icon: TrendingUp,
      badge: stats.todaysPosts,
      description: 'Latest activity from the metal community',
      color: 'from-blue-500 to-purple-500'
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
      id: 'community',
      name: 'Metal Community',
      icon: Users,
      badge: stats.onlineUsers,
      description: 'Connect with metalheads worldwide',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'events',
      name: 'Events Hub',
      icon: Calendar,
      badge: stats.upcomingEvents,
      description: 'Concerts, meetups, and festivals',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Community Feed</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2 bg-black/40 px-3 py-2 rounded-lg border border-green-500/30">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold text-sm">{stats.onlineUsers} online</span>
                </div>
                <div className="flex items-center space-x-2 bg-black/40 px-3 py-2 rounded-lg border border-blue-500/30">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold text-sm">{stats.todaysPosts} posts today</span>
                </div>
              </div>
            </div>
            <ActivityFeed />
          </div>
        );
      case 'messaging':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Secure Messages</h2>
              <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-lg border border-green-500/30">
                <MessageCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-semibold">End-to-End Encrypted</span>
              </div>
            </div>
            <SecureDirectMessaging userId={userId} />
          </div>
        );
      case 'community':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Metal Community</h2>
              <div className="flex items-center space-x-2 bg-black/40 px-3 py-2 rounded-lg border border-red-500/30">
                <Users className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-semibold text-sm">{stats.totalMembers} total members</span>
              </div>
            </div>
            
            {/* Mobile-Optimized Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-black/40 border border-red-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">{stats.onlineUsers}</div>
                <div className="text-gray-400">Online Now</div>
                <div className="h-2 w-2 bg-green-500 rounded-full mx-auto mt-2 animate-pulse"></div>
              </div>
              <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">23</div>
                <div className="text-gray-400">Active Groups</div>
              </div>
              <div className="bg-black/40 border border-blue-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">156</div>
                <div className="text-gray-400">Photos Shared</div>
              </div>
              <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">2.8k</div>
                <div className="text-gray-400">Total Reactions</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Popular Groups */}
              <div className="bg-black/40 border border-red-900/30 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="h-6 w-6 text-red-500" />
                  <h3 className="text-xl font-semibold text-white">Popular Groups</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Metal Heads United', members: 1247, category: 'Discussion', active: true },
                    { name: 'Concert Photography', members: 823, category: 'Creative', active: true },
                    { name: 'Local Scene Network', members: 456, category: 'Networking', active: false },
                    { name: 'Gear & Equipment', members: 634, category: 'Discussion', active: true }
                  ].map((group, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-red-900/20">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${group.active ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <div>
                          <div className="text-white font-medium">{group.name}</div>
                          <div className="text-gray-400 text-sm">{group.category}</div>
                        </div>
                      </div>
                      <div className="text-red-400 font-semibold">{group.members}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-black/40 border border-red-900/30 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  <button className="flex items-center justify-center sm:justify-start space-x-3 w-full bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 text-red-400 py-3 px-4 rounded-lg hover:from-red-600/30 hover:to-red-700/30 transition-all touch-manipulation">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-medium">Start a Poll</span>
                  </button>
                  <button className="flex items-center justify-center sm:justify-start space-x-3 w-full bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 text-yellow-400 py-3 px-4 rounded-lg hover:from-yellow-600/30 hover:to-yellow-700/30 transition-all touch-manipulation">
                    <Camera className="h-5 w-5" />
                    <span className="text-sm font-medium">Share Photo</span>
                  </button>
                  <button className="flex items-center justify-center sm:justify-start space-x-3 w-full bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/30 text-blue-400 py-3 px-4 rounded-lg hover:from-blue-600/30 hover:to-blue-700/30 transition-all touch-manipulation">
                    <Music className="h-5 w-5" />
                    <span className="text-sm font-medium">Recommend Band</span>
                  </button>
                  <button 
                    onClick={() => handleTabChange('events')}
                    className="flex items-center justify-center sm:justify-start space-x-3 w-full bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 text-purple-400 py-3 px-4 rounded-lg hover:from-purple-600/30 hover:to-purple-700/30 transition-all touch-manipulation"
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm font-medium">Find Events</span>
                  </button>
                </div>
              </div>
            </div>
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
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
              >
                Explore Event Discovery
              </button>
            </div>
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
                  className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3 px-3 md:px-6 py-3 md:py-4 border-b-2 transition-all min-w-fit ${
                    isActive
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-transparent text-gray-400 hover:text-red-300 hover:border-red-300/50'
                  }`}
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