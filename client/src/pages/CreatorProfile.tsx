import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BadgeCheck,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  SiInstagram,
  SiYoutube,
  SiTiktok
} from "react-icons/si";
import { useUser } from "@/hooks/use-user";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CreatorProfileData {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  availability: boolean;
  ratePerPost?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  instagramFollowers?: number;
  youtubeSubscribers?: number;
  twitterFollowers?: number;
  tiktokFollowers?: number;
  averageViews?: number;
  engagementRate?: string;
  instagramVerified?: boolean;
  youtubeVerified?: boolean;
  twitterVerified?: boolean;
  tiktokVerified?: boolean;
  contentCategories?: string[];
  showcaseContent?: Array<{
    platform: string;
    url: string;
  }>;
  reviews?: any[];
}

export default function CreatorProfile() {
  const { username } = useParams();
  const { user } = useUser();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: profile, isLoading } = useQuery<CreatorProfileData>({
    queryKey: ['creators', username],
    queryFn: async () => {
      if (!username) return null;
      const response = await fetch(`/api/creators/${username}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    },
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile && user && user.username === username) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold">Profile Not Set Up</h2>
        <p className="text-muted-foreground">
          You haven't set up your creator profile yet.
        </p>
        <Button 
          onClick={() => window.location.href = '/dashboard'}
          variant="default"
        >
          Set Up Profile
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Creator not found</h2>
        <p className="text-muted-foreground mt-2">
          The creator you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const handleReviewSuccess = () => {
    setDialogOpen(false);
    toast({
      title: "Review submitted",
      description: "Thank you for your feedback!",
    });
  };

  const isClient = user?.role === 'client';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">
            {profile.displayName || profile.username}
          </h1>
        </div>
        {user && user.username === username && (
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>
        {profile.availability && (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Available for Work
          </Badge>
        )}
        {profile.bio && (
          <p className="text-xl text-muted-foreground">{profile.bio}</p>
        )}
        {profile.ratePerPost && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Rate per post: {profile.ratePerPost}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Social Stats Cards */}
        {profile.instagramFollowers && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <SiInstagram className="h-5 w-5 text-pink-500" />
                <div className="flex items-center">
                  <p className="font-semibold">Instagram</p>
                  {profile.instagramVerified && (
                    <Badge variant="secondary" className="ml-2">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">
                {profile.instagramFollowers?.toLocaleString() || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </CardContent>
          </Card>
        )}
        {/* Other social media cards (if needed) */}
      </div>

      {/* Reviews Section */}
      <div className="space-y-4 col-span-full">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Reviews</h2>
          {isClient && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Write a Review</Button>
              </DialogTrigger>
              <DialogContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Write a Review</h3>
                  <ReviewForm
                    creatorId={profile.id}
                    onSuccess={handleReviewSuccess}
                    onClose={() => setDialogOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <ReviewsList creatorId={profile.id} />
      </div>
    </div>
  );
}