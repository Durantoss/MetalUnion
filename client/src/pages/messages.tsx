import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { insertMessageSchema } from "@shared/schema";
import { MessageCircle, Heart, Plus, User, Calendar } from "lucide-react";
import type { Message } from "@shared/schema";

const messageFormSchema = insertMessageSchema.extend({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required").max(2000, "Content must be less than 2000 characters"),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

export default function Messages() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const { data: allMessages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      authorId: "",
      authorStagename: "",
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: Omit<MessageFormData, 'authorId' | 'authorStagename'>) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Message posted!",
        description: "Your message has been shared with the community.",
      });
      form.reset();
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post message. Please try again.",
        variant: "destructive",
      });
      console.error("Message creation error:", error);
    },
  });

  const likeMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await apiRequest("POST", `/api/messages/${messageId}/like`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to like message.",
        variant: "destructive",
      });
    },
  });

  const filterMessages = (messages: Message[], category: string) => {
    if (category === "all") return messages;
    return messages.filter(message => message.category === category);
  };

  const filteredMessages = filterMessages(allMessages, selectedCategory)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

  const onSubmit = (data: MessageFormData) => {
    createMessageMutation.mutate({
      title: data.title,
      content: data.content,
      category: data.category,
    });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'band_discussion': return 'bg-blue-600';
      case 'gear': return 'bg-green-600';
      case 'events': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'band_discussion': return 'Band Discussion';
      case 'gear': return 'Gear & Equipment';
      case 'events': return 'Events & Concerts';
      default: return 'General';
    }
  };

  const categories = [
    { value: "all", label: "All Messages" },
    { value: "general", label: "General" },
    { value: "band_discussion", label: "Band Discussion" },
    { value: "gear", label: "Gear & Equipment" },
    { value: "events", label: "Events & Concerts" },
  ];

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-metal-red" />
            <h1 className="text-4xl font-black uppercase tracking-wider">The Pit</h1>
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider"
              data-testid="button-new-message"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          )}
        </div>
        <p className="text-gray-400 mb-6">
          Connect with fellow metalheads in The Pit. Share thoughts, discuss bands, and talk gear!
        </p>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="bg-card-dark border-metal-gray">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.value} 
              value={category.value}
              className="data-[state=active]:bg-metal-red data-[state=active]:text-white"
              data-testid={`tab-${category.value}`}
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* New Message Form */}
      {showForm && (
        <Card className="bg-card-dark border-metal-gray mb-8">
          <CardHeader>
            <h3 className="text-xl font-bold text-white">Post to The Pit</h3>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-bold">Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger 
                            className="bg-card-dark border-metal-gray text-white focus:border-metal-red"
                            data-testid="select-message-category"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card-dark border-metal-gray">
                          {categories.slice(1).map((category) => (
                            <SelectItem key={category.value} value={category.value} className="text-white hover:bg-metal-gray">
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-bold">Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What's on your mind?"
                          {...field}
                          className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                          data-testid="input-message-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white font-bold">Message *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts with The Pit..."
                          {...field}
                          rows={6}
                          className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red resize-none"
                          data-testid="textarea-message-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-metal-gray text-white hover:bg-metal-gray"
                    data-testid="button-cancel-message"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMessageMutation.isPending}
                    className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider disabled:opacity-50"
                    data-testid="button-submit-message"
                  >
                    {createMessageMutation.isPending ? "Posting..." : "Post Message"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Login Prompt for Guests */}
      {!isAuthenticated && (
        <Card className="bg-card-dark border-metal-gray mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400 mb-4">Join The Pit! Log in to post messages and engage with the community.</p>
            <a href="/api/login">
              <Button className="bg-metal-red hover:bg-metal-red-bright">Login to Participate</Button>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      <div className="space-y-6">
        {filteredMessages.length === 0 ? (
          <Card className="bg-card-dark border-metal-gray">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No messages yet</h3>
              <p className="text-gray-400">
                {selectedCategory === "all" 
                  ? "Be the first to start a conversation!"
                  : `No messages in ${getCategoryLabel(selectedCategory).toLowerCase()} yet.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card 
              key={message.id} 
              className="bg-card-dark border-metal-gray hover:border-metal-red transition-colors"
              data-testid={`card-message-${message.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={`${getCategoryColor(message.category!)} text-white text-xs`}>
                        {getCategoryLabel(message.category!)}
                      </Badge>
                      <span className="text-gray-400 text-sm flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(message.createdAt!)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3" data-testid={`text-message-title-${message.id}`}>
                      {message.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4" data-testid={`text-message-content-${message.id}`}>
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400 text-sm">
                        <User className="w-4 h-4 mr-1" />
                        <span data-testid={`text-message-author-${message.id}`}>
                          {message.authorStagename}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likeMessageMutation.mutate(message.id)}
                        disabled={likeMessageMutation.isPending}
                        className="text-gray-400 hover:text-metal-red"
                        data-testid={`button-like-message-${message.id}`}
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        <span>{message.likes || 0}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}