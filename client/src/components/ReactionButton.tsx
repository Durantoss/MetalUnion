import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionButtonProps {
  targetId: string;
  targetType: 'review' | 'pitMessage' | 'pitReply' | 'photo';
  initialReactions?: Record<string, number>;
  userReaction?: string | null;
  onReact: (reactionType: string, targetId: string) => Promise<void>;
  size?: 'sm' | 'default' | 'lg';
}

const reactions = [
  { type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-400' },
  { type: 'fire', emoji: '🔥', label: 'Fire', color: 'text-fire-red' },
  { type: 'rock', emoji: '🤘', label: 'Rock On', color: 'text-electric-yellow' },
  { type: 'mind_blown', emoji: '🤯', label: 'Mind Blown', color: 'text-purple-400' },
  { type: 'heart', emoji: '❤️', label: 'Love', color: 'text-pink-400' },
];

export function ReactionButton({ 
  targetId, 
  targetType, 
  initialReactions = {}, 
  userReaction, 
  onReact,
  size = 'default'
}: ReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [currentReactions, setCurrentReactions] = useState(initialReactions);
  const [currentUserReaction, setCurrentUserReaction] = useState(userReaction);
  const [isLoading, setIsLoading] = useState(false);

  const handleReaction = async (reactionType: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Optimistic update
      const newReactions = { ...currentReactions };
      
      // Remove old reaction if exists
      if (currentUserReaction && newReactions[currentUserReaction]) {
        newReactions[currentUserReaction] = Math.max(0, newReactions[currentUserReaction] - 1);
      }
      
      // Add new reaction or toggle off if same
      if (currentUserReaction === reactionType) {
        setCurrentUserReaction(null);
      } else {
        newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
        setCurrentUserReaction(reactionType);
      }
      
      setCurrentReactions(newReactions);
      setShowPicker(false);
      
      await onReact(reactionType, targetId);
    } catch (error) {
      console.error('Error reacting:', error);
      // Revert optimistic update
      setCurrentReactions(initialReactions);
      setCurrentUserReaction(userReaction);
    } finally {
      setIsLoading(false);
    }
  };

  const totalReactions = Object.values(currentReactions).reduce((sum, count) => sum + count, 0);
  const primaryReaction = reactions.find(r => r.type === currentUserReaction) || reactions[0];

  return (
    <TooltipProvider>
      <div className="relative inline-flex items-center gap-2">
        {/* Main reaction button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentUserReaction ? "default" : "ghost"}
              size={size}
              onClick={() => setShowPicker(!showPicker)}
              className={`
                ${currentUserReaction ? 'bg-gradient-to-r from-fire-red to-electric-yellow text-void-black' : 'hover:bg-fire-red/10'}
                transition-all duration-200 relative group
              `}
              data-testid={`reaction-button-${targetId}`}
              disabled={isLoading}
            >
              <motion.span
                key={currentUserReaction || 'default'}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1"
              >
                <span className={size === 'sm' ? 'text-sm' : 'text-base'}>
                  {primaryReaction.emoji}
                </span>
                {totalReactions > 0 && (
                  <Badge 
                    variant={currentUserReaction ? "fire" : "outline"}
                    size={size}
                  >
                    {totalReactions}
                  </Badge>
                )}
              </motion.span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>React to this {targetType}</p>
          </TooltipContent>
        </Tooltip>

        {/* Reaction picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-full left-0 mt-2 z-50 flex items-center gap-1 p-2 bg-void-black/95 backdrop-blur-sm border border-fire-red/20 rounded-lg shadow-lg shadow-fire-red/10"
              data-testid={`reaction-picker-${targetId}`}
            >
              {reactions.map((reaction) => {
                const count = currentReactions[reaction.type] || 0;
                const isSelected = currentUserReaction === reaction.type;
                
                return (
                  <Tooltip key={reaction.type}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(reaction.type)}
                        className={`
                          relative group hover:scale-110 transition-all duration-200
                          ${isSelected ? 'bg-gradient-to-r from-fire-red/20 to-electric-yellow/20' : ''}
                        `}
                        data-testid={`reaction-${reaction.type}-${targetId}`}
                        disabled={isLoading}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <motion.span
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-lg"
                          >
                            {reaction.emoji}
                          </motion.span>
                          {count > 0 && (
                            <Badge variant="outline" size="sm" className="text-xs">
                              {count}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{reaction.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPicker(false)}
                className="ml-2 opacity-50 hover:opacity-100"
                data-testid={`close-picker-${targetId}`}
              >
                ✕
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}