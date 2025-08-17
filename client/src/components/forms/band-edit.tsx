import { useState, useEffect } from "react";
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
import { insertBandSchema, type InsertBand, type Band } from "@shared/schema";
import { Plus, X, Guitar, Globe, Instagram, Save, AlertCircle } from "lucide-react";

interface BandEditProps {
  band: Band;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const metalGenres = [
  "Black Metal", "Death Metal", "Doom Metal", "Folk Metal", "Gothic Metal", 
  "Groove Metal", "Heavy Metal", "Industrial Metal", "Melodic Death Metal",
  "Metalcore", "Nu Metal", "Power Metal", "Progressive Metal", "Sludge Metal",
  "Speed Metal", "Symphonic Metal", "Thrash Metal", "Viking Metal"
];

export default function BandEdit({ band, onSuccess, onCancel }: BandEditProps) {
  const [members, setMembers] = useState<string[]>(band.members || []);
  const [albums, setAlbums] = useState<string[]>(band.albums || []);
  const [newMember, setNewMember] = useState("");
  const [newAlbum, setNewAlbum] = useState("");

  const form = useForm<InsertBand>({
    resolver: zodResolver(insertBandSchema),
    defaultValues: {
      name: band.name,
      genre: band.genre,
      description: band.description,
      imageUrl: band.imageUrl || "",
      founded: band.founded || undefined,
      members: band.members || [],
      albums: band.albums || [],
      website: band.website || "",
      instagram: band.instagram || "",
    },
  });

  const updateBandMutation = useMutation({
    mutationFn: async (data: Partial<InsertBand>) => {
      const response = await apiRequest("PUT", `/api/bands/${band.id}`, {
        ...data,
        members,
        albums,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-bands"] });
      queryClient.invalidateQueries({ queryKey: [`/api/bands/${band.id}`] });
      console.log("Band updated successfully");
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Band update failed:", error.message || "Unknown error");
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
    updateBandMutation.mutate(data);
  };

  return (
    <Card className="bg-card-dark border-metal-gray">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Guitar className="w-6 h-6 text-metal-red" />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">Edit Band Profile</h2>
              <p className="text-gray-400 text-sm mt-1">Update your band information</p>
            </div>
          </div>
          {band.status === 'approved' && (
            <div className="flex items-center space-x-2 text-green-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Changes will be visible immediately</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-10"
                        data-testid="input-edit-band-name"
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
                        <SelectTrigger className="bg-card-dark border-metal-gray text-white focus:border-metal-red h-12 sm:h-10" data-testid="select-edit-band-genre">
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
                      className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red resize-none min-h-[120px] sm:min-h-[100px]"
                      data-testid="textarea-edit-band-description"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-10"
                        data-testid="input-edit-band-founded"
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
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-10"
                        data-testid="input-edit-band-image"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-bold flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://yourband.com"
                        {...field}
                        value={field.value || ''}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-10"
                        data-testid="input-edit-band-website"
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
                    <FormLabel className="text-white font-bold flex items-center space-x-2">
                      <Instagram className="w-4 h-4" />
                      <span>Instagram</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/yourband"
                        {...field}
                        value={field.value || ''}
                        className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-10"
                        data-testid="input-edit-band-instagram"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Band Members */}
            <div>
              <FormLabel className="text-white font-bold block mb-3">Band Members</FormLabel>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Add band member"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                    className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-10 flex-1"
                    data-testid="input-edit-new-member"
                  />
                  <Button
                    type="button"
                    onClick={addMember}
                    disabled={!newMember.trim()}
                    className="bg-metal-red/20 hover:bg-metal-red/30 text-metal-red border border-metal-red/50 h-12 sm:h-10 w-full sm:w-auto"
                    data-testid="button-add-member"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {members.map((member, index) => (
                      <Badge key={index} className="bg-metal-gray text-white flex items-center gap-2" data-testid={`badge-edit-member-${member}`}>
                        {member}
                        <button 
                          type="button" 
                          onClick={() => removeMember(member)}
                          className="hover:text-red-400 transition-colors"
                          data-testid={`button-remove-member-${member}`}
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
              <FormLabel className="text-white font-bold block mb-3">Albums & Releases</FormLabel>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Add album or release"
                    value={newAlbum}
                    onChange={(e) => setNewAlbum(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlbum())}
                    className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red h-12 sm:h-10 flex-1"
                    data-testid="input-edit-new-album"
                  />
                  <Button
                    type="button"
                    onClick={addAlbum}
                    disabled={!newAlbum.trim()}
                    className="bg-metal-red/20 hover:bg-metal-red/30 text-metal-red border border-metal-red/50 h-12 sm:h-10 w-full sm:w-auto"
                    data-testid="button-add-album"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Album
                  </Button>
                </div>
                {albums.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {albums.map((album, index) => (
                      <Badge key={index} className="bg-metal-red/20 text-metal-red border border-metal-red/30 flex items-center gap-2" data-testid={`badge-edit-album-${album}`}>
                        {album}
                        <button 
                          type="button" 
                          onClick={() => removeAlbum(album)}
                          className="hover:text-red-400 transition-colors"
                          data-testid={`button-remove-album-${album}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-metal-gray/30">
              <Button
                type="submit"
                disabled={updateBandMutation.isPending}
                className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider h-12 sm:h-10 flex-1 sm:flex-none"
                data-testid="button-save-band-changes"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateBandMutation.isPending ? "Saving Changes..." : "Save Changes"}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={updateBandMutation.isPending}
                className="text-gray-400 hover:text-white hover:bg-metal-gray/20 h-12 sm:h-10 flex-1 sm:flex-none"
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}