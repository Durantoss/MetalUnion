import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LighterRating from "@/components/ui/star-rating";
import ReviewForm from "@/components/forms/review-form";
import { User, ThumbsUp, MessageCircle, Calendar, Search, Filter, X, SlidersHorizontal, Star } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

export default function Reviews() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedReviewer, setSelectedReviewer] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  
  // const { toast } = useToast();

  const { data: allReviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  // Extract unique values for filter options (simplified)
  const filterOptions = {
    reviewers: allReviews ? Array.from(new Set(allReviews.map(review => review.stagename))).sort() : [],
    targets: allReviews ? Array.from(new Set(allReviews.map(review => review.targetName).filter(Boolean))).sort() : []
  };

  // Simplified filtering logic
  let reviews = allReviews || [];
  
  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    reviews = reviews.filter(review => 
      review.title.toLowerCase().includes(query) ||
      review.content.toLowerCase().includes(query) ||
      review.stagename.toLowerCase().includes(query) ||
      (review.targetName && review.targetName.toLowerCase().includes(query)) ||
      review.reviewType.toLowerCase().includes(query)
    );
  }

  // Apply type filter
  if (selectedType !== 'all') {
    reviews = reviews.filter(review => review.reviewType === selectedType);
  }

  // Apply rating filter
  if (selectedRating !== 'all') {
    if (selectedRating === '5') {
      reviews = reviews.filter(review => review.rating === 5);
    } else if (selectedRating === '4+') {
      reviews = reviews.filter(review => review.rating >= 4);
    } else if (selectedRating === '3+') {
      reviews = reviews.filter(review => review.rating >= 3);
    } else if (selectedRating === '2-') {
      reviews = reviews.filter(review => review.rating <= 2);
    }
  }

  // Apply reviewer filter
  if (selectedReviewer !== 'all') {
    reviews = reviews.filter(review => review.stagename === selectedReviewer);
  }

  // Apply date range filters
  if (dateFrom) {
    reviews = reviews.filter(review => review.createdAt && new Date(review.createdAt) >= new Date(dateFrom));
  }
  if (dateTo) {
    reviews = reviews.filter(review => review.createdAt && new Date(review.createdAt) <= new Date(dateTo));
  }

  // Apply sorting
  reviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'date-asc':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case 'rating-desc':
        return b.rating - a.rating;
      case 'rating-asc':
        return a.rating - b.rating;
      case 'likes-desc':
        return (b.likes || 0) - (a.likes || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'reviewer':
        return a.stagename.localeCompare(b.stagename);
      case 'target':
        return (a.targetName || '').localeCompare(b.targetName || '');
      default:
        return 0;
    }
  });
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedRating('all');
    setSelectedReviewer('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('date-desc');
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || selectedType !== 'all' || selectedRating !== 'all' || 
    selectedReviewer !== 'all' || dateFrom || dateTo || sortBy !== 'date-desc';

  const likeMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to like review');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      console.log("Review liked successfully");
    },
    onError: () => {
      console.error("Failed to like review");
    },
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getReviewTypeColor = (type: string) => {
    switch (type) {
      case 'album': return 'bg-blue-600';
      case 'concert': return 'bg-green-600';
      case 'band': return 'bg-metal-red';
      default: return 'bg-gray-600';
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider mb-4">Reviews</h1>
        <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
          Share your thoughts on bands, albums, and concerts. Help fellow metalheads discover the best music.
        </p>
      </div>

      {/* Search and Quick Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search reviews by title, content, reviewer, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-card-dark border-metal-gray text-white placeholder:text-gray-400"
            data-testid="input-search-reviews"
          />
        </div>

        {/* Quick Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              size="sm"
              className="bg-metal-red hover:bg-metal-red-bright text-white font-bold uppercase tracking-wider"
              data-testid="button-write-review"
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </Button>

            {/* Quick Type Filters */}
            {[{value: 'all', label: 'All Reviews'}, {value: 'album', label: 'Albums'}, {value: 'concert', label: 'Concerts'}, {value: 'band', label: 'Bands'}].map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className={`text-xs font-bold uppercase tracking-wider ${
                  selectedType === type.value 
                    ? "bg-metal-red hover:bg-metal-red-bright text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
                data-testid={`button-filter-${type.value}`}
              >
                {type.label}
              </Button>
            ))}

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className={`border-metal-gray text-white hover:bg-metal-red/20 ${hasActiveFilters ? 'bg-metal-red/20 border-metal-red' : ''}`}
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              More Filters {hasActiveFilters && `(${[searchQuery, selectedType !== 'all', selectedRating !== 'all', selectedReviewer !== 'all', dateFrom, dateTo, sortBy !== 'date-desc'].filter(Boolean).length})`}
            </Button>

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-metal-red hover:text-metal-red-bright hover:bg-metal-red/10"
                data-testid="button-clear-filters"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="bg-card-dark border-metal-gray mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-metal-red" />
              Advanced Filters
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Rating
                </label>
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-rating">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-metal-gray">
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                    <SelectItem value="4+">⭐⭐⭐⭐+ (4+ stars)</SelectItem>
                    <SelectItem value="3+">⭐⭐⭐+ (3+ stars)</SelectItem>
                    <SelectItem value="2-">⭐⭐- (2 stars or less)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reviewer Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Reviewer
                </label>
                <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
                  <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-reviewer">
                    <SelectValue placeholder="All Reviewers" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-metal-gray">
                    <SelectItem value="all">All Reviewers</SelectItem>
                    {filterOptions.reviewers.map((reviewer) => (
                      <SelectItem key={reviewer} value={reviewer}>{reviewer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  From Date
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-card-dark border-metal-gray text-white"
                  data-testid="input-date-from"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  To Date
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-card-dark border-metal-gray text-white"
                  data-testid="input-date-to"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-metal-gray">
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="rating-desc">Highest Rated</SelectItem>
                    <SelectItem value="rating-asc">Lowest Rated</SelectItem>
                    <SelectItem value="likes-desc">Most Liked</SelectItem>
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="reviewer">Reviewer (A-Z)</SelectItem>
                    <SelectItem value="target">Target (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-metal-gray/30">
              <p className="text-sm text-gray-400">
                Showing <span className="font-bold text-white">{reviews.length}</span> of <span className="font-bold text-white">{allReviews.length}</span> reviews
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="link"
                    className="ml-2 text-metal-red hover:text-metal-red-bright p-0 h-auto"
                    data-testid="link-clear-filters"
                  >
                    Clear all filters
                  </Button>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <Card className="bg-card-dark border-metal-gray mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Write a Review</h2>
            <ReviewForm onSuccess={() => setShowReviewForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-card-dark border-metal-gray">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full bg-metal-gray" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/3 bg-metal-gray" />
                      <Skeleton className="h-4 w-20 bg-metal-gray" />
                    </div>
                    <Skeleton className="h-6 w-2/3 bg-metal-gray" />
                    <Skeleton className="h-20 w-full bg-metal-gray" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-16 bg-metal-gray" />
                      <Skeleton className="h-4 w-12 bg-metal-gray" />
                      <Skeleton className="h-4 w-12 bg-metal-gray" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-6 sm:p-12 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {hasActiveFilters ? 'No Reviews Match Your Filters' : 'No Reviews Yet'}
            </h2>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms to find more reviews'
                : 'Be the first to share your thoughts on your favorite bands, albums, or concerts!'
              }
            </p>
            <div className="space-y-3">
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-metal-gray text-white hover:bg-metal-red/20 mr-4"
                  data-testid="button-clear-filters-empty"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Button 
                onClick={() => setShowReviewForm(true)}
                className="bg-metal-red hover:bg-metal-red-bright text-white w-full sm:w-auto min-h-[48px]"
                data-testid="button-write-first-review"
              >
                Write {hasActiveFilters ? 'a' : 'First'} Review
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Results Summary */}
          <div className="bg-card-dark/50 border border-metal-gray/30 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                Showing <span className="font-bold text-white">{reviews.length}</span> reviews
                {hasActiveFilters && (
                  <span className="ml-2 text-xs bg-metal-red/20 text-metal-red px-2 py-1 rounded">
                    Filtered
                  </span>
                )}
                {selectedType !== 'all' && (
                  <span className="ml-2 text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded capitalize">
                    {selectedType} Reviews
                  </span>
                )}
              </p>
              <div className="text-xs text-gray-500">
                Sorted by: <span className="text-white">
                  {sortBy === 'date-desc' ? 'Newest First' :
                   sortBy === 'date-asc' ? 'Oldest First' :
                   sortBy === 'rating-desc' ? 'Highest Rated' :
                   sortBy === 'rating-asc' ? 'Lowest Rated' :
                   sortBy === 'likes-desc' ? 'Most Liked' :
                   sortBy === 'title' ? 'Title (A-Z)' :
                   sortBy === 'reviewer' ? 'Reviewer (A-Z)' :
                   sortBy === 'target' ? 'Target (A-Z)' : sortBy
                  }
                </span>
              </div>
            </div>
          </div>

          {reviews.map((review) => (
            <Card key={review.id} className="bg-card-dark border-metal-gray hover:border-metal-gray transition-colors" data-testid={`card-review-${review.id}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  
                  {/* User Avatar */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-metal-gray rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    
                    {/* Review Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-white text-sm sm:text-base" data-testid={`text-review-username-${review.id}`}>
                            {review.stagename}
                          </span>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${getReviewTypeColor(review.reviewType)}`}
                            data-testid={`badge-review-type-${review.id}`}
                          >
                            {review.reviewType}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          reviewed <span className="text-metal-red font-bold" data-testid={`text-review-target-${review.id}`}>
                            {review.targetName || 'Unknown'}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <LighterRating rating={review.rating} size="sm" showValue />
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span data-testid={`text-review-date-${review.id}`}>
                            {review.createdAt ? formatDate(review.createdAt) : 'Just now'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Title */}
                    <h3 className="text-base sm:text-lg font-bold text-white mb-3" data-testid={`text-review-title-${review.id}`}>
                      {review.title}
                    </h3>

                    {/* Review Content */}
                    <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base" data-testid={`text-review-content-${review.id}`}>
                      {review.content}
                    </p>

                    {/* Review Actions */}
                    <div className="flex items-center gap-4 sm:gap-6 text-sm">
                      <button 
                        onClick={() => likeMutation.mutate(review.id)}
                        disabled={likeMutation.isPending}
                        className="flex items-center space-x-1 text-gray-500 hover:text-metal-red transition-colors disabled:opacity-50 min-h-[44px] py-2 sm:py-0 sm:min-h-0"
                        data-testid={`button-like-review-${review.id}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{review.likes || 0}</span>
                        <span className="hidden sm:inline">
                          {(review.likes || 0) === 1 ? 'Like' : 'Likes'}
                        </span>
                      </button>
                      
                      <button 
                        className="flex items-center space-x-1 text-gray-500 hover:text-metal-red transition-colors min-h-[44px] py-2 sm:py-0 sm:min-h-0"
                        data-testid={`button-reply-review-${review.id}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Reply</span>
                      </button>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {reviews.length > 0 && (
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-gray-400 text-xs sm:text-sm">
            Showing <span className="font-bold text-white">{reviews.length}</span> of <span className="font-bold text-white">{allReviews.length}</span> reviews
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="link"
                className="ml-2 text-metal-red hover:text-metal-red-bright p-0 h-auto text-xs"
                data-testid="link-clear-filters-bottom"
              >
                Clear all filters
              </Button>
            )}
          </p>
        </div>
      )}

    </main>
  );
}
