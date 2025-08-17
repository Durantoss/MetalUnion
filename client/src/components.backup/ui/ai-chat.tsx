import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Bot, User, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatProps {
  className?: string;
}

export function AIChat({ className }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm MetalBot, your AI music assistant. Ask me about metal bands, get recommendations, or discover new music!",
      timestamp: new Date(),
      suggestions: [
        "Recommend bands similar to Metallica",
        "What's the difference between death metal and black metal?",
        "Tell me about recent metal albums"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          context: {
            currentPage: 'chat',
            userFavoriteBands: ['Metallica', 'Iron Maiden']
          }
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          MetalBot AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[60vh] sm:h-96 w-full rounded border p-4 mobile-scrollbar">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex gap-3 items-start ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <Bot className="h-6 w-6 flex-shrink-0 rounded-full bg-red-100 p-1 text-red-600 dark:bg-red-900 dark:text-red-400" />
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-md lg:max-w-lg rounded-lg px-4 py-3 mobile-text leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <User className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-100 p-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400" />
                  )}
                </div>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-0 sm:pl-9 justify-center sm:justify-start">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="mobile-button h-auto py-2 px-3 text-xs active-scale focus-visible-metal"
                        data-testid={`suggestion-${index}`}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Bot className="h-6 w-6 rounded-full bg-red-100 p-1 text-red-600 dark:bg-red-900 dark:text-red-400" />
                <div className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask about metal bands, get recommendations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage(input)}
            disabled={isLoading}
            className="mobile-text focus-visible-metal"
            data-testid="chat-input"
          />
          <Button 
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="mobile-button min-w-[48px] active-scale focus-visible-metal"
            data-testid="send-button"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}