import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { insertPhotoSchema } from "@shared/schema";
import { Upload, X, ImageIcon } from "lucide-react";
import type { Band } from "@shared/schema";

const photoUploadSchema = insertPhotoSchema.extend({
  image: z.instanceof(File, { message: "Please select an image file" }),
});

type PhotoUploadData = z.infer<typeof photoUploadSchema>;

interface PhotoUploadProps {
  onSuccess?: () => void;
  defaultBandId?: string;
}

export default function PhotoUpload({ onSuccess, defaultBandId }: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">Please log in to upload photos.</p>
        <a href="/api/login">
          <Button className="bg-metal-red hover:bg-metal-red-bright">Login to Upload</Button>
        </a>
      </div>
    );
  }

  const { data: bands = [] } = useQuery<Band[]>({
    queryKey: ["/api/bands"],
  });

  const form = useForm<PhotoUploadData>({
    resolver: zodResolver(photoUploadSchema),
    defaultValues: {
      bandId: defaultBandId || undefined,
      title: "",
      category: "live",
      uploadedBy: "",
      description: "",
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (data: PhotoUploadData) => {
      const formData = new FormData();
      formData.append('image', data.image);
      formData.append('bandId', data.bandId || '');
      formData.append('title', data.title);
      formData.append('category', data.category);
      formData.append('uploadedBy', data.uploadedBy);
      if (data.description) {
        formData.append('description', data.description);
      }

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Photo uploaded!",
        description: "Your photo has been shared with the community.",
      });
      form.reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
      console.error("Photo upload error:", error);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF, WebP).",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      form.setValue('image', file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue('image', undefined as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: PhotoUploadData) => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload.",
        variant: "destructive",
      });
      return;
    }

    uploadPhotoMutation.mutate({
      ...data,
      image: selectedFile,
    });
  };

  const categories = [
    { value: "live", label: "Live Performance" },
    { value: "promo", label: "Promo Photos" },
    { value: "backstage", label: "Backstage" },
    { value: "equipment", label: "Equipment" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* File Upload */}
        <div className="space-y-4">
          <label className="text-white font-bold">Photo *</label>
          
          {!selectedFile ? (
            <Card 
              className="bg-card-dark border-metal-gray border-dashed cursor-pointer hover:border-metal-red transition-colors"
              onClick={() => fileInputRef.current?.click()}
              data-testid="upload-area"
            >
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-semibold text-white mb-2">Click to upload photo</p>
                <p className="text-sm text-gray-400 text-center">
                  Supports JPG, PNG, GIF, WebP up to 5MB
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card-dark border-metal-gray">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img 
                      src={previewUrl!} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded-lg"
                      data-testid="img-preview"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white" data-testid="text-file-name">
                        {selectedFile.name}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-gray-400 hover:text-red-500"
                        data-testid="button-remove-file"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400" data-testid="text-file-size">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-file"
          />
        </div>

        {/* Band Selection */}
        <FormField
          control={form.control}
          name="bandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-bold">Band (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <FormControl>
                  <SelectTrigger 
                    className="bg-card-dark border-metal-gray text-white focus:border-metal-red"
                    data-testid="select-band"
                  >
                    <SelectValue placeholder="Select a band (optional)" />
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
                    data-testid="select-category"
                  >
                    <SelectValue placeholder="Select photo category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card-dark border-metal-gray">
                  {categories.map((category) => (
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
              <FormLabel className="text-white font-bold">Photo Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Give your photo a title"
                  {...field}
                  className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                  data-testid="input-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Uploaded By */}
        <FormField
          control={form.control}
          name="uploadedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-bold">Your Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your name"
                  {...field}
                  className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red"
                  data-testid="input-uploader"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-bold">Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add details about the photo..."
                  {...field}
                  value={field.value || ""}
                  rows={3}
                  className="bg-card-dark border-metal-gray text-white placeholder-gray-400 focus:border-metal-red resize-none"
                  data-testid="textarea-description"
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
              removeFile();
              onSuccess?.();
            }}
            className="border-metal-gray text-white hover:bg-metal-gray"
            data-testid="button-cancel-upload"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={uploadPhotoMutation.isPending || !selectedFile}
            className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider disabled:opacity-50"
            data-testid="button-submit-upload"
          >
            {uploadPhotoMutation.isPending ? "Uploading..." : "Upload Photo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
