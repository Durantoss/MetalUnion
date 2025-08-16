import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTourSchema, type InsertTour } from "@shared/schema";
import { Calendar, MapPin, Ticket, DollarSign } from "lucide-react";

interface TourSubmissionProps {
  onSuccess?: () => void;
}

export default function TourSubmission({ onSuccess }: TourSubmissionProps) {
  const { toast } = useToast();
  
  // Get user's bands for the dropdown
  const { data: userBands = [] } = useQuery<any[]>({
    queryKey: ["/api/my-bands"],
  });

  const form = useForm<InsertTour>({
    resolver: zodResolver(insertTourSchema),
    defaultValues: {
      bandId: "",
      tourName: "",
      venue: "",
      city: "",
      country: "",
      date: new Date(),
      ticketUrl: "",
      ticketmasterUrl: "",
      seatgeekUrl: "",
      price: "",
      status: "upcoming",
    },
  });

  const submitTourMutation = useMutation({
    mutationFn: async (data: InsertTour) => {
      // Ensure date is properly formatted
      const tourData = {
        ...data,
        date: new Date(data.date),
      };
      
      const response = await apiRequest("POST", "/api/tours", tourData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tours/enhanced"] });
      queryClient.invalidateQueries({ queryKey: ["/api/search"] });
      toast({
        title: "Tour Added!",
        description: "Your tour date has been added successfully.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to add tour. Please try again.",
        variant: "destructive",
      });
    },
  });

  const countries = [
    "USA", "UK", "Canada", "Germany", "France", "Italy", "Spain", "Netherlands", 
    "Belgium", "Sweden", "Norway", "Denmark", "Finland", "Australia", "Japan", "Brazil"
  ];

  const statuses = [
    { value: "upcoming", label: "Upcoming" },
    { value: "sold_out", label: "Sold Out" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const onSubmit = (data: InsertTour) => {
    submitTourMutation.mutate(data);
  };

  // Format date for input (YYYY-MM-DDTHH:MM)
  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  return (
    <Card className="bg-card-dark border-metal-gray">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-metal-red" />
          <h2 className="text-2xl font-black uppercase tracking-wider">Add Tour Date</h2>
        </div>
        <p className="text-gray-400">
          Add your upcoming shows and let the metal community know where they can see you live!
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Band Selection */}
            <FormField
              control={form.control}
              name="bandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-bold">Select Band *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-card-dark border-metal-gray text-white focus:border-metal-red h-12" data-testid="select-band-for-tour">
                        <SelectValue placeholder="Choose your band" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-black border-metal-red">
                      {userBands.filter((band: any) => band.status === 'approved').map((band: any) => (
                        <SelectItem key={band.id} value={band.id} className="text-white hover:bg-metal-red/20">
                          {band.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-gray-400">
                    Only approved bands can add tour dates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tour Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="tourName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Tour/Show Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="World Domination Tour 2025"
                        {...field}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12"
                        data-testid="input-tour-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ? formatDateForInput(new Date(field.value)) : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        className="bg-card-dark border-metal-gray text-white focus:border-metal-red h-12"
                        data-testid="input-tour-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Venue Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Venue *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Madison Square Garden"
                        {...field}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12"
                        data-testid="input-venue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">City *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="New York"
                        {...field}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12"
                        data-testid="input-city"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Country *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card-dark border-metal-gray text-white focus:border-metal-red h-12" data-testid="select-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black border-metal-red">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country} className="text-white hover:bg-metal-red/20">
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ticket Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Ticket Price
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="$25.00+"
                        {...field}
                        value={field.value ?? ''}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12"
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Starting price (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card-dark border-metal-gray text-white focus:border-metal-red h-12" data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black border-metal-red">
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value} className="text-white hover:bg-metal-red/20">
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ticket Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="ticketUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold flex items-center">
                      <Ticket className="w-4 h-4 mr-2" />
                      Ticket URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://tickets.venue.com/show"
                        {...field}
                        value={field.value || ''}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12"
                        data-testid="input-ticket-url"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      General ticket purchase link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ticketmasterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Ticketmaster URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://ticketmaster.com/event"
                        {...field}
                        value={field.value || ''}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12"
                        data-testid="input-ticketmaster-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="seatgeekUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-bold">SeatGeek URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://seatgeek.com/event"
                      {...field}
                      value={field.value || ''}
                      className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12"
                      data-testid="input-seatgeek-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-center sm:justify-end space-x-4 pt-6">
              <Button
                type="submit"
                disabled={submitTourMutation.isPending}
                className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider px-8 py-3 h-12 w-full sm:w-auto text-base sm:text-sm"
                data-testid="button-submit-tour"
              >
                {submitTourMutation.isPending ? "Adding Tour..." : "Add Tour Date"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}