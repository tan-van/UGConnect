import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Instagram, Youtube, Twitter, Video } from "lucide-react";
import { Link } from "wouter";

interface SpotlightCreator {
  id: number;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  totalReach: number;
  engagementRate: number;
  profile: {
    instagram: string | null;
    youtube: string | null;
    tiktok: string | null;
    twitter: string | null;
    instagramFollowers: number | null;
    youtubeSubscribers: number | null;
    tiktokFollowers: number | null;
    twitterFollowers: number | null;
    averageViews: number | null;
    engagementRate: string | null;
    contentCategories: string[] | null;
  };
}

export default function CreatorSpotlight() {
  const { data: creators, isLoading } = useQuery<SpotlightCreator[]>({
    queryKey: ['/api/creators/spotlight'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Featured Creators</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!creators || creators.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Featured Creators</h2>
            <p className="text-muted-foreground">Join now to be featured among our top creators!</p>
          </div>
        </div>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No featured creators yet. Be the first to join!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Featured Creators</h2>
          <p className="text-muted-foreground">Top creators making waves on our platform</p>
        </div>
        <Link href="/creators" className="text-primary hover:underline">
          View all creators
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {creators.map((creator) => (
          <Link key={creator.id} href={`/creators/${creator.username}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{creator.displayName || creator.username}</span>
                  <Badge variant="secondary" className="ml-2">
                    {creator.engagementRate.toFixed(1)}% Engagement
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {creator.bio || 'No bio provided'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Social Media Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {creator.profile?.instagramFollowers && (
                      <div className="flex items-center gap-1">
                        <Instagram className="h-4 w-4 text-pink-500" />
                        <span>{(creator.profile.instagramFollowers / 1000).toFixed(1)}K</span>
                      </div>
                    )}
                    {creator.profile?.youtubeSubscribers && (
                      <div className="flex items-center gap-1">
                        <Youtube className="h-4 w-4 text-red-500" />
                        <span>{(creator.profile.youtubeSubscribers / 1000).toFixed(1)}K</span>
                      </div>
                    )}
                    {creator.profile?.twitterFollowers && (
                      <div className="flex items-center gap-1">
                        <Twitter className="h-4 w-4" />
                        <span>{(creator.profile.twitterFollowers / 1000).toFixed(1)}K</span>
                      </div>
                    )}
                    {creator.profile?.tiktokFollowers && (
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        <span>{(creator.profile.tiktokFollowers / 1000).toFixed(1)}K</span>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  {creator.profile?.contentCategories && creator.profile.contentCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {creator.profile.contentCategories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Total Reach */}
                  <div className="text-sm font-medium">
                    Total Reach: {(creator.totalReach / 1000000).toFixed(2)}M
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}