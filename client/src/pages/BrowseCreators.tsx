import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Instagram, Youtube, Twitter, Video } from "lucide-react";

interface CreatorProfile {
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
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

interface Creator {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  profile: CreatorProfile;
}

export default function BrowseCreators() {
  const { data: creators, isLoading } = useQuery<Creator[]>({
    queryKey: ['/api/creators'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Browse Creators</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!creators || creators.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">No creators found</h2>
        <p className="text-muted-foreground mt-2">
          Check back later for new creators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Browse Creators</h1>
        <p className="text-muted-foreground">
          Discover talented content creators across different categories
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {creators.map((creator) => (
          <Link key={creator.id} href={`/creators/${creator.username}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <CardTitle>{creator.displayName || creator.username}</CardTitle>
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
                        <Twitter className="h-4 w-4 text-blue-500" />
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

                  {/* Rate per post */}
                  {creator.profile?.ratePerPost && (
                    <div className="text-sm text-muted-foreground">
                      Rate: {creator.profile.ratePerPost}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}