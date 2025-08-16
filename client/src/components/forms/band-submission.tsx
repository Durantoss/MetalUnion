import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertBandSchema, type InsertBand } from "@shared/schema";
import { Plus, X, Guitar, Globe, Instagram } from "lucide-react";

interface BandSubmissionProps {
  onSuccess?: () => void;
}

const metalGenres = [
  "Black Metal", "Death Metal", "Doom Metal", "Folk Metal", "Gothic Metal", 
  "Groove Metal", "Heavy Metal", "Industrial Metal", "Melodic Death Metal",
  "Metalcore", "Nu Metal", "Power Metal", "Progressive Metal", "Sludge Metal",
  "Speed Metal", "Symphonic Metal", "Thrash Metal", "Viking Metal"
];

export default function BandSubmission({ onSuccess }: BandSubmissionProps) {
  const [members, setMembers] = useState<string[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");
  const [newAlbum, setNewAlbum] = useState("");
  const { toast } = useToast();

  const form = useForm<InsertBand>({
    resolver: zodResolver(insertBandSchema),
    defaultValues: {
      name: "",
      genre: "",
      description: "",
      imageUrl: "",
      founded: undefined,
      members: [],
      albums: [],
      website: "",
      instagram: "",
    },
  });

  const submitBandMutation = useMutation({
    mutationFn: async (data: InsertBand) => {
      const response = await apiRequest("POST", "/api/bands/submit", {
        ...data,
        members,
        albums,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bands"] });
      toast({
        title: "Band Submitted!",
        description: "Your band submission is under review. We'll notify you once it's approved.",
      });
      form.reset();
      setMembers([]);
      setAlbums([]);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit band. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember("");
    }
  };

  const removeMember = (member: string) => {
    setMembers(members.filter(m => m !== member));
  };

  const addAlbum = () => {
    if (newAlbum.trim() && !albums.includes(newAlbum.trim())) {
      setAlbums([...albums, newAlbum.trim()]);
      setNewAlbum("");
    }
  };

  const removeAlbum = (album: string) => {
    setAlbums(albums.filter(a => a !== album));
  };

  const onSubmit = (data: InsertBand) => {
    submitBandMutation.mutate(data);
  };

  return (
    <Card className="bg-card-dark border-metal-gray">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Guitar className="w-6 h-6 text-metal-red" />
          <h2 className="text-2xl font-black uppercase tracking-wider">Submit Your Band</h2>
        </div>
        <p className="text-gray-400">
          Join the MetalHub community! Submit your band profile for review and connect with metal fans worldwide.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Band Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter band name"
                        {...field}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                        data-testid="input-band-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Genre *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card-dark border-metal-gray text-white focus:border-metal-red" data-testid="select-band-genre">
                          <SelectValue placeholder="Select metal genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black border-metal-red">
                        {metalGenres.map((genre) => (
                          <SelectItem key={genre} value={genre} className="text-white hover:bg-metal-red/20">
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-bold">Band Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your band's style, influences, and story..."
                      {...field}
                      rows={4}
                      className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red resize-none"
                      data-testid="textarea-band-description"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-400">
                    Describe your band's musical style, influences, and background
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="founded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Founded Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1990"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                        data-testid="input-band-founded"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold">Band Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/band-image.jpg"
                        {...field}
                        value={field.value || ''}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                        data-testid="input-band-image"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Link to your band's promotional image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://yourband.com"
                        {...field}
                        value={field.value || ''}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                        data-testid="input-band-website"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold flex items-center">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/yourband"
                        {...field}
                        value={field.value || ''}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                        data-testid="input-band-instagram"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Band Members */}
            <div>
              <FormLabel className="text-white font-bold mb-3 block">Band Members</FormLabel>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add band member"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                    className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                    data-testid="input-new-member"
                  />
                  <Button
                    type="button"
                    onClick={addMember}
                    className="bg-metal-red hover:bg-metal-red-bright"
                    data-testid="button-add-member"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => (
                      <Badge key={member} className="bg-metal-gray text-white pr-1" data-testid={`badge-member-${member}`}>
                        {member}
                        <button
                          type="button"
                          onClick={() => removeMember(member)}
                          className="ml-2 hover:bg-metal-red rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Albums */}
            <div>
              <FormLabel className="text-white font-bold mb-3 block">Albums/Releases</FormLabel>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add album or release"
                    value={newAlbum}
                    onChange={(e) => setNewAlbum(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlbum())}
                    className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                    data-testid="input-new-album"
                  />
                  <Button
                    type="button"
                    onClick={addAlbum}
                    className="bg-metal-red hover:bg-metal-red-bright"
                    data-testid="button-add-album"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {albums.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {albums.map((album) => (
                      <Badge key={album} className="bg-metal-gray text-white pr-1" data-testid={`badge-album-${album}`}>
                        {album}
                        <button
                          type="button"
                          onClick={() => removeAlbum(album)}
                          className="ml-2 hover:bg-metal-red rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="submit"
                disabled={submitBandMutation.isPending}
                className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider px-8 py-3"
                data-testid="button-submit-band"
              >
                {submitBandMutation.isPending ? "Submitting..." : "Submit Band"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}