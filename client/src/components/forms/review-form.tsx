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
import LighterRating from "@/components/ui/star-rating";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertReviewSchema } from "@shared/schema";
import type { Band } from "@shared/schema";

const reviewFormSchema = insertReviewSchema.extend({
  rating: z.number().min(1, "Please select a rating").max(5, "Rating must be between 1 and 5"),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  onSuccess?: () => void;
  defaultBandId?: string;
}

export default function ReviewForm({ onSuccess, defaultBandId }: ReviewFormProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const { toast } = useToast();

  const { data: bands = [] } = useQuery<Band[]>({
    queryKey: ["/api/bands"],
  });

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      bandId: defaultBandId || "",
      username: "",
      rating: 0,
      title: "",
      content: "",
      reviewType: "band",
      targetName: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await apiRequest("POST", "/api/reviews", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      toast({
        title: "Review submitted!",
        description: "Thanks for sharing your thoughts with the community.",
      });
      form.reset();
      setSelectedRating(0);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
      console.error("Review submission error:", error);
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    createReviewMutation.mutate({
      ...data,
      rating: selectedRating,
    });
  };

  const watchedReviewType = form.watch("reviewType");
  const watchedBandId = form.watch("bandId");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Band Selection */}
        <FormField
          control={form.control}
          name="bandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-bold">Band *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger 
                    className="bg-card-dark border-metal-gray text-white focus:border-metal-red"
                    data-testid="select-band"
                  >
                    <SelectValue placeholder="Select a band" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card-dark border-metal-gray">
                  {bands.map((band) => (
                    <SelectItem key={band.id} value={band.id} className="text-white hover:bg-metal-gray">
                      {band.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Review Type */}
        <FormField
          control={form.control}
          name="reviewType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-bold">Review Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger 
                    className="bg-card-dark border-metal-gray text-white focus:border-metal-red"
                    data-testid="select-review-type"
                  >
                    <SelectValue placeholder="What are you reviewing?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card-dark border-metal-gray">
                  <SelectItem value="band" className="text-white hover:bg-metal-gray">Band</SelectItem>
                  <SelectItem value="album" className="text-white hover:bg-metal-gray">Album</SelectItem>
                  <SelectItem value="concert" className="text-white hover:bg-metal-gray">Concert</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target Name (Album/Concert specific) */}
        {(watchedReviewType === "album" || watchedReviewType === "concert") && (
          <FormField
            control={form.control}
            name="targetName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-bold">
                  {watchedReviewType === "album" ? "Album Name *" : "Concert/Venue *"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      watchedReviewType === "album" 
                        ? "Enter album name" 
                        : "Enter concert venue or event name"
                    }
                    {...field}
                    value={field.value || ""}
                    className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                    data-testid="input-target-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-bold">Your Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your username"
                  {...field}
                  className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                  data-testid="input-username"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rating */}
        <div className="space-y-2">
          <label className="text-white font-bold">Rating *</label>
          <div className="flex items-center space-x-4">
            <LighterRating
              rating={selectedRating}
              interactive
              onRatingChange={setSelectedRating}
              size="lg"
            />
            <span className="text-gray-400">
              {selectedRating === 0 ? "Click to rate" : `${selectedRating}/5 stars`}
            </span>
          </div>
          {form.formState.errors.rating && (
            <p className="text-sm text-red-500">{form.formState.errors.rating.message}</p>
          )}
        </div>

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-bold">Review Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Summarize your review in a few words"
                  {...field}
                  className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                  data-testid="input-title"
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
              <FormLabel className="text-white font-bold">Review Content *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your detailed thoughts and experience..."
                  {...field}
                  rows={6}
                  className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red resize-none"
                  data-testid="textarea-content"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setSelectedRating(0);
              onSuccess?.();
            }}
            className="border-metal-gray text-white hover:bg-metal-gray"
            data-testid="button-cancel-review"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createReviewMutation.isPending || selectedRating === 0 || !watchedBandId}
            className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider disabled:opacity-50"
            data-testid="button-submit-review"
          >
            {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
