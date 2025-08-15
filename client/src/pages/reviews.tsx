import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import LighterRating from "@/components/ui/star-rating";
import ReviewForm from "@/components/forms/review-form";
import { User, ThumbsUp, MessageCircle, Calendar } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

export default function Reviews() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { toast } = useToast();

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

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
      toast({
        title: "Review liked!",
        description: "Thanks for your feedback.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like review. Please try again.",
        variant: "destructive",
      });
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
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-wider mb-4">Reviews</h1>
        <p className="text-gray-400 mb-6">
          Share your thoughts on bands, albums, and concerts. Help fellow metalheads discover the best music.
        </p>
        
        <Button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider"
          data-testid="button-write-review"
        >
          {showReviewForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <Card className="bg-card-dark border-metal-gray mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-black mb-6">Write a Review</h2>
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
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">No Reviews Yet</h2>
            <p className="text-gray-400 mb-6">
              Be the first to share your thoughts on your favorite bands, albums, or concerts!
            </p>
            <Button 
              onClick={() => setShowReviewForm(true)}
              className="bg-metal-red hover:bg-metal-red-bright"
              data-testid="button-write-first-review"
            >
              Write First Review
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-card-dark border-metal-gray hover:border-metal-gray transition-colors" data-testid={`card-review-${review.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-metal-gray rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-gray-400 w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-white" data-testid={`text-review-username-${review.id}`}>
                            {review.username}
                          </span>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${getReviewTypeColor(review.reviewType)}`}
                            data-testid={`badge-review-type-${review.id}`}
                          >
                            {review.reviewType}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          reviewed <span className="text-metal-red font-bold" data-testid={`text-review-target-${review.id}`}>
                            {review.targetName || 'Unknown'}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
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
                    <h3 className="text-lg font-bold text-white mb-3" data-testid={`text-review-title-${review.id}`}>
                      {review.title}
                    </h3>

                    {/* Review Content */}
                    <p className="text-gray-300 leading-relaxed mb-4" data-testid={`text-review-content-${review.id}`}>
                      {review.content}
                    </p>

                    {/* Review Actions */}
                    <div className="flex items-center space-x-6 text-sm">
                      <button 
                        onClick={() => likeMutation.mutate(review.id)}
                        disabled={likeMutation.isPending}
                        className="flex items-center space-x-1 text-gray-500 hover:text-metal-red transition-colors disabled:opacity-50"
                        data-testid={`button-like-review-${review.id}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{review.likes || 0}</span>
                        <span className="hidden sm:inline">
                          {(review.likes || 0) === 1 ? 'Like' : 'Likes'}
                        </span>
                      </button>
                      
                      <button 
                        className="flex items-center space-x-1 text-gray-500 hover:text-metal-red transition-colors"
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
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Showing {reviews.length} reviews
          </p>
        </div>
      )}

    </main>
  );
}
