import React, { useState } from 'react';
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Hash, 
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommunityFeed } from './CommunityFeed';
import { ActivityFeed } from './ActivityFeed';

interface CommunityHubProps {
  stats: {
    onlineUsers: number;
    todaysPosts: number;
    totalMembers: number;
  };
}

export function CommunityHub({ stats }: CommunityHubProps) {
  const [activeSection, setActiveSection] = useState('feed');

  const sections = [
    {
      id: 'feed',
      name: 'Metal Feed',
      icon: TrendingUp,
      description: 'Latest posts and discussions',
      count: stats.todaysPosts
    },
    {
      id: 'pit',
      name: 'Discussions',
      icon: Hash,
      description: 'Metal discussions and debates',
      count: 45
    },
    {
      id: 'activity',
      name: 'Activity Stream',
      icon: Users,
      description: 'Real-time community activity',
      count: stats.onlineUsers
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handlePanelClick = (sectionId: string, event: React.MouseEvent) => {
    // Only trigger if clicking the panel itself, not buttons inside it
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    setActiveSection(sectionId);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'feed':
        return <CommunityFeed />;
      case 'pit':
        return (
          <div className="space-y-6">
            <div className="bg-black/40 border border-red-900/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">The Pit - Metal Discussions</h3>
              <p className="text-gray-300 mb-4">
                Welcome to The Pit! This is where the metal community comes together for heated discussions, 
                band debates, and sharing the latest metal news.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-lg p-4 border border-red-800/30">
                  <h4 className="text-red-400 font-semibold mb-2">🔥 Hot Topics</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Best metal album of 2024?</li>
                    <li>• Metallica vs. Iron Maiden debate</li>
                    <li>• New underground bands to watch</li>
                  </ul>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-yellow-800/30">
                  <h4 className="text-yellow-400 font-semibold mb-2">⚡ Latest News</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Tool announces new tour dates</li>
                    <li>• Obituary releases new single</li>
                    <li>• Wacken 2025 lineup revealed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      case 'activity':
        return <ActivityFeed />;
      default:
        return <CommunityFeed />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl md:text-3xl font-bold text-white">The Pit</h2>
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

      {/* Section Panels - Tappable but with visible buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <div
              key={section.id}
              onClick={(e) => handlePanelClick(section.id, e)}
              className={`
                bg-black/40 border rounded-lg p-6 cursor-pointer transition-all duration-200 transform hover:scale-105
                ${isActive 
                  ? 'border-red-500/50 bg-red-900/20 shadow-lg shadow-red-500/20' 
                  : 'border-red-900/30 hover:border-red-600/50 hover:bg-red-900/10'
                }
              `}
              data-testid={`panel-${section.id}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-3 rounded-lg transition-colors
                    ${isActive ? 'bg-red-600/30' : 'bg-black/40'}
                  `}>
                    <Icon className={`
                      w-6 h-6 transition-colors
                      ${isActive ? 'text-red-400' : 'text-gray-400'}
                    `} />
                  </div>
                  <div>
                    <h3 className={`
                      text-lg font-semibold transition-colors
                      ${isActive ? 'text-red-400' : 'text-white'}
                    `}>
                      {section.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{section.description}</p>
                  </div>
                </div>
                
                {/* Count Badge */}
                {section.count && (
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-semibold transition-colors
                    ${isActive 
                      ? 'bg-red-600/30 text-red-400 border border-red-500/30' 
                      : 'bg-black/40 text-gray-400 border border-gray-600/30'
                    }
                  `}>
                    {section.count}
                  </div>
                )}
              </div>

              {/* Action Button - Stops propagation to prevent panel click */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSectionClick(section.id);
                  }}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                      : 'border-red-600/50 text-red-400 hover:bg-red-600/10 hover:border-red-500'
                    }
                  `}
                  data-testid={`button-${section.id}`}
                >
                  {isActive ? 'Active' : 'Enter'}
                </Button>

                {section.id === 'feed' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle create post action
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white ml-2"
                    data-testid="button-create-post-quick"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Visual indicator for active state */}
              {isActive && (
                <div className="mt-4 w-full h-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-black/40 border border-red-900/30 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="border-red-600/50 text-red-400 hover:bg-red-600/10"
            data-testid="button-search"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
            data-testid="button-filter"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>Active in:</span>
          <span className="text-red-400 font-semibold">{sections.find(s => s.id === activeSection)?.name}</span>
        </div>
      </div>

      {/* Section Content */}
      <div className="transition-all duration-300 ease-in-out">
        {renderSectionContent()}
      </div>
    </div>
  );
}