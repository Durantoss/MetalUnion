import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Search, Upload, LogIn, LogOut, User } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
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
    <header className="bg-black border-b border-metal-gray sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="link-home">
                <h1 className="text-2xl font-black text-metal-red tracking-tight">METALHUB</h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-8">
                <Link href="/bands" data-testid="link-bands">
                  <span className={`px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive("/bands") ? "text-metal-red" : "text-gray-400 hover:text-metal-red"
                  }`}>
                    Bands
                  </span>
                </Link>
                <Link href="/reviews" data-testid="link-reviews">
                  <span className={`px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive("/reviews") ? "text-metal-red" : "text-gray-400 hover:text-metal-red"
                  }`}>
                    Reviews
                  </span>
                </Link>
                <Link href="/tours" data-testid="link-tours">
                  <span className={`px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive("/tours") ? "text-metal-red" : "text-gray-400 hover:text-metal-red"
                  }`}>
                    Tours
                  </span>
                </Link>
                <Link href="/photos" data-testid="link-photos">
                  <span className={`px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive("/photos") ? "text-metal-red" : "text-gray-400 hover:text-metal-red"
                  }`}>
                    Photos
                  </span>
                </Link>
                <Link href="/messages" data-testid="link-messages">
                  <span className={`px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive("/messages") ? "text-metal-red" : "text-gray-400 hover:text-metal-red"
                  }`}>
                    The Pit
                  </span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search bands, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card-dark border-metal-gray text-white placeholder-gray-300 focus:border-metal-red w-64 pl-10"
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
            </form>
            
            {isAuthenticated && (
              <Link href="/photos" data-testid="button-upload">
                <Button className="bg-metal-red hover:bg-metal-red-bright text-white font-bold uppercase tracking-wider">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
              </Link>
            )}
            
            {!isLoading && (
              <div className="flex items-center space-x-2">
                {isAuthenticated ? (
                  <>
                    <a href="/profile" className="flex items-center space-x-2 text-white hover:text-metal-red-bright transition-colors" data-testid="link-profile">
                      <User className="w-4 h-4" />
                      <span className="text-sm">
                        {(user as any)?.stagename || (user as any)?.firstName || (user as any)?.email || 'Member'}
                      </span>
                    </a>
                    <a href="/api/logout" data-testid="button-logout">
                      <Button variant="outline" className="border-metal-gray text-white hover:bg-metal-gray hover:text-white font-semibold">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </a>
                  </>
                ) : (
                  <a href="/api/login" data-testid="button-login">
                    <Button className="bg-metal-red hover:bg-metal-red-bright text-white font-bold uppercase tracking-wider">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
