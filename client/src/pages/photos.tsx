import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhotoUpload from "@/components/forms/photo-upload";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";
import { Upload, Filter, Eye, Search, X, SlidersHorizontal, Calendar, User } from "lucide-react";
import type { Photo } from "@shared/schema";

export default function Photos() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUploader, setSelectedUploader] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  const { data: allPhotos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const uploaders = Array.from(new Set(allPhotos.map(photo => photo.uploadedBy))).sort();
    return { uploaders };
  }, [allPhotos]);

  // Advanced filtering logic
  const filteredPhotos = useMemo(() => {
    let filtered = allPhotos;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(photo => photo.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(photo => 
        photo.title.toLowerCase().includes(query) ||
        (photo.description && photo.description.toLowerCase().includes(query)) ||
        photo.uploadedBy.toLowerCase().includes(query) ||
        photo.category.toLowerCase().includes(query)
      );
    }

    // Apply uploader filter
    if (selectedUploader !== 'all') {
      filtered = filtered.filter(photo => photo.uploadedBy === selectedUploader);
    }

    // Apply date range filters
    if (dateFrom) {
      filtered = filtered.filter(photo => photo.createdAt && new Date(photo.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(photo => photo.createdAt && new Date(photo.createdAt) <= new Date(dateTo));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'date-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'uploader':
          return a.uploadedBy.localeCompare(b.uploadedBy);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allPhotos, selectedCategory, searchQuery, selectedUploader, dateFrom, dateTo, sortBy]);

  // Keep the original photos reference for lightbox navigation
  const photos = filteredPhotos;
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedUploader('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('date-desc');
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedUploader !== 'all' || 
    dateFrom || dateTo || sortBy !== 'date-desc';

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const navigatePhoto = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  const categories = [
    { value: "all", label: "All Photos", color: "bg-gray-600" },
    { value: "live", label: "Live Shows", color: "bg-red-600" },
    { value: "promo", label: "Promo Shots", color: "bg-blue-600" },
    { value: "backstage", label: "Backstage", color: "bg-green-600" },
    { value: "equipment", label: "Equipment", color: "bg-purple-600" },
  ];

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.color || "bg-gray-600";
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider mb-4">Photo Gallery</h1>
        <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
          Share your metal moments! Upload photos from concerts, backstage, equipment, and more.
        </p>
      </div>

      {/* Search and Quick Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search photos by title, description, uploader, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-card-dark border-metal-gray text-white placeholder:text-gray-400"
            data-testid="input-search-photos"
          />
        </div>

        {/* Quick Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              size="sm"
              className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider"
              data-testid="button-upload-photo"
            >
              <Upload className="w-4 h-4 mr-2" />
              {showUploadForm ? "Cancel Upload" : "Upload Photo"}
            </Button>

            {/* Category Filter Buttons */}
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className={`text-xs font-bold uppercase tracking-wider ${
                  selectedCategory === category.value 
                    ? "bg-metal-red hover:bg-metal-red-bright text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
                data-testid={`button-filter-${category.value}`}
              >
                {category.label}
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
              More Filters {hasActiveFilters && `(${[searchQuery, selectedCategory !== 'all', selectedUploader !== 'all', dateFrom, dateTo, sortBy !== 'date-desc'].filter(Boolean).length})`}
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
              {/* Uploader Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Uploader
                </label>
                <Select value={selectedUploader} onValueChange={setSelectedUploader}>
                  <SelectTrigger className="bg-card-dark border-metal-gray text-white" data-testid="select-uploader">
                    <SelectValue placeholder="All Uploaders" />
                  </SelectTrigger>
                  <SelectContent className="bg-card-dark border-metal-gray">
                    <SelectItem value="all">All Uploaders</SelectItem>
                    {filterOptions.uploaders.map((uploader) => (
                      <SelectItem key={uploader} value={uploader}>{uploader}</SelectItem>
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
                    <SelectItem value="title">Title (A-Z)</SelectItem>
                    <SelectItem value="uploader">Uploader (A-Z)</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-metal-gray/30">
              <p className="text-sm text-gray-400">
                Showing <span className="font-bold text-white">{photos.length}</span> of <span className="font-bold text-white">{allPhotos.length}</span> photos
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

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="bg-card-dark border-metal-gray mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Upload Photo</h2>
            <PhotoUpload onSuccess={() => setShowUploadForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Photos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="bg-card-dark border-metal-gray overflow-hidden">
              <Skeleton className="w-full h-40 sm:h-48 bg-metal-gray" />
              <CardContent className="p-3 sm:p-4">
                <Skeleton className="h-4 w-3/4 bg-metal-gray mb-2" />
                <Skeleton className="h-3 w-1/2 bg-metal-gray mb-2" />
                <Skeleton className="h-3 w-1/3 bg-metal-gray" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : photos.length === 0 ? (
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-6 sm:p-12 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {hasActiveFilters ? 'No Photos Match Your Filters' : (selectedCategory === "all" ? "No Photos Yet" : `No ${categories.find(c => c.value === selectedCategory)?.label} Photos`)}
            </h2>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms to find more photos'
                : (selectedCategory === "all" 
                  ? "Be the first to share your metal moments! Upload photos from concerts, backstage, equipment, and more."
                  : `No photos found in the ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} category. Try a different filter or upload some photos.`
                )
              }
            </p>
            <div className="space-y-3 sm:space-y-4">
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
                onClick={() => setShowUploadForm(true)}
                className="bg-metal-red hover:bg-metal-red-bright w-full sm:w-auto min-h-[48px]"
                data-testid="button-upload-first-photo"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              {selectedCategory !== "all" && !hasActiveFilters && (
                <div>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedCategory("all")}
                    className="border-metal-gray text-white hover:bg-metal-gray w-full sm:w-auto min-h-[44px]"
                    data-testid="button-show-all-photos"
                  >
                    Show All Photos
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Info */}
          <div className="mb-4 sm:mb-6">
            <div className="bg-card-dark/50 border border-metal-gray/30 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-gray-400 text-sm">
                  Showing <span className="font-bold text-white">{photos.length}</span> photos
                  {hasActiveFilters && (
                    <span className="ml-2 text-xs bg-metal-red/20 text-metal-red px-2 py-1 rounded">
                      Filtered
                    </span>
                  )}
                  {selectedCategory !== 'all' && (
                    <span className="ml-2 text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                      {categories.find(c => c.value === selectedCategory)?.label}
                    </span>
                  )}
                </p>
                <div className="text-xs text-gray-500">
                  Sorted by: <span className="text-white">
                    {sortBy === 'date-desc' ? 'Newest First' :
                     sortBy === 'date-asc' ? 'Oldest First' :
                     sortBy === 'title' ? 'Title (A-Z)' :
                     sortBy === 'uploader' ? 'Uploader (A-Z)' :
                     sortBy === 'category' ? 'Category' : sortBy
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {photos.map((photo, index) => (
              <Card key={photo.id} className="bg-card-dark border-metal-gray overflow-hidden hover:border-metal-red transition-colors group cursor-pointer" data-testid={`card-photo-${photo.id}`}>
                <div className="relative overflow-hidden" onClick={() => openLightbox(index)}>
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full h-48 sm:h-56 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    data-testid={`img-photo-${photo.id}`}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Eye className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
                      <p className="font-bold uppercase tracking-wider text-sm sm:text-base">VIEW</p>
                    </div>
                  </div>
                  <Badge 
                    className={`absolute top-2 left-2 text-white font-bold text-xs ${getCategoryColor(photo.category)}`}
                    data-testid={`badge-photo-category-${photo.id}`}
                  >
                    {categories.find(c => c.value === photo.category)?.label || photo.category}
                  </Badge>
                </div>
                
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-bold text-white mb-2 line-clamp-2 text-sm sm:text-base" data-testid={`text-photo-title-${photo.id}`}>
                    {photo.title}
                  </h3>
                  
                  {photo.description && (
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2" data-testid={`text-photo-description-${photo.id}`}>
                      {photo.description}
                    </p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-1">
                    <span data-testid={`text-photo-uploader-${photo.id}`} className="truncate">by {photo.uploadedBy}</span>
                    <span data-testid={`text-photo-date-${photo.id}`} className="text-right sm:text-left">
                      {photo.createdAt ? formatDate(photo.createdAt) : 'Just now'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Photo Lightbox */}
          <PhotoLightbox
            photos={photos}
            currentIndex={currentPhotoIndex}
            isOpen={lightboxOpen}
            onClose={closeLightbox}
            onNavigate={navigatePhoto}
          />

          {/* Load More */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-gray-400 text-xs sm:text-sm">
              Showing <span className="font-bold text-white">{photos.length}</span> of <span className="font-bold text-white">{allPhotos.length}</span> photos
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
        </>
      )}

    </main>
  );
}
