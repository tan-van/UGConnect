import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import CreatorProfileEditor from "@/components/CreatorProfileEditor";
import { Instagram, Youtube, Twitter, BadgeCheck } from "lucide-react";

interface CreatorProfile {
  userId: number;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  instagramVerified: boolean;
  youtubeVerified: boolean;
  tiktokVerified: boolean;
  twitterVerified: boolean;
  instagramVerifiedAt?: string | null;
  youtubeVerifiedAt?: string | null;
  tiktokVerifiedAt?: string | null;
  twitterVerifiedAt?: string | null;
  instagramFollowers?: number | null;
  youtubeSubscribers?: number | null;
  tiktokFollowers?: number | null;
  twitterFollowers?: number | null;
  averageViews?: number | null;
  engagementRate?: string | null;
  contentCategories?: string[] | null;
  showcaseContent?: Array<{
    platform: string;
    url: string;
  }> | null;
  ratePerPost?: string | null;
  availability: boolean;
}

interface VerificationStatus {
  verified: boolean;
  verifiedAt: string | null;
}

interface VerificationStatusResponse {
  instagram: VerificationStatus;
  youtube: VerificationStatus;
  twitter: VerificationStatus;
  tiktok: VerificationStatus;
}

export default function CreatorDashboard() {
  const { user } = useUser();

  const { data: profile, isLoading: isProfileLoading } = useQuery<CreatorProfile>({
    queryKey: ['/api/profile'],
  });

  const { data: verificationStatus, isLoading: isVerificationLoading } = useQuery<VerificationStatusResponse>({
    queryKey: ['/api/profile/verification-status'],
  });

  const isLoading = isProfileLoading || isVerificationLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile and track your social media presence
        </p>
      </div>

      {/* Social Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Instagram Followers
              {verificationStatus?.instagram.verified && (
                <Badge variant="secondary" className="ml-2">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </CardTitle>
            <Instagram className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.instagramFollowers?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              YouTube Subscribers
              {verificationStatus?.youtube.verified && (
                <Badge variant="secondary" className="ml-2">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </CardTitle>
            <Youtube className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.youtubeSubscribers?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              X Followers
              {verificationStatus?.twitter.verified && (
                <Badge variant="secondary" className="ml-2">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </CardTitle>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.twitterFollowers?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatorProfileEditor initialData={profile} />
        </CardContent>
      </Card>
    </div>
  );
}