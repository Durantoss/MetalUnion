import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Menu, X, ChevronDown, Filter, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface MobileOptimizedProps {
  children?: React.ReactNode;
}

/**
 * Mobile-optimized container with touch-friendly interactions
 */
export function MobileOptimized({ children }: MobileOptimizedProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Pull-to-refresh functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && touchStartY > 0) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - touchStartY);
      setPullDistance(Math.min(distance, 100));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 50) {
      setIsRefreshing(true);
      // Trigger refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    setTouchStartY(0);
    setPullDistance(0);
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-black via-red-950/20 to-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 flex justify-center items-center z-50 bg-red-600/90 backdrop-blur transition-transform duration-300"
          style={{ 
            height: `${Math.min(pullDistance, 60)}px`,
            transform: `translateY(${Math.max(0, pullDistance - 60)}px)`
          }}
        >
          <div className="text-white text-sm font-medium">
            {pullDistance > 50 ? '↓ Release to refresh' : '↓ Pull to refresh'}
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white px-4 py-2 text-sm z-50 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          You're offline - some features may be limited
        </div>
      )}

      {/* PWA install prompt */}
      {installPrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">Install MoshUnion</p>
              <p className="text-sm opacity-90">Add to home screen for better experience</p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInstallPrompt(null)}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Later
              </Button>
              <Button
                size="sm"
                onClick={handleInstallApp}
                className="bg-white text-red-600 hover:bg-gray-100"
              >
                Install
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="pb-safe-area-bottom">
        {isRefreshing ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-white">Refreshing...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/**
 * Mobile-friendly touch button component
 */
export function TouchButton({
  children,
  onClick,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <button
      className={`
        transform transition-transform duration-150 active:scale-95
        ${isPressed ? 'scale-95' : ''}
        min-h-[44px] min-w-[44px] touch-manipulation
        ${className}
      `}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Mobile-optimized search component with voice search
 */
export function MobileSearch({
  onSearch,
  placeholder = 'Search bands, tours...',
}: {
  onSearch?: (query: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onSearch?.(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onSearch]);

  const handleVoiceSearch = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-16 h-12 text-base bg-black/40 border-red-500/20 focus:border-red-500 text-white placeholder:text-gray-400"
          data-testid="input-mobile-search"
        />
        {recognitionRef.current && (
          <TouchButton
            onClick={handleVoiceSearch}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
              isListening ? 'bg-red-600' : 'bg-gray-700'
            }`}
            data-testid="button-voice-search"
          >
            <div className={`w-4 h-4 rounded-full border-2 ${
              isListening ? 'border-white animate-pulse' : 'border-gray-400'
            }`} />
          </TouchButton>
        )}
      </div>
    </div>
  );
}

/**
 * Mobile-optimized card with swipe actions
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    const deltaX = currentX - startX;
    const threshold = 100;
    
    if (deltaX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (deltaX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    
    setIsSwiping(false);
    setCurrentX(0);
    setStartX(0);
  };

  const swipeProgress = isSwiping ? (currentX - startX) : 0;
  
  return (
    <div
      className={`transform transition-transform duration-200 ${className}`}
      style={{
        transform: isSwiping ? `translateX(${Math.max(-150, Math.min(150, swipeProgress))}px)` : 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}
    </div>
  );
}
