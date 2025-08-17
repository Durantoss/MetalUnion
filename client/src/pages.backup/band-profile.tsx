import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { useToast } from "@/hooks/use-toast";
import LighterRating from "@/components/ui/star-rating";
import { ArrowLeft, ExternalLink, Calendar, Users, Music, User, ThumbsUp, Instagram, Heart, Share2, MapPin, Clock, Star, Play, Globe, Mail, Youtube, Facebook, Twitter } from "lucide-react";
import type { Band, Review, Photo, Tour } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function BandProfile() {
  const { id } = useParams();
  // // const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: band, isLoading: bandLoading } = useQuery<Band>({
    queryKey: ["/api/bands", id],
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews", `?bandId=${id}`],
  });

  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos", `?bandId=${id}`],
  });

  const { data: tours = [], isLoading: toursLoading } = useQuery<Tour[]>({
    queryKey: ["/api/tours", `?bandId=${id}`],
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const upcomingTours = tours.filter(tour => new Date(tour.date) > new Date());
  const pastTours = tours.filter(tour => new Date(tour.date) <= new Date());

  // Calculate band statistics
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  const totalLikes = reviews.reduce((sum, review) => sum + (review.likes || 0), 0);
  
  // Group photos by category
  const photosByCategory = photos.reduce((acc, photo) => {
    if (!acc[photo.category]) acc[photo.category] = [];
    acc[photo.category].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);
  
  // Follow/unfollow functionality
  const followMutation = useMutation({
    mutationFn: async () => {
      const action = isFollowing ? 'unfollow' : 'follow';
      return apiRequest(`/api/bands/${id}/${action}`, "POST");
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      console.log(`${isFollowing ? 'Unfollowed' : 'Now following'} ${band?.name}`);
    },
    onError: () => {
      console.error("Failed to update follow status");
    }
  });
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${band?.name} - MetalHub`,
          text: `Check out ${band?.name} on MetalHub`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      console.log("Band profile link copied to clipboard");
    }
  };

  if (bandLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Skeleton className="h-6 w-32 bg-metal-gray mb-4" />
          <Skeleton className="h-12 w-64 bg-metal-gray mb-4" />
          <Skeleton className="h-4 w-48 bg-metal-gray" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full bg-metal-gray mb-6" />
            <Skeleton className="h-32 w-full bg-metal-gray" />
          </div>
          <div>
            <Skeleton className="h-48 w-full bg-metal-gray" />
          </div>
        </div>
      </main>
    );
  }

  if (!band) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Band Not Found</h1>
          <p className="text-gray-400 mb-6">The band you're looking for doesn't exist or has been removed.</p>
          <Link href="/bands" data-testid="button-back-to-bands">
            <Button className="bg-metal-red hover:bg-metal-red-bright">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bands
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Back Button */}
      <Link href="/bands" data-testid="link-back-to-bands">
        <Button variant="ghost" className="text-metal-red hover:text-metal-red-bright mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bands
        </Button>
      </Link>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl mb-8">
        {band.imageUrl && (
          <div className="absolute inset-0">
            <img 
              src={band.imageUrl} 
              alt={`${band.name} band photo`}
              className="w-full h-80 object-cover"
              data-testid="img-band-hero"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
          </div>
        )}
        <div className={`relative ${band.imageUrl ? 'p-8 pt-32' : 'p-8 bg-gradient-to-r from-metal-dark to-metal-black'}`}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-wider mb-4 text-white drop-shadow-lg" data-testid="text-band-name">
                {band.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="secondary" className="bg-metal-red text-white font-bold text-lg px-4 py-2" data-testid="text-band-genre">
                  {band.genre}
                </Badge>
                {band.founded && (
                  <span className="text-gray-200 flex items-center text-lg" data-testid="text-band-founded">
                    <Calendar className="w-5 h-5 mr-2" />
                    Founded {band.founded}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center">
                  <LighterRating rating={averageRating} size="lg" showValue />
                  <span className="text-gray-200 ml-3 text-lg">({reviews.length} reviews)</span>
                </div>
                {totalLikes > 0 && (
                  <div className="flex items-center text-gray-200">
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    <span className="text-lg">{totalLikes} likes</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {user && (
                <Button 
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={`${isFollowing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-metal-red hover:bg-metal-red-bright'} text-white font-bold`}
                  data-testid="button-follow-band"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
              <Button 
                onClick={handleShare}
                variant="outline" 
                className="border-gray-400 text-white hover:bg-gray-800"
                data-testid="button-share-band"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Bar */}
      <div className="flex flex-wrap gap-3 mb-8">
        {band.website && (
          <a 
            href={band.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-card-dark border border-metal-gray rounded-lg hover:bg-metal-gray transition-colors"
            data-testid="link-band-website"
          >
            <Globe className="w-4 h-4 mr-2" />
            Official Website
          </a>
        )}
        {band.instagram && (
          <a 
            href={band.instagram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-card-dark border border-metal-gray rounded-lg hover:bg-metal-gray transition-colors"
            data-testid="link-band-instagram"
          >
            <Instagram className="w-4 h-4 mr-2" />
            Instagram
          </a>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card-dark border border-metal-gray">
          <TabsTrigger value="overview" className="data-[state=active]:bg-metal-red data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="music" className="data-[state=active]:bg-metal-red data-[state=active]:text-white">Music</TabsTrigger>
          <TabsTrigger value="photos" className="data-[state=active]:bg-metal-red data-[state=active]:text-white">Photos</TabsTrigger>
          <TabsTrigger value="tours" className="data-[state=active]:bg-metal-red data-[state=active]:text-white">Tours</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* About Section */}
              <Card className="bg-card-dark border-metal-gray">
                <CardHeader>
                  <CardTitle className="text-2xl font-black">About {band.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-100 leading-relaxed text-lg" data-testid="text-band-description">
                    {band.description}
                  </p>
                </CardContent>
              </Card>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card-dark border-metal-gray text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-black text-metal-red">{reviews.length}</div>
                    <div className="text-sm text-gray-400">Reviews</div>
                  </CardContent>
                </Card>
                <Card className="bg-card-dark border-metal-gray text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-black text-metal-red">{averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-400">Rating</div>
                  </CardContent>
                </Card>
                <Card className="bg-card-dark border-metal-gray text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-black text-metal-red">{upcomingTours.length}</div>
                    <div className="text-sm text-gray-400">Upcoming Shows</div>
                  </CardContent>
                </Card>
                <Card className="bg-card-dark border-metal-gray text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-black text-metal-red">{photos.length}</div>
                    <div className="text-sm text-gray-400">Photos</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Reviews */}
              <Card className="bg-card-dark border-metal-gray">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-black">Latest Reviews</CardTitle>
                  <Link href="/reviews" data-testid="link-all-reviews">
                    <Button variant="outline" size="sm" className="border-metal-gray text-white hover:bg-metal-gray">
                      View All ({reviews.length})
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-4">
                          <Skeleton className="w-12 h-12 rounded-full bg-metal-gray" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3 bg-metal-gray" />
                            <Skeleton className="h-16 w-full bg-metal-gray" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-metal-gray rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-200 mb-4">No reviews yet. Be the first to review {band.name}!</p>
                      <Link href="/reviews" data-testid="button-write-first-review">
                        <Button className="bg-metal-red hover:bg-metal-red-bright text-white">
                          Write First Review
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="flex items-start space-x-4 p-4 bg-metal-black/30 rounded-lg" data-testid={`review-${review.id}`}>
                          <div className="w-12 h-12 bg-metal-red rounded-full flex items-center justify-center">
                            <User className="text-white w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-bold text-white" data-testid={`text-review-stagename-${review.id}`}>{review.stagename}</span>
                                <span className="text-gray-400 text-sm ml-2">
                                  • {review.createdAt ? formatDate(review.createdAt) : 'Just now'}
                                </span>
                              </div>
                              <LighterRating rating={review.rating} size="sm" showValue />
                            </div>
                            <h4 className="font-bold mb-2 text-white" data-testid={`text-review-title-${review.id}`}>{review.title}</h4>
                            <p className="text-gray-200 mb-3" data-testid={`text-review-content-${review.id}`}>{review.content}</p>
                            <button className="hover:text-metal-red transition-colors flex items-center text-sm text-gray-400" data-testid={`button-like-review-${review.id}`}>
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              <span>{review.likes || 0} likes</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Band Info */}
              <Card className="bg-card-dark border-metal-gray">
                <CardHeader>
                  <CardTitle className="text-xl font-black">Band Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {band.members && band.members.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-3 flex items-center text-metal-red" data-testid="text-members-title">
                        <Users className="w-4 h-4 mr-2" />
                        Current Lineup
                      </h4>
                      <div className="space-y-2">
                        {band.members.map((member, index) => (
                          <div key={index} className="flex items-center p-2 bg-metal-black/30 rounded" data-testid={`text-member-${index}`}>
                            <div className="w-8 h-8 bg-metal-red rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-100">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {band.founded && (
                    <div className="flex items-center justify-between p-3 bg-metal-black/30 rounded">
                      <span className="text-gray-400">Founded</span>
                      <span className="font-bold text-white">{band.founded}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-metal-black/30 rounded">
                    <span className="text-gray-400">Genre</span>
                    <Badge variant="secondary" className="bg-metal-red text-white">{band.genre}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Shows */}
              <Card className="bg-card-dark border-metal-gray">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-black">Upcoming Shows</CardTitle>
                  {upcomingTours.length > 0 && (
                    <Link href="/tours" data-testid="link-all-tours">
                      <Button variant="outline" size="sm" className="border-metal-gray text-white hover:bg-metal-gray">
                        View All
                      </Button>
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  {toursLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 bg-metal-gray rounded-lg" />
                      ))}
                    </div>
                  ) : upcomingTours.length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">No upcoming shows</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingTours.slice(0, 4).map((tour) => (
                        <div key={tour.id} className="p-4 bg-metal-black/30 rounded-lg" data-testid={`tour-${tour.id}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-sm" data-testid={`text-tour-venue-${tour.id}`}>{tour.venue}</h4>
                              <p className="text-xs text-gray-300 flex items-center" data-testid={`text-tour-location-${tour.id}`}>
                                <MapPin className="w-3 h-3 mr-1" />
                                {tour.city}, {tour.country}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center mt-1" data-testid={`text-tour-datetime-${tour.id}`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(tour.date)} • {formatTime(tour.date)}
                              </p>
                            </div>
                            {tour.ticketUrl && (
                              <Button 
                                size="sm" 
                                className="bg-metal-red hover:bg-metal-red-bright text-xs ml-2"
                                onClick={() => tour.ticketUrl && window.open(tour.ticketUrl, '_blank')}
                                data-testid={`button-tickets-${tour.id}`}
                              >
                                Tickets
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="music" className="mt-6">
          <Card className="bg-card-dark border-metal-gray">
            <CardHeader>
              <CardTitle className="text-2xl font-black flex items-center">
                <Music className="w-6 h-6 mr-3" />
                Discography
              </CardTitle>
            </CardHeader>
            <CardContent>
              {band.albums && band.albums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {band.albums.map((album, index) => (
                    <div key={index} className="group cursor-pointer" data-testid={`album-${index}`}>
                      <div className="bg-metal-black/50 p-6 rounded-lg border border-metal-gray hover:border-metal-red transition-colors">
                        <div className="w-full h-48 bg-gradient-to-br from-metal-red to-metal-dark rounded-lg mb-4 flex items-center justify-center">
                          <Play className="w-12 h-12 text-white opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h3 className="font-bold text-white group-hover:text-metal-red transition-colors" data-testid={`text-album-${index}`}>
                          {album}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">{band.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No albums listed yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="photos" className="mt-6">
          <div className="space-y-6">
            {photosLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-48 bg-metal-gray rounded-lg" />
                ))}
              </div>
            ) : photos.length === 0 ? (
              <Card className="bg-card-dark border-metal-gray">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-metal-gray rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-200 mb-4">No photos uploaded yet. Share your {band.name} moments!</p>
                  <Link href="/photos" data-testid="button-upload-first-photo">
                    <Button className="bg-metal-red hover:bg-metal-red-bright">
                      Upload First Photo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {Object.entries(photosByCategory).map(([category, categoryPhotos]) => (
                  <Card key={category} className="bg-card-dark border-metal-gray">
                    <CardHeader>
                      <CardTitle className="text-xl font-black capitalize">
                        {category} Photos ({categoryPhotos.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryPhotos.map((photo, index) => (
                          <Dialog key={photo.id}>
                            <DialogTrigger asChild>
                              <div className="group cursor-pointer" data-testid={`photo-${photo.id}`}>
                                <img 
                                  src={photo.imageUrl} 
                                  alt={photo.title}
                                  className="w-full h-48 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                                />
                                <p className="text-xs text-gray-200 mt-2 font-medium" data-testid={`text-photo-title-${photo.id}`}>
                                  {photo.title}
                                </p>
                                {photo.description && (
                                  <p className="text-xs text-gray-400 mt-1">{photo.description}</p>
                                )}
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <img 
                                src={photo.imageUrl} 
                                alt={photo.title}
                                className="w-full h-auto max-h-[80vh] object-contain"
                              />
                              <div className="p-4">
                                <h3 className="font-bold text-lg">{photo.title}</h3>
                                {photo.description && (
                                  <p className="text-gray-400 mt-2">{photo.description}</p>
                                )}
                                <p className="text-gray-500 text-sm mt-2">Uploaded by {photo.uploadedBy}</p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tours" className="mt-6">
          <div className="space-y-6">
            {toursLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 bg-metal-gray rounded-lg" />
                ))}
              </div>
            ) : (
              <>
                {upcomingTours.length > 0 && (
                  <Card className="bg-card-dark border-metal-gray">
                    <CardHeader>
                      <CardTitle className="text-xl font-black text-metal-red">
                        Upcoming Shows ({upcomingTours.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingTours.map((tour) => (
                          <div key={tour.id} className="flex items-center justify-between p-4 bg-metal-black/30 rounded-lg" data-testid={`tour-${tour.id}`}>
                            <div className="flex-1">
                              <h4 className="font-bold text-white" data-testid={`text-tour-venue-${tour.id}`}>{tour.venue}</h4>
                              <p className="text-gray-300 flex items-center" data-testid={`text-tour-location-${tour.id}`}>
                                <MapPin className="w-4 h-4 mr-2" />
                                {tour.city}, {tour.country}
                              </p>
                              <p className="text-gray-400 flex items-center mt-1" data-testid={`text-tour-datetime-${tour.id}`}>
                                <Clock className="w-4 h-4 mr-2" />
                                {formatDate(tour.date)} • {formatTime(tour.date)}
                              </p>
                            </div>
                            {tour.ticketUrl && (
                              <Button 
                                className="bg-metal-red hover:bg-metal-red-bright"
                                onClick={() => tour.ticketUrl && window.open(tour.ticketUrl, '_blank')}
                                data-testid={`button-tickets-${tour.id}`}
                              >
                                Get Tickets
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {pastTours.length > 0 && (
                  <Card className="bg-card-dark border-metal-gray">
                    <CardHeader>
                      <CardTitle className="text-xl font-black text-gray-400">
                        Past Shows ({pastTours.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pastTours.slice(0, 10).map((tour) => (
                          <div key={tour.id} className="flex items-center justify-between p-3 bg-metal-black/20 rounded" data-testid={`past-tour-${tour.id}`}>
                            <div>
                              <h4 className="font-medium text-gray-300" data-testid={`text-past-tour-venue-${tour.id}`}>{tour.venue}</h4>
                              <p className="text-gray-500 text-sm" data-testid={`text-past-tour-location-${tour.id}`}>
                                {tour.city}, {tour.country} • {formatDate(tour.date)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {pastTours.length > 10 && (
                          <p className="text-center text-gray-500 text-sm pt-4">
                            +{pastTours.length - 10} more past shows
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {tours.length === 0 && (
                  <Card className="bg-card-dark border-metal-gray">
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No tour dates available</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}