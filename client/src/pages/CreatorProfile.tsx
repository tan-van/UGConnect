import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  DollarSign,
  Clock,
  Twitter
} from "lucide-react";
import {
  SiInstagram,
  SiYoutube,
  SiTiktok
} from "react-icons/si";
import { useUser } from "@/hooks/use-user";
import ReviewsList from "@/components/ReviewsList";
import ReviewForm from "@/components/ReviewForm";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
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
  reviews?: any[]; //Retained from original code
}

export default function CreatorProfile() {
  const { username } = useParams();
  const { user } = useUser();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: profile, isLoading, error } = useQuery<CreatorProfileData>({
    queryKey: ['creators', username],
    queryFn: async () => {
      if (!username) return null;
      const response = await fetch(`/api/creators/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      return data;
    },
    enabled: !!username,
  });

  if (error) {
    console.error('Profile fetch error:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Error loading profile</h2>
        <p className="text-muted-foreground mt-2">
          {error instanceof Error ? error.message : 'Failed to load profile'}
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!profile) {
    if (user && user.username === username) {
      return (
        <div className="text-center py-12 space-y-4">
          <h2 className="text-2xl font-bold">Profile Not Set Up</h2>
          <p className="text-muted-foreground">
            You haven't set up your creator profile yet.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Set Up Profile
          </button>
        </div>
      );
    }
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Creator not found</h2>
        <p className="text-muted-foreground mt-2">
          The creator you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const hasContentCategories = profile.contentCategories && profile.contentCategories.length > 0;
  const hasShowcaseContent = profile.showcaseContent && profile.showcaseContent.length > 0;
  const isClient = user?.role === 'client';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      {/* Profile Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">
            {profile.displayName || profile.username}
          </h1>
          {profile.availability && (
            <Badge variant="secondary" className="text-sm">
              <Clock className="h-3 w-3 mr-1" />
              Available for Work
            </Badge>
          )}
        </div>
        <p className="text-xl text-muted-foreground">{profile.bio}</p>
        {profile.ratePerPost && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Rate per post: {profile.ratePerPost}</span>
          </div>
        )}
      </div>

      {/* Social Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <SiYoutube className="h-5 w-5 text-red-500" />
              <div className="flex items-center">
                <p className="font-semibold">YouTube</p>
                {profile.youtubeVerified && (
                  <Badge variant="secondary" className="ml-2">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">
              {profile.youtubeSubscribers?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <div className="flex items-center">
                <p className="font-semibold">X</p>
                {profile.twitterVerified && (
                  <Badge variant="secondary" className="ml-2">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">
              {profile.twitterFollowers?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 17v-10l9 5.146-9 4.854z"/>
              </svg>
              <div className="flex items-center">
                <p className="font-semibold">Podcast</p>
                {profile.podcastVerified && (
                  <Badge variant="secondary" className="ml-2">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">
              {profile.podcastListeners?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Monthly Listeners</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <SiTiktok className="h-5 w-5" />
              <div className="flex items-center">
                <p className="font-semibold">TikTok</p>
                {profile.tiktokVerified && (
                  <Badge variant="secondary" className="ml-2">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">
              {profile.tiktokFollowers?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Views</p>
              <p className="text-2xl font-bold">
                {profile.averageViews?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
              <p className="text-2xl font-bold">
                {profile.engagementRate || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Categories */}
      {hasContentCategories && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Content Categories</h2>
          <div className="flex flex-wrap gap-2">
            {profile.contentCategories?.map((category, index) => (
              <Badge key={index} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Showcase Content */}
      {hasShowcaseContent && (
        <Card>
          <CardHeader>
            <CardTitle>Featured Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(profile.showcaseContent) && profile.showcaseContent.map((content, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <p className="font-semibold">{content.platform}</p>
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      View Content
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Reviews</h2>
          {isClient && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Write a Review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogTitle>Write a Review</DialogTitle>
                <ReviewForm
                  creatorId={profile.id}
                  onClose={() => setDialogOpen(false)}
                  onSuccess={handleReviewSuccess}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <ReviewsList creatorId={profile.id} />
      </div>
    </div>
  );
}