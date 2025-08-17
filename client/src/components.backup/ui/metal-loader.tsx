import { Flame, Skull, Zap } from "lucide-react";

interface MetalLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "flame" | "skull" | "lightning";
  text?: string;
}

export function MetalLoader({ size = "md", variant = "flame", text }: MetalLoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const getIcon = () => {
    switch (variant) {
      case "skull":
        return <Skull className={`${sizeClasses[size]} text-metal-red`} />;
      case "lightning":
        return <Zap className={`${sizeClasses[size]} text-metal-red`} />;
      default:
        return <Flame className={`${sizeClasses[size]} text-metal-red`} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {/* Animated Icon */}
      <div className="relative">
        {/* Pulsing glow effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-metal-red/30 rounded-full animate-ping`}></div>
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-metal-red/20 rounded-full animate-pulse`}></div>
        
        {/* Main spinning icon */}
        <div className="relative animate-spin">
          {getIcon()}
        </div>
      </div>
      
      {/* Loading text */}
      {text && (
        <div className={`${textSizeClasses[size]} font-black uppercase tracking-[0.2em] text-gray-300`}>
          {text}
        </div>
      )}
      
      {/* Animated dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-metal-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-metal-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-metal-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}

export function MetalSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-r from-metal-gray/30 via-metal-red/10 to-metal-gray/30 animate-pulse rounded ${className}`}>
      <div className="bg-metal-red/5 h-full w-full animate-pulse rounded"></div>
    </div>
  );
}

export function MetalLoadingPage({ text = "LOADING THE DARKNESS..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <MetalLoader size="lg" variant="flame" text={text} />
        
        {/* Additional metal aesthetic elements */}
        <div className="mt-8 flex justify-center space-x-4">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-metal-red to-transparent animate-pulse"></div>
          <div className="w-8 h-1 bg-metal-red animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-metal-red to-transparent animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}