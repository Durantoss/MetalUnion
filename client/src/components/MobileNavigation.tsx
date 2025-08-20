import React, { useState, useEffect } from 'react';
import { Menu, X, Search, User, Settings, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TouchButton, MobileSearch } from '@/components/MobileOptimized';
import { useMobileOptimizations } from '@/lib/mobile-optimizations';

interface MobileNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onSearch?: (query: string) => void;
}

/**
 * Mobile-optimized navigation with touch-friendly interactions
 */
export function MobileNavigation({ 
  currentSection, 
  onSectionChange, 
  onSearch 
}: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isMobile, config } = useMobileOptimizations();

  // Close menu on section change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [currentSection]);

  const navigationItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'bands', label: 'Bands', icon: Search },
    { id: 'tours', label: 'Tours', icon: MessageCircle },
    { id: 'social', label: 'Community', icon: User },
    { id: 'messaging', label: 'Messages', icon: MessageCircle },
  ];

  const handleNavigation = (section: string) => {
    onSectionChange(section);
    setIsMenuOpen(false);
  };

  const handleSearch = (query: string) => {
    onSearch?.(query);
  };

  return (
    <>
      {/* Mobile Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-500/20"
        style={{
          paddingTop: 'var(--safe-area-inset-top, 0)',
          paddingLeft: 'var(--safe-area-inset-left, 0)',
          paddingRight: 'var(--safe-area-inset-right, 0)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-14">
          {/* Menu Button */}
          <TouchButton
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white hover:text-red-400 transition-colors"
            data-testid="button-menu-toggle"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </TouchButton>

          {/* Logo */}
          <div className="flex-1 text-center">
            <TouchButton
              onClick={() => handleNavigation('landing')}
              className="text-xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent"
              data-testid="button-logo"
            >
              MOSHUNION
            </TouchButton>
          </div>

          {/* Search Button */}
          <TouchButton
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-white hover:text-red-400 transition-colors"
            data-testid="button-search-toggle"
          >
            <Search className="w-6 h-6" />
          </TouchButton>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="px-4 pb-4 border-t border-red-500/20 animate-in slide-in-from-top duration-200">
            <MobileSearch
              onSearch={handleSearch}
              placeholder="Search bands, tours, reviews..."
            />
          </div>
        )}
      </header>

      {/* Slide-out Navigation Menu */}
      <div 
        className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          paddingTop: 'calc(var(--safe-area-inset-top, 0) + 3.5rem)',
          paddingBottom: 'var(--safe-area-inset-bottom, 0)',
        }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Content */}
        <nav 
          className="relative w-80 max-w-sm h-full bg-gradient-to-br from-black via-red-950/20 to-black border-r border-red-500/30 overflow-y-auto"
          style={{
            paddingLeft: 'var(--safe-area-inset-left, 0)',
          }}
        >
          {/* User Profile Section */}
          <div className="p-6 border-b border-red-500/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Metal Fan</p>
                <p className="text-gray-400 text-sm">Demo User</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="py-4">
            {navigationItems.map((item) => {
              const isActive = currentSection === item.id;
              const Icon = item.icon;

              return (
                <TouchButton
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full flex items-center space-x-4 px-6 py-4 text-left transition-colors
                    ${isActive 
                      ? 'bg-red-600/20 text-red-400 border-r-2 border-red-500' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }
                  `}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </TouchButton>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="mt-auto border-t border-red-500/20 p-4">
            <TouchButton
              onClick={() => {/* Settings logic */}}
              className="w-full flex items-center space-x-4 px-2 py-3 text-gray-400 hover:text-white transition-colors"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </TouchButton>
          </div>
        </nav>
      </div>

      {/* Bottom Tab Bar (Alternative for small screens) */}
      {isMobile && config.viewportHeight < 600 && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-red-500/20"
          style={{
            paddingBottom: 'var(--safe-area-inset-bottom, 0)',
            paddingLeft: 'var(--safe-area-inset-left, 0)',
            paddingRight: 'var(--safe-area-inset-right, 0)',
          }}
        >
          <div className="flex">
            {navigationItems.slice(0, 4).map((item) => {
              const isActive = currentSection === item.id;
              const Icon = item.icon;

              return (
                <TouchButton
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors
                    ${isActive ? 'text-red-400' : 'text-gray-400 hover:text-white'}
                  `}
                  data-testid={`tab-${item.id}`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </TouchButton>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}