import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MetalLoader } from "@/components/ui/metal-loader";
import LighterRating from "@/components/ui/star-rating";
import { Search } from "lucide-react";
import type { Band } from "@shared/schema";

export default function Bands() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: bands = [], isLoading } = useQuery<Band[]>({
    queryKey: ["/api/bands", searchQuery ? `?search=${searchQuery}` : ""],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-wider mb-6">All Bands</h1>
        
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search bands by name, genre..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-card-dark border-metal-gray text-white placeholder-gray-300 focus:border-metal-red pl-10"
              data-testid="input-band-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
          </div>
          <Button 
            type="submit" 
            className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider"
            data-testid="button-search-bands"
          >
            Search
          </Button>
        </form>

        {searchQuery && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-300">
              {isLoading ? "Searching..." : `Found ${bands.length} bands matching "${searchQuery}"`}
            </p>
            <Button 
              variant="ghost" 
              onClick={() => {
                setSearchQuery("");
                setSearchInput("");
              }}
              className="text-metal-red hover:text-metal-red-bright"
              data-testid="button-clear-search"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <MetalLoader size="lg" variant="flame" text="SUMMONING BANDS..." />
        </div>
      ) : bands.length === 0 ? (
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <MetalLoader size="md" variant="skull" />
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-wider text-gray-300">
              {searchQuery ? "NO BANDS FOUND" : "THE VAULT IS EMPTY"}
            </h2>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? "The underground remains silent... try different search terms."
                : "Be the first to unleash bands into our realm!"
              }
            </p>
          {searchQuery && (
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSearchInput("");
              }}
              className="bg-metal-red hover:bg-metal-red-bright"
              data-testid="button-browse-all"
            >
              Browse All Bands
            </Button>
          )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bands.map((band) => (
            <Card key={band.id} className="bg-card-dark border-metal-gray hover:border-metal-red transition-colors group" data-testid={`card-band-${band.id}`}>
              {band.imageUrl && (
                <img 
                  src={band.imageUrl} 
                  alt={`${band.name} live performance`} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-black mb-2" data-testid={`text-band-name-${band.id}`}>{band.name}</h3>
                <p className="text-gray-200 font-medium mb-3" data-testid={`text-band-genre-${band.id}`}>{band.genre}</p>
                <div className="flex items-center mb-3">
                  <LighterRating rating={5} size="sm" />
                  <span className="text-sm text-gray-300 ml-2">(Reviews coming soon)</span>
                </div>
                <p className="text-sm text-gray-200 mb-4 line-clamp-3" data-testid={`text-band-description-${band.id}`}>
                  {band.description}
                </p>
                <div className="flex justify-between items-center">
                  <Link href={`/bands/${band.id}`} data-testid={`button-view-profile-${band.id}`}>
                    <Button className="bg-metal-red hover:bg-metal-red-bright text-sm font-bold uppercase tracking-wider">
                      View Profile
                    </Button>
                  </Link>
                  {band.founded && (
                    <span className="text-xs text-gray-500 uppercase tracking-wider" data-testid={`text-band-founded-${band.id}`}>
                      Since {band.founded}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
