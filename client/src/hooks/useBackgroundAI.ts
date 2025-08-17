import { useState, useEffect } from 'react';
import { backgroundAI } from '../services/backgroundAI';

interface AIInsight {
  type: 'recommendation' | 'trend' | 'suggestion' | 'analysis';
  data: any;
  confidence: number;
  timestamp: Date;
}

/**
 * Hook to access background AI insights and recommendations
 */
export function useBackgroundAI() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [latestRecommendation, setLatestRecommendation] = useState<AIInsight | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if background AI is running
    setIsActive(true); // Assume it's active for now
    
    // Update insights periodically
    const updateInsights = () => {
      const allInsights = backgroundAI.getInsights();
      const latest = backgroundAI.getLatestRecommendation();
      
      setInsights(allInsights);
      setLatestRecommendation(latest);
    };

    // Initial update
    updateInsights();

    // Set up polling for new insights
    const interval = setInterval(updateInsights, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getRecommendations = () => {
    return backgroundAI.getInsights('recommendation');
  };

  const getTrends = () => {
    return backgroundAI.getInsights('trend');
  };

  const getSuggestions = () => {
    return backgroundAI.getInsights('suggestion');
  };

  const getAnalysis = () => {
    return backgroundAI.getInsights('analysis');
  };

  return {
    insights,
    latestRecommendation,
    isActive,
    getRecommendations,
    getTrends,
    getSuggestions,
    getAnalysis
  };
}