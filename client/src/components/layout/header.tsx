import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Search, Upload, LogIn, LogOut, User, Flame, Skull, Menu, X } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/bands?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-metal-red shadow-lg shadow-metal-red/20 sticky top-0 z-50">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="link-home">
                <div className="flex items-center space-x-2 group px-4 py-2 border border-transparent hover:border-metal-red/50 hover:bg-metal-red/10 transition-all duration-300 rounded">
                  <Skull className="w-8 h-8 text-metal-red group-hover:text-white transition-all duration-300 group-hover:animate-pulse" />
                  <h1 className="text-3xl font-black text-metal-red tracking-wider group-hover:text-white transition-all duration-300 transform group-hover:scale-105 drop-shadow-lg">
                    METAL<span className="text-white group-hover:text-metal-red">HUB</span>
                  </h1>
                  <Flame className="w-8 h-8 text-metal-red group-hover:text-white transition-all duration-300 group-hover:animate-pulse" />
                </div>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-2">
                <Link href="/bands" data-testid="link-bands">
                  <span className={`px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 transform hover:scale-105 relative group ${
                    isActive("/bands") 
                      ? "text-metal-red bg-metal-red/10 border border-metal-red shadow-lg shadow-metal-red/25" 
                      : "text-gray-300 hover:text-white hover:bg-metal-red/20 hover:border-metal-red hover:shadow-md hover:shadow-metal-red/30 border border-transparent"
                  }`}>
                    BANDS
                    <div className="absolute inset-0 bg-gradient-to-r from-metal-red/0 via-metal-red/10 to-metal-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </span>
                </Link>
                <Link href="/reviews" data-testid="link-reviews">
                  <span className={`px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 transform hover:scale-105 relative group ${
                    isActive("/reviews") 
                      ? "text-metal-red bg-metal-red/10 border border-metal-red shadow-lg shadow-metal-red/25" 
                      : "text-gray-300 hover:text-white hover:bg-metal-red/20 hover:border-metal-red hover:shadow-md hover:shadow-metal-red/30 border border-transparent"
                  }`}>
                    REVIEWS
                    <div className="absolute inset-0 bg-gradient-to-r from-metal-red/0 via-metal-red/10 to-metal-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </span>
                </Link>
                <Link href="/tours" data-testid="link-tours">
                  <span className={`px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 transform hover:scale-105 relative group ${
                    isActive("/tours") 
                      ? "text-metal-red bg-metal-red/10 border border-metal-red shadow-lg shadow-metal-red/25" 
                      : "text-gray-300 hover:text-white hover:bg-metal-red/20 hover:border-metal-red hover:shadow-md hover:shadow-metal-red/30 border border-transparent"
                  }`}>
                    TOURS
                    <div className="absolute inset-0 bg-gradient-to-r from-metal-red/0 via-metal-red/10 to-metal-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </span>
                </Link>
                <Link href="/photos" data-testid="link-photos">
                  <span className={`px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 transform hover:scale-105 relative group ${
                    isActive("/photos") 
                      ? "text-metal-red bg-metal-red/10 border border-metal-red shadow-lg shadow-metal-red/25" 
                      : "text-gray-300 hover:text-white hover:bg-metal-red/20 hover:border-metal-red hover:shadow-md hover:shadow-metal-red/30 border border-transparent"
                  }`}>
                    PHOTOS
                    <div className="absolute inset-0 bg-gradient-to-r from-metal-red/0 via-metal-red/10 to-metal-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </span>
                </Link>
                <Link href="/messages" data-testid="link-messages">
                  <span className={`px-4 py-3 text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 transform hover:scale-105 relative group ${
                    isActive("/messages") 
                      ? "text-metal-red bg-metal-red/10 border border-metal-red shadow-lg shadow-metal-red/25" 
                      : "text-gray-300 hover:text-white hover:bg-metal-red/20 hover:border-metal-red hover:shadow-md hover:shadow-metal-red/30 border border-transparent"
                  }`}>
                    THE PIT
                    <div className="absolute inset-0 bg-gradient-to-r from-metal-red/0 via-metal-red/10 to-metal-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-metal-red transition-colors p-2"
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <form onSubmit={handleSearch} className="relative hidden md:block group">
              <Input
                type="text"
                placeholder="SEARCH THE DEPTHS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black border-2 border-metal-gray text-white focus:border-metal-red focus:shadow-lg focus:shadow-metal-red/30 w-72 pl-12 h-12 font-black uppercase tracking-wider transition-all duration-300 group-hover:border-metal-red/50 shadow-inner"
                data-testid="input-search"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-metal-red w-5 h-5 group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-metal-red/0 via-metal-red/5 to-metal-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded"></div>
            </form>
            
            {isAuthenticated && (
              <Link href="/photos" data-testid="button-upload">
                <Button className="bg-gradient-to-r from-metal-red to-red-700 hover:from-red-700 hover:to-metal-red text-white font-black uppercase tracking-[0.15em] px-6 py-3 shadow-lg shadow-metal-red/30 hover:shadow-xl hover:shadow-metal-red/50 transition-all duration-300 transform hover:scale-105 border border-metal-red/50">
                  <Upload className="w-5 h-5 mr-2" />
                  UPLOAD
                </Button>
              </Link>
            )}
            
            {!isLoading && (
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <a href="/profile" className="flex items-center space-x-3 text-gray-300 hover:text-metal-red transition-all duration-300 group px-4 py-2 border border-transparent hover:border-metal-red/30 hover:bg-metal-red/10 rounded" data-testid="link-profile">
                      <User className="w-5 h-5 group-hover:animate-pulse" />
                      <span className="text-sm font-bold uppercase tracking-wider">
                        {(user as any)?.stagename || (user as any)?.firstName || (user as any)?.email || 'MEMBER'}
                      </span>
                    </a>
                    <a href="/api/logout" data-testid="button-logout">
                      <Button className="bg-gradient-to-r from-metal-red to-red-700 hover:from-red-700 hover:to-metal-red text-white font-black uppercase tracking-[0.15em] px-4 py-3 shadow-lg shadow-metal-red/30 hover:shadow-xl hover:shadow-metal-red/50 transition-all duration-300 transform hover:scale-105 border border-metal-red/50">
                        <LogOut className="w-5 h-5 mr-2" />
                        LOGOUT
                      </Button>
                    </a>
                  </>
                ) : (
                  <a href="/api/login" data-testid="button-login">
                    <Button className="bg-gradient-to-r from-metal-red to-red-700 hover:from-red-700 hover:to-metal-red text-white font-black uppercase tracking-[0.15em] px-6 py-3 shadow-lg shadow-metal-red/30 hover:shadow-xl hover:shadow-metal-red/50 transition-all duration-300 transform hover:scale-105 border border-metal-red/50">
                      <LogIn className="w-5 h-5 mr-2" />
                      ENTER
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-metal-red z-50">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-6">
                <Input
                  type="text"
                  placeholder="SEARCH THE DEPTHS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black border-2 border-metal-gray text-white focus:border-metal-red w-full pl-12 h-12 font-black uppercase tracking-wider"
                  data-testid="input-mobile-search"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-metal-red w-5 h-5" />
              </form>
              
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link href="/bands" data-testid="link-mobile-bands" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-4 py-4 text-lg font-black uppercase tracking-[0.2em] transition-all duration-300 border border-transparent hover:border-metal-red hover:bg-metal-red/20 ${
                    isActive("/bands") ? "text-metal-red bg-metal-red/10 border-metal-red" : "text-gray-300 hover:text-white"
                  }`}>
                    BANDS
                  </div>
                </Link>
                <Link href="/reviews" data-testid="link-mobile-reviews" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-4 py-4 text-lg font-black uppercase tracking-[0.2em] transition-all duration-300 border border-transparent hover:border-metal-red hover:bg-metal-red/20 ${
                    isActive("/reviews") ? "text-metal-red bg-metal-red/10 border-metal-red" : "text-gray-300 hover:text-white"
                  }`}>
                    REVIEWS
                  </div>
                </Link>
                <Link href="/tours" data-testid="link-mobile-tours" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-4 py-4 text-lg font-black uppercase tracking-[0.2em] transition-all duration-300 border border-transparent hover:border-metal-red hover:bg-metal-red/20 ${
                    isActive("/tours") ? "text-metal-red bg-metal-red/10 border-metal-red" : "text-gray-300 hover:text-white"
                  }`}>
                    TOURS
                  </div>
                </Link>
                <Link href="/photos" data-testid="link-mobile-photos" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-4 py-4 text-lg font-black uppercase tracking-[0.2em] transition-all duration-300 border border-transparent hover:border-metal-red hover:bg-metal-red/20 ${
                    isActive("/photos") ? "text-metal-red bg-metal-red/10 border-metal-red" : "text-gray-300 hover:text-white"
                  }`}>
                    PHOTOS
                  </div>
                </Link>
                <Link href="/messages" data-testid="link-mobile-messages" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-4 py-4 text-lg font-black uppercase tracking-[0.2em] transition-all duration-300 border border-transparent hover:border-metal-red hover:bg-metal-red/20 ${
                    isActive("/messages") ? "text-metal-red bg-metal-red/10 border-metal-red" : "text-gray-300 hover:text-white"
                  }`}>
                    THE PIT
                  </div>
                </Link>
              </div>
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-metal-gray space-y-3">
                {isAuthenticated ? (
                  <>
                    <a href="/profile" className="flex items-center space-x-3 text-gray-300 hover:text-metal-red transition-all duration-300 px-4 py-3 border border-transparent hover:border-metal-red/30 hover:bg-metal-red/10" data-testid="link-mobile-profile" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="w-5 h-5" />
                      <span className="text-lg font-bold uppercase tracking-wider">
                        {(user as any)?.stagename || (user as any)?.firstName || (user as any)?.email || 'MEMBER'}
                      </span>
                    </a>
                    <Link href="/photos" data-testid="button-mobile-upload" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-metal-red to-red-700 hover:from-red-700 hover:to-metal-red text-white font-black uppercase tracking-[0.15em] py-4 shadow-lg shadow-metal-red/30">
                        <Upload className="w-5 h-5 mr-2" />
                        UPLOAD PHOTO
                      </Button>
                    </Link>
                    <a href="/api/logout" data-testid="button-mobile-logout" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-metal-red to-red-700 hover:from-red-700 hover:to-metal-red text-white font-black uppercase tracking-[0.15em] py-4 shadow-lg shadow-metal-red/30">
                        <LogOut className="w-5 h-5 mr-2" />
                        LOGOUT
                      </Button>
                    </a>
                  </>
                ) : (
                  <a href="/api/login" data-testid="button-mobile-login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-metal-red to-red-700 hover:from-red-700 hover:to-metal-red text-white font-black uppercase tracking-[0.15em] py-4 shadow-lg shadow-metal-red/30">
                      <LogIn className="w-5 h-5 mr-2" />
                      ENTER THE PIT
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
