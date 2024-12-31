import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
}

export default function CreatorProfile() {
  const { username } = useParams();
  const { user } = useUser();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: profile, isLoading } = useQuery<CreatorProfileData>({
    queryKey: [`/api/creators/${username}`],
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
        <Skeleton className="h-64" />
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

  const hasContentCategories = profile.contentCategories && profile.contentCategories.length > 0;
  const hasShowcaseContent = profile.showcaseContent && profile.showcaseContent.length > 0;
  const isClient = user?.role === 'client';

  return (
    <div className="space-y-8">
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
              <Twitter className="h-5 w-5 text-blue-500" />
              <div className="flex items-center">
                <p className="font-semibold">Twitter</p>
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
              {profile.showcaseContent?.map((content, index) => (
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
      <ReviewsList
        creatorId={profile.id}
        onReviewClick={() => setShowReviewForm(true)}
        showReviewButton={isClient}
      />

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <ReviewForm
          creatorId={profile.id}
          onSuccess={() => setShowReviewForm(false)}
        />
      </Dialog>
    </div>
  );
}