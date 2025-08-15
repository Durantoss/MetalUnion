import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onRatingChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= rating;
          
          return (
            <Star
              key={index}
              className={cn(
                sizeClasses[size],
                isFilled ? "text-metal-red fill-metal-red" : "text-gray-400",
                interactive && "cursor-pointer hover:text-metal-red-bright"
              )}
              onClick={() => handleStarClick(starValue)}
              data-testid={`star-${starValue}`}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-400 ml-2" data-testid="rating-value">
          {rating}/{maxRating}
        </span>
      )}
    </div>
  );
}
