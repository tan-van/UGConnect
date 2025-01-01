import { useUser } from "@/hooks/use-user";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import CreatorProfileEditor from "@/components/CreatorProfileEditor";
import { Instagram, Youtube, Twitter, BadgeCheck } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

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

  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/profile/initialize', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to initialize profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      window.location.reload(); // Reload to show the initialized profile
    },
  });

  // Auto-initialize profile if not found
  React.useEffect(() => {
    if (!isProfileLoading && !profile) {
      initializeMutation.mutate();
    }
  }, [isProfileLoading, profile]);

  const { data: profile, isLoading: isProfileLoading } = useQuery<CreatorProfile>({
    queryKey: ['/api/profile'],
    enabled: !!user && user.role === 'creator',
    onError: (error) => {
      if (error instanceof Error && error.message.includes('404')) {
        initializeMutation.mutate();
      }
    },
  });

  const { data: verificationStatus, isLoading: isVerificationLoading } = useQuery<VerificationStatusResponse>({
    queryKey: ['/api/profile/verification-status'],
    enabled: !!user && user.role === 'creator' && !!profile,
  });

  if (!user || user.role !== 'creator') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          This page is only accessible to creators.
        </p>
      </div>
    );
  }

  if (isProfileLoading || isVerificationLoading || initializeMutation.isPending) {
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

  const initialProfileData = {
    instagram: profile?.instagram ?? "",
    youtube: profile?.youtube ?? "",
    tiktok: profile?.tiktok ?? "",
    twitter: profile?.twitter ?? "",
    instagramFollowers: profile?.instagramFollowers ?? undefined,
    youtubeSubscribers: profile?.youtubeSubscribers ?? undefined,
    tiktokFollowers: profile?.tiktokFollowers ?? undefined,
    twitterFollowers: profile?.twitterFollowers ?? undefined,
    averageViews: profile?.averageViews ?? undefined,
    engagementRate: profile?.engagementRate ?? "",
    ratePerPost: profile?.ratePerPost ?? "",
    availability: profile?.availability ?? true,
  };

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
        {profile?.instagram && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Instagram Followers
                {verificationStatus?.instagram?.verified && (
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
                {profile.instagramFollowers?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.youtube && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                YouTube Subscribers
                {verificationStatus?.youtube?.verified && (
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
                {profile.youtubeSubscribers?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.twitter && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                X Followers
                {verificationStatus?.twitter?.verified && (
                  <Badge variant="secondary" className="ml-2">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardTitle>
              <Twitter className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile.twitterFollowers?.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatorProfileEditor initialData={initialProfileData} />
        </CardContent>
      </Card>
    </div>
  );
}