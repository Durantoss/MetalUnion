import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MetalLoader } from "@/components/ui/metal-loader";
import BandSubmission from "@/components/forms/band-submission";
import BandEdit from "@/components/forms/band-edit";
import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Guitar, Plus, Edit, Eye, Clock, CheckCircle, XCircle, Globe, Instagram } from "lucide-react";
import type { Band } from "@shared/schema";

interface BandWithStatus extends Band {
  status: string;
  submittedAt: Date;
  approvedAt: Date | null;
}

export default function MyBands() {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [editingBandId, setEditingBandId] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  // // const { toast } = useToast();

  const { data: myBands = [], isLoading, refetch } = useQuery<BandWithStatus[]>({
    queryKey: ["/api/my-bands"],
    enabled: isAuthenticated,
  });

  const deleteBandMutation = useMutation({
    mutationFn: async (bandId: string) => {
      const response = await apiRequest("DELETE", `/api/bands/${bandId}`);
      if (!response.ok) {
        throw new Error("Failed to delete band");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-bands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bands"] });
      console.log("Band deleted successfully");
    },
    onError: () => {
      console.error("Failed to delete band");
    },
  });

  if (authLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-96">
          <MetalLoader size="lg" variant="skull" text="LOADING PROFILE..." />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
            <p className="text-gray-400 mb-6">You need to be logged in to manage your band profiles.</p>
            <a href="/api/login">
              <Button className="bg-metal-red hover:bg-metal-red-bright">Login</Button>
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            APPROVED
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-600 text-white">
            <Clock className="w-3 h-3 mr-1" />
            PENDING
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-600 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            REJECTED
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-600 text-white">
            {status.toUpperCase()}
          </Badge>
        );
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Guitar className="w-6 h-6 sm:w-8 sm:h-8 text-metal-red" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-wider">My Bands</h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">
          Manage your band profiles and track submission status. Build your metal legacy in the community.
        </p>
      </div>

      {/* Submit Band Button */}
      <div className="mb-6 sm:mb-8">
        <Button 
          onClick={() => setShowSubmissionForm(!showSubmissionForm)}
          className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm"
          data-testid="button-toggle-submission"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showSubmissionForm ? "Cancel Submission" : "Submit New Band"}
        </Button>
      </div>

      {/* Submission Form */}
      {showSubmissionForm && (
        <div className="mb-6 sm:mb-8">
          <BandSubmission onSuccess={() => {
            setShowSubmissionForm(false);
            refetch();
          }} />
        </div>
      )}

      {/* Bands List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <MetalLoader size="lg" variant="flame" text="LOADING YOUR BANDS..." />
        </div>
      ) : myBands.length === 0 ? (
        <Card className="bg-card-dark border-metal-gray">
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <Guitar className="w-16 h-16 mx-auto text-metal-red mb-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black mb-4 uppercase tracking-wider text-gray-300">
              No Bands Submitted
            </h2>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              Ready to unleash your music? Submit your first band profile and join the metal community!
            </p>
            <Button 
              onClick={() => setShowSubmissionForm(true)}
              className="bg-metal-red hover:bg-metal-red-bright font-bold uppercase tracking-wider h-12 sm:h-10 w-full sm:w-auto text-base sm:text-sm"
              data-testid="button-submit-first-band"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Your First Band
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {myBands.map((band) => 
            editingBandId === band.id ? (
              <BandEdit
                key={`edit-${band.id}`}
                band={band}
                onSuccess={() => {
                  setEditingBandId(null);
                  refetch();
                }}
                onCancel={() => setEditingBandId(null)}
              />
            ) : (
              <Card key={band.id} className="bg-card-dark border-metal-gray" data-testid={`card-my-band-${band.id}`}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    {band.imageUrl && (
                      <img 
                        src={band.imageUrl} 
                        alt={band.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover border border-metal-gray flex-shrink-0"
                        data-testid={`img-band-${band.id}`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-black text-white truncate" data-testid={`text-band-name-${band.id}`}>
                        {band.name}
                      </h3>
                      <p className="text-gray-300 font-medium text-sm sm:text-base" data-testid={`text-band-genre-${band.id}`}>
                        {band.genre}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
                    {getStatusBadge(band.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-metal-red p-2"
                      data-testid={`button-view-band-${band.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-200" data-testid={`text-band-description-${band.id}`}>
                  {band.description}
                </p>

                {/* Band Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                  {band.founded && (
                    <div>
                      <span className="text-gray-400 font-bold">Founded:</span>
                      <span className="text-white ml-2" data-testid={`text-band-founded-${band.id}`}>{band.founded}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 font-bold">Submitted:</span>
                    <span className="text-white ml-2" data-testid={`text-band-submitted-${band.id}`}>
                      {formatDate(band.submittedAt)}
                    </span>
                  </div>
                  {band.approvedAt && (
                    <div>
                      <span className="text-gray-400 font-bold">Approved:</span>
                      <span className="text-white ml-2" data-testid={`text-band-approved-${band.id}`}>
                        {formatDate(band.approvedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Members */}
                {band.members && band.members.length > 0 && (
                  <div>
                    <span className="text-gray-400 font-bold block mb-2">Members:</span>
                    <div className="flex flex-wrap gap-2">
                      {band.members.map((member) => (
                        <Badge key={member} className="bg-metal-gray text-white" data-testid={`badge-member-${member}`}>
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Albums */}
                {band.albums && band.albums.length > 0 && (
                  <div>
                    <span className="text-gray-400 font-bold block mb-2">Albums:</span>
                    <div className="flex flex-wrap gap-2">
                      {band.albums.map((album) => (
                        <Badge key={album} className="bg-metal-red/20 text-metal-red border border-metal-red/30" data-testid={`badge-album-${album}`}>
                          {album}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="bg-metal-gray/30" />

                {/* Actions and Links */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {band.website && (
                      <a 
                        href={band.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-metal-red flex items-center text-sm"
                        data-testid={`link-band-website-${band.id}`}
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    )}
                    {band.instagram && (
                      <a 
                        href={band.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-metal-red flex items-center text-sm"
                        data-testid={`link-band-instagram-${band.id}`}
                      >
                        <Instagram className="w-4 h-4 mr-1" />
                        Instagram
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBandId(band.id)}
                      className="text-gray-400 hover:text-metal-red text-sm h-9 sm:h-8"
                      data-testid={`button-edit-band-${band.id}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {band.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBandMutation.mutate(band.id)}
                        disabled={deleteBandMutation.isPending}
                        className="text-red-400 hover:text-red-300 text-sm h-9 sm:h-8"
                        data-testid={`button-delete-band-${band.id}`}
                      >
                        {deleteBandMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status Messages */}
                {band.status === 'pending' && (
                  <div className="bg-yellow-600/10 border border-yellow-600/30 p-3 text-yellow-200 text-sm">
                    <strong>Pending Review:</strong> Your band submission is under review. We'll notify you once it's approved!
                  </div>
                )}
                {band.status === 'rejected' && (
                  <div className="bg-red-600/10 border border-red-600/30 p-3 text-red-200 text-sm">
                    <strong>Submission Rejected:</strong> Your band submission didn't meet our guidelines. Please revise and resubmit.
                  </div>
                )}
                {band.status === 'approved' && (
                  <div className="bg-green-600/10 border border-green-600/30 p-3 text-green-200 text-sm">
                    <strong>Band Approved!</strong> Your band is now live on MetalHub and visible to the community.
                  </div>
                )}
              </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </main>
  );
}