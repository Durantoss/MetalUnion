import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PhotoUpload from "@/components/forms/photo-upload";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";
import { Upload, Filter, Eye } from "lucide-react";
import type { Photo } from "@shared/schema";

export default function Photos() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: allPhotos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  // Filter photos by category
  const photos = selectedCategory === "all" 
    ? allPhotos 
    : allPhotos.filter(photo => photo.category === selectedCategory);

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-wider mb-4">Photo Gallery</h1>
        <p className="text-gray-400 mb-6">
          Share your metal moments! Upload photos from concerts, backstage, equipment, and more.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Button 
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider"
            data-testid="button-upload-photo"
          >
            <Upload className="w-4 h-4 mr-2" />
            {showUploadForm ? "Cancel Upload" : "Upload Photo"}
          </Button>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <Card className="bg-card-dark border-metal-gray mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-black mb-6">Upload Photo</h2>
            <PhotoUpload onSuccess={() => setShowUploadForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Photos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="bg-card-dark border-metal-gray overflow-hidden">
              <Skeleton className="w-full h-48 bg-metal-gray" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 bg-metal-gray mb-2" />
                <Skeleton className="h-3 w-1/2 bg-metal-gray mb-2" />
                <Skeleton className="h-3 w-1/3 bg-metal-gray" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : photos.length === 0 ? (
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {selectedCategory === "all" ? "No Photos Yet" : `No ${categories.find(c => c.value === selectedCategory)?.label} Photos`}
            </h2>
            <p className="text-gray-400 mb-6">
              {selectedCategory === "all" 
                ? "Be the first to share your metal moments! Upload photos from concerts, backstage, equipment, and more."
                : `No photos found in the ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} category. Try a different filter or upload some photos.`
              }
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => setShowUploadForm(true)}
                className="bg-metal-red hover:bg-metal-red-bright"
                data-testid="button-upload-first-photo"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload First Photo
              </Button>
              {selectedCategory !== "all" && (
                <div>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedCategory("all")}
                    className="border-metal-gray text-white hover:bg-metal-gray"
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
          <div className="mb-6">
            <p className="text-gray-400">
              {selectedCategory === "all" 
                ? `Showing ${photos.length} photos`
                : `Found ${photos.length} ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} photos`
              }
            </p>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <Card key={photo.id} className="bg-card-dark border-metal-gray overflow-hidden hover:border-metal-red transition-colors group cursor-pointer" data-testid={`card-photo-${photo.id}`}>
                <div className="relative overflow-hidden" onClick={() => openLightbox(index)}>
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    data-testid={`img-photo-${photo.id}`}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-bold uppercase tracking-wider">VIEW</p>
                    </div>
                  </div>
                  <Badge 
                    className={`absolute top-2 left-2 text-white font-bold text-xs ${getCategoryColor(photo.category)}`}
                    data-testid={`badge-photo-category-${photo.id}`}
                  >
                    {categories.find(c => c.value === photo.category)?.label || photo.category}
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-bold text-white mb-2 line-clamp-2" data-testid={`text-photo-title-${photo.id}`}>
                    {photo.title}
                  </h3>
                  
                  {photo.description && (
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2" data-testid={`text-photo-description-${photo.id}`}>
                      {photo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span data-testid={`text-photo-uploader-${photo.id}`}>by {photo.uploadedBy}</span>
                    <span data-testid={`text-photo-date-${photo.id}`}>
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
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              {selectedCategory === "all" 
                ? `Showing ${photos.length} photos`
                : `Showing ${photos.length} ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} photos`
              }
            </p>
          </div>
        </>
      )}

    </main>
  );
}
