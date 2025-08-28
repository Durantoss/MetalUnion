import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Users, Clock, CheckCircle, Circle, TrendingUp } from 'lucide-react';

interface Poll {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  title: string;
  description?: string;
  options: string[];
  votingEndDate?: string;
  isActive: boolean;
  totalVotes: number;
  userVote?: number;
  results?: number[];
  createdAt: string;
}

interface PollVoteData {
  optionIndex: number;
  pollId: string;
}

export function InteractivePolls({ featured = false }: { featured?: boolean }) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPolls();
  }, [featured]);

  const loadPolls = async () => {
    try {
      const endpoint = featured ? '/api/polls/featured' : '/api/polls';
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setPolls(data);
      }
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (votingLoading[pollId]) return;
    
    setVotingLoading(prev => ({ ...prev, [pollId]: true }));
    
    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex }),
      });

      if (response.ok) {
        const updatedPoll = await response.json();
        setPolls(prev => prev.map(poll => 
          poll.id === pollId ? updatedPoll : poll
        ));
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    } finally {
      setVotingLoading(prev => ({ ...prev, [pollId]: false }));
    }
  };

  const isExpired = (poll: Poll) => {
    if (!poll.votingEndDate) return false;
    return new Date(poll.votingEndDate) < new Date();
  };

  const getTimeRemaining = (poll: Poll) => {
    if (!poll.votingEndDate) return 'No deadline';
    
    const now = new Date();
    const end = new Date(poll.votingEndDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <Card className="bg-void-black/40 border-fire-red/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-fire-red animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-electric-yellow animate-pulse delay-100"></div>
            <div className="w-3 h-3 rounded-full bg-fire-red animate-pulse delay-200"></div>
          </div>
          <p className="text-center mt-4 text-muted-foreground">Loading polls...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {featured && polls.length > 0 && (
        <Card className="bg-void-black/40 border-fire-red/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="gradient-text-neon flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Community Polls
            </CardTitle>
          </CardHeader>
        </Card>
      )}
      
      <AnimatePresence>
        {polls.map((poll, index) => {
          const expired = isExpired(poll);
          const hasVoted = poll.userVote !== undefined;
          const showResults = hasVoted || expired || !poll.isActive;
          
          return (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-void-black/40 border-fire-red/20 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={poll.creatorAvatar} />
                      <AvatarFallback>
                        {poll.creatorName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm hover:text-fire-red cursor-pointer">
                          {poll.creatorName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(poll.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2">{poll.title}</h3>
                      
                      {poll.description && (
                        <p className="text-muted-foreground text-sm mb-3">
                          {poll.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {poll.totalVotes} votes
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getTimeRemaining(poll)}
                        </div>
                        {!poll.isActive && (
                          <Badge variant="outline" size="sm">Closed</Badge>
                        )}
                        {expired && (
                          <Badge variant="destructive" size="sm">Expired</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {poll.options.map((option, optionIndex) => {
                      const voteCount = poll.results?.[optionIndex] || 0;
                      const percentage = poll.totalVotes > 0 ? (voteCount / poll.totalVotes) * 100 : 0;
                      const isUserVote = poll.userVote === optionIndex;
                      
                      return (
                        <div key={optionIndex} className="space-y-2">
                          <div
                            className={`
                              relative p-3 rounded-lg border transition-all cursor-pointer group
                              ${showResults 
                                ? `${isUserVote ? 'border-fire-red bg-fire-red/10' : 'border-fire-red/20 bg-void-black/20'} cursor-default`
                                : 'border-fire-red/20 bg-void-black/20 hover:border-fire-red/40 hover:bg-fire-red/5'
                              }
                              ${votingLoading[poll.id] ? 'opacity-50 pointer-events-none' : ''}
                            `}
                            onClick={() => {
                              if (!showResults && poll.isActive && !expired) {
                                handleVote(poll.id, optionIndex);
                              }
                            }}
                            data-testid={`poll-option-${poll.id}-${optionIndex}`}
                          >
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-3">
                                {showResults ? (
                                  isUserVote ? (
                                    <CheckCircle className="w-5 h-5 text-fire-red flex-shrink-0" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                  )
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground group-hover:text-fire-red flex-shrink-0" />
                                )}
                                
                                <span className={`font-medium ${isUserVote ? 'text-fire-red' : ''}`}>
                                  {option}
                                </span>
                              </div>
                              
                              {showResults && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono">{voteCount}</span>
                                  <Badge 
                                    variant={isUserVote ? "fire" : "outline"} 
                                    size="sm"
                                  >
                                    {percentage.toFixed(1)}%
                                  </Badge>
                                </div>
                              )}
                            </div>
                            
                            {showResults && (
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-fire-red/20 to-electric-yellow/20 rounded-lg"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: percentage / 100 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                style={{ transformOrigin: 'left' }}
                              />
                            )}
                          </div>
                          
                          {showResults && (
                            <Progress 
                              value={percentage} 
                              className="h-2"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {!showResults && poll.isActive && !expired && (
                    <div className="mt-4 p-3 bg-void-black/40 rounded-lg border border-fire-red/10">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BarChart className="w-4 h-4" />
                        Click an option to vote. Results will be shown after you vote.
                      </div>
                    </div>
                  )}
                  
                  {hasVoted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-gradient-to-r from-fire-red/10 to-electric-yellow/10 rounded-lg border border-fire-red/20"
                    >
                      <div className="flex items-center gap-2 text-sm text-fire-red">
                        <CheckCircle className="w-4 h-4" />
                        Thanks for voting! Your voice has been recorded.
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {polls.length === 0 && !loading && (
        <Card className="bg-void-black/40 border-fire-red/20">
          <CardContent className="p-6 text-center">
            <BarChart className="w-12 h-12 text-muted-foreground mb-4 opacity-50 mx-auto" />
            <h3 className="text-lg font-semibold mb-2">No polls available</h3>
            <p className="text-muted-foreground">
              {featured 
                ? "No featured polls right now. Check back later!"
                : "Be the first to create a community poll!"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}