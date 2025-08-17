import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";
import type { Photo } from "@shared/schema";

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoLightbox({ photos, currentIndex, isOpen, onClose, onNavigate }: PhotoLightboxProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case "ArrowRight":
          if (currentIndex < photos.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
        case "+":
        case "=":
          setZoomLevel(prev => Math.min(prev + 0.25, 3));
          break;
        case "-":
          setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate]);

  useEffect(() => {
    // Reset zoom and position when photo changes
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="text-xl font-black uppercase tracking-wider" data-testid="lightbox-title">
              {currentPhoto.title || "METAL ARCHIVES"}
            </h3>
            <p className="text-gray-400 font-bold uppercase tracking-wide">
              {currentIndex + 1} OF {photos.length}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-3 text-white hover:text-metal-red transition-colors disabled:opacity-50"
              data-testid="button-zoom-out"
            >
              <ZoomOut className="w-6 h-6" />
            </button>
            
            <span className="text-white font-bold min-w-16 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-3 text-white hover:text-metal-red transition-colors disabled:opacity-50"
              data-testid="button-zoom-in"
            >
              <ZoomIn className="w-6 h-6" />
            </button>
            
            <button
              onClick={onClose}
              className="p-3 text-white hover:text-metal-red transition-colors"
              data-testid="button-close-lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-4 text-white hover:text-metal-red transition-colors bg-black/50 hover:bg-black/80 border border-metal-red/30 hover:border-metal-red"
          data-testid="button-previous-photo"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {currentIndex < photos.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-4 text-white hover:text-metal-red transition-colors bg-black/50 hover:bg-black/80 border border-metal-red/30 hover:border-metal-red"
          data-testid="button-next-photo"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Main Image */}
      <div 
        className="flex items-center justify-center h-full p-20 cursor-move"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentPhoto.imageUrl}
          alt={currentPhoto.title || "Metal photo"}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onDragStart={(e) => e.preventDefault()}
          data-testid="lightbox-image"
        />
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div className="text-white max-w-2xl">
            {currentPhoto.description && (
              <p className="text-gray-300 mb-2" data-testid="lightbox-description">
                {currentPhoto.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm">
              {currentPhoto.category && (
                <span className="px-3 py-1 bg-metal-red text-white font-bold uppercase tracking-wider">
                  {currentPhoto.category}
                </span>
              )}
              {currentPhoto.bandName && (
                <span className="text-gray-400 font-bold uppercase tracking-wide">
                  {currentPhoto.bandName}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex space-x-2 max-w-md overflow-x-auto">
            {photos.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((photo, idx) => {
              const actualIndex = Math.max(0, currentIndex - 2) + idx;
              return (
                <button
                  key={photo.id}
                  onClick={() => onNavigate(actualIndex)}
                  className={`flex-shrink-0 w-16 h-16 border-2 transition-all duration-200 ${
                    actualIndex === currentIndex 
                      ? 'border-metal-red shadow-lg shadow-metal-red/30' 
                      : 'border-gray-600 hover:border-metal-red/50'
                  }`}
                  data-testid={`thumbnail-${actualIndex}`}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title || ''}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {!currentPhoto.imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-xl font-bold mb-2">IMAGE NOT AVAILABLE</p>
            <p className="text-gray-400">The darkness consumed this image...</p>
          </div>
        </div>
      )}
    </div>
  );
}