import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIChat } from '@/components/ui/ai-chat';
import { AIRecommendations } from '@/components/ui/ai-recommendations';
import { SmartSearch } from '@/components/ui/smart-search';
import { MusicAnalysis } from '@/components/ui/music-analysis';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Search, BarChart3, MessageSquare, Zap, Brain, Music } from 'lucide-react';

export default function AIAssistant() {
  const [selectedBandForAnalysis, setSelectedBandForAnalysis] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSearchResults = (results: any) => {
    // Handle smart search results - could update a list or navigate
    console.log('Smart search results:', results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-12 w-12 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              AI Assistant
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover new music, get intelligent recommendations, and explore the metal universe with advanced AI
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Smart Recommendations
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Natural Language Search
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Music Analysis
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              AI Chat Assistant
            </Badge>
          </div>
        </div>

        {/* AI Features Tabs */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2" data-testid="chat-tab">
              <Bot className="h-4 w-4" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2" data-testid="search-tab">
              <Search className="h-4 w-4" />
              Smart Search
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2" data-testid="recommendations-tab">
              <Sparkles className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2" data-testid="analysis-tab">
              <BarChart3 className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          {/* AI Chat Assistant */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIChat />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      What I Can Help With
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Music className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>Discover bands based on your taste</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Search className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>Explain metal genres and subgenres</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>Find concerts and tour information</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>Analyze band characteristics and style</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Bot className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>Answer metal music questions</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Smart Search */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  AI-Powered Natural Language Search
                </CardTitle>
                <p className="text-muted-foreground">
                  Search using natural language - try "bands like Metallica but heavier" or "atmospheric black metal from Norway"
                </p>
              </CardHeader>
              <CardContent>
                <SmartSearch onResults={handleSearchResults} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Example Searches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="p-2 bg-gray-800 rounded">"Progressive metal with clean vocals"</p>
                  <p className="p-2 bg-gray-800 rounded">"Bands similar to Opeth but more aggressive"</p>
                  <p className="p-2 bg-gray-800 rounded">"Atmospheric doom metal from the 90s"</p>
                  <p className="p-2 bg-gray-800 rounded">"Technical death metal with jazz influences"</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>AI understands context and musical relationships</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>Enhanced query processing for better results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Search className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>Combines database and web search results</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <AIRecommendations />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How Recommendations Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>Analyzes your listening preferences and favorite bands</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>Uses AI to find musical similarities and patterns</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <BarChart3 className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>Provides similarity scores and detailed reasoning</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommendation Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="p-2 bg-gray-800 rounded">🎸 Similar sound and style</p>
                  <p className="p-2 bg-gray-800 rounded">🎭 Same genre exploration</p>
                  <p className="p-2 bg-gray-800 rounded">⚡ Energy level matching</p>
                  <p className="p-2 bg-gray-800 rounded">🌟 Hidden gems discovery</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Music Analysis */}
          <TabsContent value="analysis" className="space-y-6">
            {selectedBandForAnalysis ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Music Analysis</h2>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => setSelectedBandForAnalysis(null)}
                  >
                    Clear Selection
                  </Badge>
                </div>
                <MusicAnalysis 
                  bandId={selectedBandForAnalysis.id}
                  bandName={selectedBandForAnalysis.name}
                />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    AI Music Analysis
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Select a band to get detailed AI-powered musical analysis
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sample bands for analysis */}
                    {[
                      { id: '1', name: 'Metallica' },
                      { id: '2', name: 'Iron Maiden' },
                      { id: '3', name: 'Black Sabbath' },
                      { id: '4', name: 'Judas Priest' }
                    ].map((band) => (
                      <Card 
                        key={band.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedBandForAnalysis(band)}
                        data-testid={`analyze-band-${band.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{band.name}</span>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Analysis Features</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-red-500 mt-0.5" />
                          <span>Energy levels and intensity analysis</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Music className="h-4 w-4 text-red-500 mt-0.5" />
                          <span>Musical characteristics and instruments</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-red-500 mt-0.5" />
                          <span>Genre classification and subgenres</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <BarChart3 className="h-4 w-4 text-red-500 mt-0.5" />
                          <span>Tempo, mood, and era identification</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Get Started</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>1. Select a band from above or search for others</p>
                        <p>2. Get detailed AI analysis of their musical style</p>
                        <p>3. Discover new aspects of their music</p>
                        <p>4. Compare different bands and genres</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}