import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was launched from homescreen
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Hide for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Show manual install guide if PWA prompt not available but not installed
  const showManualGuide = !isInstalled && !deferredPrompt && !sessionStorage.getItem('installPromptDismissed');
  
  // Debug logging
  console.log('Install Prompt Debug:', {
    isInstalled,
    showPrompt,
    deferredPrompt: !!deferredPrompt,
    showManualGuide,
    dismissed: !!sessionStorage.getItem('installPromptDismissed'),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches
  });
  
  // Don't show anything if already installed or dismissed
  if (isInstalled || sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }
  
  // TEMPORARY: Force show for testing
  // if (!showPrompt && !showManualGuide) {
  //   return null;
  // }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-[9999] bg-red-900 border-4 border-yellow-400 shadow-2xl md:left-auto md:right-4 md:max-w-sm" style={{zIndex: 99999}}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-metal-red rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white mb-1">
              {deferredPrompt ? 'Install MetalHub' : 'Add to Homescreen'}
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              {deferredPrompt 
                ? 'Add MetalHub to your homescreen for quick access to metal tours, reviews, and photos!'
                : 'Install MetalHub as an app! Chrome/Edge: Menu → "Add to Home screen" | Safari: Share → "Add to Home Screen"'
              }
            </p>
            
            <div className="flex items-center space-x-2">
              {deferredPrompt ? (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="bg-metal-red hover:bg-metal-red-bright text-white text-xs"
                  data-testid="button-install-app"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Install
                </Button>
              ) : (
                <Button
                  onClick={() => window.open('/', '_blank')}
                  size="sm"
                  className="bg-metal-red hover:bg-metal-red-bright text-white text-xs"
                  data-testid="button-manual-install"
                >
                  <Smartphone className="w-3 h-3 mr-1" />
                  Guide
                </Button>
              )}
              
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white text-xs p-1"
                data-testid="button-dismiss-install"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}