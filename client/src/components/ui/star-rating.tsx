import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface LighterRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function LighterRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onRatingChange,
}: LighterRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleLighterClick = (lighterRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(lighterRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const lighterValue = index + 1;
          const isLit = lighterValue <= rating;
          
          return (
            <Flame
              key={index}
              className={cn(
                sizeClasses[size],
                isLit ? "text-orange-500 fill-orange-500" : "text-gray-400",
                interactive && "cursor-pointer hover:text-orange-400"
              )}
              onClick={() => handleLighterClick(lighterValue)}
              data-testid={`lighter-${lighterValue}`}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-400 ml-2" data-testid="rating-value">
          {rating}/{maxRating} 🔥
        </span>
      )}
    </div>
  );
}
