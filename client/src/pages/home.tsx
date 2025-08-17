import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LighterRating from "@/components/ui/star-rating";
import { ArrowRight, User, ThumbsUp } from "lucide-react";
import type { Band, Review, Photo, Tour } from "@shared/schema";

export default function Home() {
  const { data: bands = [], isLoading: bandsLoading } = useQuery<Band[]>({
    queryKey: ["/api/bands"],
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  const { data: tours = [], isLoading: toursLoading } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
    select: (data) => data.filter(tour => new Date(tour.date) > new Date()).slice(0, 3),
  });

  const featuredBands = bands.slice(0, 3);
  const latestReviews = reviews.slice(0, 2);
  const recentPhotos = photos.slice(0, 6);

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

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] sm:h-[80vh] lg:h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-left">
          <h1 className="heading-enhanced text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6 leading-tight text-shadow-lg">
            MOBILIZE THE <span className="text-metal-red">MASSES</span>
          </h1>
          <p className="text-readable text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8">
            Reviews, photos, and tour dates for the heaviest bands on the planet
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/bands" data-testid="button-explore-bands" className="w-full sm:w-auto clickable-link no-underline">
              <Button className="bg-metal-red hover:bg-metal-red-bright px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg heading-enhanced uppercase tracking-wider w-full sm:w-auto min-h-[48px]">
                Explore Bands
              </Button>
            </Link>
            <Link href="/reviews" data-testid="button-write-review" className="w-full sm:w-auto clickable-link no-underline">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg heading-enhanced uppercase tracking-wider w-full sm:w-auto min-h-[48px]">
                Write Review
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Featured Bands Section */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="heading-enhanced text-2xl sm:text-3xl uppercase tracking-wider">Featured Bands</h2>
            <Link href="/bands" data-testid="link-view-all-bands" className="clickable-link">
              <Button variant="ghost" className="text-metal-red hover:text-metal-red-bright heading-enhanced uppercase text-sm tracking-wider self-start">
                View All <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {bandsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card-dark border-metal-gray animate-pulse">
                  <div className="w-full h-48 bg-metal-gray" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-metal-gray rounded mb-2" />
                    <div className="h-4 bg-metal-gray rounded w-1/2 mb-3" />
                    <div className="h-16 bg-metal-gray rounded mb-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredBands.map((band) => (
                <Card key={band.id} className="bg-card-dark border-metal-gray hover:border-metal-red transition-colors group" data-testid={`card-band-${band.id}`}>
                  {band.imageUrl && (
                    <img 
                      src={band.imageUrl} 
                      alt={`${band.name} live performance`} 
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="band-name mb-2" data-testid={`text-band-name-${band.id}`}>{band.name}</h3>
                    <p className="text-metal-red font-bold uppercase tracking-wider mb-3 text-sm" data-testid={`text-band-genre-${band.id}`}>{band.genre}</p>
                    <div className="flex items-center mb-3">
                      <LighterRating rating={5} size="sm" />
                      <span className="text-xs sm:text-sm text-secondary ml-2 font-medium">(Reviews coming soon)</span>
                    </div>
                    <p className="text-readable mb-4 line-clamp-2" data-testid={`text-band-description-${band.id}`}>{band.description}</p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <Link href={`/bands/${band.id}`} data-testid={`button-view-profile-${band.id}`} className="flex-1 clickable-link no-underline">
                        <Button className="bg-metal-red hover:bg-metal-red-bright text-sm heading-enhanced uppercase tracking-wider w-full sm:w-auto min-h-[44px]">
                          View Profile
                        </Button>
                      </Link>
                      {band.founded && (
                        <span className="text-xs text-gray-500 uppercase tracking-wider text-center sm:text-right">
                          Since {band.founded}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Latest Reviews Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="heading-enhanced text-2xl sm:text-3xl uppercase tracking-wider mb-6 sm:mb-8">Latest Reviews</h2>
          
          {reviewsLoading ? (
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="bg-card-dark border-metal-gray animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-metal-gray rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-metal-gray rounded w-1/3" />
                        <div className="h-16 bg-metal-gray rounded" />
                        <div className="h-4 bg-metal-gray rounded w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {latestReviews.length === 0 ? (
                <Card className="bg-card-dark border-metal-gray">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-400 mb-4">No reviews yet. Be the first to share your thoughts!</p>
                    <Link href="/reviews" data-testid="button-write-first-review">
                      <Button className="bg-metal-red hover:bg-metal-red-bright text-white">
                        Write First Review
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                latestReviews.map((review) => (
                  <Card key={review.id} className="bg-card-dark border-metal-gray hover:border-metal-gray transition-colors" data-testid={`card-review-${review.id}`}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-metal-gray rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-bold text-sm sm:text-base" data-testid={`text-review-stagename-${review.id}`}>{review.stagename}</span>
                              <span className="text-gray-400 text-xs sm:text-sm">reviewed</span>
                              <span className="font-bold text-metal-red text-sm" data-testid={`text-review-target-${review.id}`}>
                                {review.targetName || 'Band'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <LighterRating rating={review.rating} size="sm" showValue />
                            </div>
                          </div>
                          <p className="text-gray-300 mb-3 text-sm sm:text-base line-clamp-3" data-testid={`text-review-content-${review.id}`}>{review.content}</p>
                          <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 gap-3 sm:gap-4">
                            <span data-testid={`text-review-date-${review.id}`}>
                              {review.createdAt ? formatDate(review.createdAt) : 'Just now'}
                            </span>
                            <button className="hover:text-metal-red transition-colors flex items-center min-h-[40px] sm:min-h-0 py-2 sm:py-0" data-testid={`button-like-review-${review.id}`}>
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              <span>{review.likes || 0}</span>
                            </button>
                            <button className="hover:text-metal-red transition-colors min-h-[40px] sm:min-h-0 py-2 sm:py-0" data-testid={`button-reply-review-${review.id}`}>Reply</button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          <div className="mt-6 sm:mt-8 text-center">
            <Link href="/reviews" data-testid="button-write-review-main" className="inline-block w-full sm:w-auto">
              <Button className="bg-metal-red hover:bg-metal-red-bright text-white px-6 sm:px-8 py-3 font-bold uppercase tracking-wider w-full sm:w-auto min-h-[48px]">
                Write a Review
              </Button>
            </Link>
          </div>
        </section>

        {/* Photo Gallery Section */}
        <section className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">Recent Photos</h2>
            <Link href="/photos" data-testid="link-view-gallery">
              <Button variant="ghost" className="text-metal-red hover:text-metal-red-bright font-bold uppercase text-sm tracking-wider self-start">
                View Gallery <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {photosLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full h-24 md:h-32 bg-metal-gray rounded-lg" />
                  <div className="h-3 bg-metal-gray rounded mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {recentPhotos.length === 0 ? (
                <div className="col-span-full text-center py-8 sm:py-12">
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">No photos uploaded yet. Share your metal moments!</p>
                  <Link href="/photos" data-testid="button-upload-first-photo" className="inline-block w-full sm:w-auto">
                    <Button className="bg-metal-red hover:bg-metal-red-bright w-full sm:w-auto min-h-[48px]">
                      Upload First Photo
                    </Button>
                  </Link>
                </div>
              ) : (
                recentPhotos.map((photo) => (
                  <div key={photo.id} className="group cursor-pointer" data-testid={`photo-${photo.id}`}>
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.title}
                      className="w-full h-28 sm:h-24 md:h-32 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                    />
                    <p className="text-xs text-gray-400 mt-1 truncate" data-testid={`text-photo-caption-${photo.id}`}>{photo.title}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Upcoming Tours Section */}
        <section className="mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-6 sm:mb-8">Upcoming Tours</h2>
          
          {toursLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card-dark border-metal-gray animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-metal-gray rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-metal-gray rounded w-1/3" />
                        <div className="h-4 bg-metal-gray rounded w-1/2" />
                        <div className="h-4 bg-metal-gray rounded w-1/4" />
                      </div>
                      <div className="w-24 h-10 bg-metal-gray rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {tours.length === 0 ? (
                <Card className="bg-card-dark border-metal-gray">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <p className="text-gray-400 mb-4 text-sm sm:text-base">No upcoming tours scheduled yet. Check back soon for updates!</p>
                    <Link href="/tours" data-testid="button-view-all-tours" className="inline-block w-full sm:w-auto">
                      <Button className="bg-metal-red hover:bg-metal-red-bright w-full sm:w-auto min-h-[48px]">
                        View All Tours
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                tours.map((tour) => (
                  <Card key={tour.id} className="bg-card-dark border-metal-gray hover:border-metal-red transition-colors" data-testid={`card-tour-${tour.id}`}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <img 
                            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                            alt={tour.venue}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black text-base sm:text-lg truncate" data-testid={`text-tour-band-${tour.id}`}>{tour.tourName}</h3>
                            <p className="text-gray-400 text-sm truncate" data-testid={`text-tour-name-${tour.id}`}>{tour.tourName}</p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate" data-testid={`text-tour-venue-${tour.id}`}>{tour.venue}, {tour.city}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="text-left sm:text-right">
                            <p className="font-bold text-sm sm:text-base" data-testid={`text-tour-date-${tour.id}`}>{formatDate(tour.date)}</p>
                            <p className="text-xs sm:text-sm text-gray-400" data-testid={`text-tour-time-${tour.id}`}>{formatTime(tour.date)}</p>
                          </div>
                          <Button 
                            className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase text-xs sm:text-sm tracking-wider min-h-[44px] px-4 sm:px-6"
                            data-testid={`button-get-tickets-${tour.id}`}
                            onClick={() => tour.ticketUrl && window.open(tour.ticketUrl, '_blank')}
                          >
                            Get Tickets
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </section>

      </main>
    </>
  );
}
