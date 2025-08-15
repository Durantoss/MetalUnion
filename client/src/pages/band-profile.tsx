import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StarRating from "@/components/ui/star-rating";
import { ArrowLeft, ExternalLink, Calendar, Users, Music, User, ThumbsUp } from "lucide-react";
import type { Band, Review, Photo, Tour } from "@shared/schema";

export default function BandProfile() {
  const { id } = useParams();

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/bands" data-testid="link-back-to-bands">
          <Button variant="ghost" className="text-metal-red hover:text-metal-red-bright mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bands
          </Button>
        </Link>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider mb-4" data-testid="text-band-name">
          {band.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Badge variant="secondary" className="bg-metal-red text-white font-bold" data-testid="text-band-genre">
            {band.genre}
          </Badge>
          {band.founded && (
            <span className="text-gray-400 flex items-center" data-testid="text-band-founded">
              <Calendar className="w-4 h-4 mr-1" />
              Founded {band.founded}
            </span>
          )}
          {band.website && (
            <a 
              href={band.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-metal-red hover:text-metal-red-bright flex items-center"
              data-testid="link-band-website"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Official Website
            </a>
          )}
        </div>
        <div className="flex items-center mb-6">
          <StarRating rating={5} size="lg" showValue />
          <span className="text-gray-400 ml-3">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Band Image and Description */}
          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-6">
              {band.imageUrl && (
                <img 
                  src={band.imageUrl} 
                  alt={`${band.name} band photo`}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                  data-testid="img-band-photo"
                />
              )}
              <h2 className="text-2xl font-black mb-4">About</h2>
              <p className="text-gray-300 leading-relaxed" data-testid="text-band-description">
                {band.description}
              </p>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-6">
              <h2 className="text-2xl font-black mb-6">Reviews</h2>
              
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <Skeleton className="w-12 h-12 rounded-full bg-metal-gray" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3 bg-metal-gray" />
                        <Skeleton className="h-16 w-full bg-metal-gray" />
                        <Skeleton className="h-4 w-1/4 bg-metal-gray" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No reviews yet. Be the first to review {band.name}!</p>
                  <Link href="/reviews" data-testid="button-write-first-review">
                    <Button className="bg-metal-red hover:bg-metal-red-bright">
                      Write First Review
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-metal-gray last:border-b-0 pb-6 last:pb-0" data-testid={`review-${review.id}`}>
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-metal-gray rounded-full flex items-center justify-center">
                          <User className="text-gray-400 w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-bold" data-testid={`text-review-username-${review.id}`}>{review.username}</span>
                              <span className="text-gray-400 text-sm ml-2">
                                reviewed {review.targetName || band.name}
                              </span>
                            </div>
                            <StarRating rating={review.rating} size="sm" showValue />
                          </div>
                          <h4 className="font-bold mb-2" data-testid={`text-review-title-${review.id}`}>{review.title}</h4>
                          <p className="text-gray-300 mb-3" data-testid={`text-review-content-${review.id}`}>{review.content}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span data-testid={`text-review-date-${review.id}`}>
                              {review.createdAt ? formatDate(review.createdAt) : 'Just now'}
                            </span>
                            <button className="hover:text-metal-red transition-colors flex items-center" data-testid={`button-like-review-${review.id}`}>
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              <span>{review.likes || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {reviews.length > 3 && (
                    <div className="text-center pt-4">
                      <Link href="/reviews" data-testid="button-view-all-reviews">
                        <Button variant="outline" className="border-metal-gray text-white hover:bg-metal-gray">
                          View All {reviews.length} Reviews
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos Section */}
          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-6">
              <h2 className="text-2xl font-black mb-6">Photos</h2>
              
              {photosLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-32 bg-metal-gray rounded-lg" />
                  ))}
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No photos uploaded yet. Share your {band.name} moments!</p>
                  <Link href="/photos" data-testid="button-upload-first-photo">
                    <Button className="bg-metal-red hover:bg-metal-red-bright">
                      Upload First Photo
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {photos.slice(0, 6).map((photo) => (
                      <div key={photo.id} className="group cursor-pointer" data-testid={`photo-${photo.id}`}>
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.title}
                          className="w-full h-32 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                        />
                        <p className="text-xs text-gray-400 mt-1" data-testid={`text-photo-title-${photo.id}`}>{photo.title}</p>
                      </div>
                    ))}
                  </div>
                  
                  {photos.length > 6 && (
                    <div className="text-center">
                      <Link href="/photos" data-testid="button-view-all-photos">
                        <Button variant="outline" className="border-metal-gray text-white hover:bg-metal-gray">
                          View All {photos.length} Photos
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Band Info */}
          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-6">
              <h3 className="text-xl font-black mb-4">Band Info</h3>
              
              {band.members && band.members.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold mb-2 flex items-center" data-testid="text-members-title">
                    <Users className="w-4 h-4 mr-2" />
                    Members
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {band.members.map((member, index) => (
                      <li key={index} data-testid={`text-member-${index}`}>{member}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {band.albums && band.albums.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold mb-2 flex items-center" data-testid="text-albums-title">
                    <Music className="w-4 h-4 mr-2" />
                    Notable Albums
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {band.albums.slice(0, 5).map((album, index) => (
                      <li key={index} data-testid={`text-album-${index}`}>{album}</li>
                    ))}
                  </ul>
                  {band.albums.length > 5 && (
                    <p className="text-xs text-gray-500 mt-1">
                      +{band.albums.length - 5} more albums
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tours */}
          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-6">
              <h3 className="text-xl font-black mb-4">Upcoming Tours</h3>
              
              {toursLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full bg-metal-gray" />
                      <Skeleton className="h-3 w-2/3 bg-metal-gray" />
                      <Skeleton className="h-6 w-20 bg-metal-gray" />
                    </div>
                  ))}
                </div>
              ) : upcomingTours.length === 0 ? (
                <p className="text-gray-400 text-sm">No upcoming tours scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {upcomingTours.slice(0, 3).map((tour) => (
                    <div key={tour.id} className="border-b border-metal-gray last:border-b-0 pb-4 last:pb-0" data-testid={`tour-${tour.id}`}>
                      <h4 className="font-bold text-sm" data-testid={`text-tour-venue-${tour.id}`}>{tour.venue}</h4>
                      <p className="text-xs text-gray-400" data-testid={`text-tour-location-${tour.id}`}>{tour.city}, {tour.country}</p>
                      <p className="text-xs text-gray-500 mb-2" data-testid={`text-tour-datetime-${tour.id}`}>
                        {formatDate(tour.date)} • {formatTime(tour.date)}
                      </p>
                      {tour.ticketUrl && (
                        <Button 
                          size="sm" 
                          className="bg-metal-red hover:bg-metal-red-bright text-xs"
                          onClick={() => tour.ticketUrl && window.open(tour.ticketUrl, '_blank')}
                          data-testid={`button-tickets-${tour.id}`}
                        >
                          Get Tickets
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {upcomingTours.length > 3 && (
                    <div className="pt-2">
                      <Link href="/tours" data-testid="button-view-all-tours">
                        <Button variant="outline" size="sm" className="border-metal-gray text-white hover:bg-metal-gray text-xs">
                          View All Tours
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}
