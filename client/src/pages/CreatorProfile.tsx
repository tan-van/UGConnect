import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Instagram, 
  Youtube, 
  Twitter,
  Users
} from "lucide-react";

export default function CreatorProfile() {
  const { username } = useParams();
  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/creators/${username}`],
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          {profile?.displayName || profile?.username}
        </h1>
        <p className="text-xl text-muted-foreground">{profile?.bio}</p>
      </div>

      {/* Social Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-500" />
              <p className="font-semibold">Instagram</p>
            </div>
            <p className="text-2xl font-bold mt-2">
              {profile?.instagramFollowers?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              <p className="font-semibold">YouTube</p>
            </div>
            <p className="text-2xl font-bold mt-2">
              {profile?.youtubeSubscribers?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-500" />
              <p className="font-semibold">Twitter</p>
            </div>
            <p className="text-2xl font-bold mt-2">
              {profile?.twitterFollowers?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <p className="font-semibold">Average Views</p>
            </div>
            <p className="text-2xl font-bold mt-2">
              {profile?.averageViews?.toLocaleString() || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Per Post</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Showcase */}
      {profile?.showcaseContent && (
        <Card>
          <CardHeader>
            <CardTitle>Content Showcase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {profile.showcaseContent.map((content, index) => (
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
    </div>
  );
}
