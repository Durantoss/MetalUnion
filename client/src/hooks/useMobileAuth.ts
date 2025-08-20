import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Mobile-specific authentication hook that bypasses backend authentication issues
export function useMobileAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  };

  const isDeployedEnvironment = () => {
    return window.location.hostname.includes('.replit.app') ||
           window.location.hostname.includes('band-blaze-durantoss');
  };

  const shouldUseMobileAuth = () => {
    return false; // Disabled - use real authentication
  };

  const mobileLogin = async (stagename: string, safeword: string) => {
    // Mobile auth bypass disabled - always use real authentication
    return false;

    setIsLoading(true);
    console.log('Mobile Auth: Activating mobile-specific authentication bypass');

    try {
      // Simulate network delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Create mobile demo user
      const mobileUser = {
        id: 'mobile-user-' + Date.now(),
        email: 'mobile@moshunion.com',
        stagename: stagename || 'Mobile User',
        isAdmin: stagename.toLowerCase() === 'durantoss',
        permissions: stagename.toLowerCase() === 'durantoss' ? { full_admin: true } : {},
        theme: 'dark',
        role: stagename.toLowerCase() === 'durantoss' ? 'admin' : 'user',
        isMobile: true
      };

      // Set authentication state
      setUser(mobileUser);
      setIsAuthenticated(true);

      // Update query cache
      queryClient.setQueryData(['/api/auth/user'], mobileUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('moshunion_mobile_user', JSON.stringify(mobileUser));
      localStorage.setItem('moshunion_mobile_auth', 'true');

      console.log('Mobile Auth: Successfully authenticated mobile user:', mobileUser);
      return true;

    } catch (error) {
      console.error('Mobile Auth: Error during mobile authentication:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const mobileLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('moshunion_mobile_user');
    localStorage.removeItem('moshunion_mobile_auth');
    queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
    console.log('Mobile Auth: User logged out');
  };

  const checkMobileAuth = () => {
    // Mobile auth disabled - clear any stored demo data
    const storedAuth = localStorage.getItem('moshunion_mobile_auth');
    const storedUser = localStorage.getItem('moshunion_mobile_user');

    if (storedAuth || storedUser) {
      console.log('Mobile Auth: Clearing stored demo authentication data');
      localStorage.removeItem('moshunion_mobile_auth');
      localStorage.removeItem('moshunion_mobile_user');
      queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
    }
  };

  // Check for stored mobile auth on mount
  useEffect(() => {
    checkMobileAuth();
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    isMobile: shouldUseMobileAuth(),
    mobileLogin,
    mobileLogout,
    checkMobileAuth
  };
}