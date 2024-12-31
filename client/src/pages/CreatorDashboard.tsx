import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import CreatorProfileEditor from "@/components/CreatorProfileEditor";
import { Instagram, Youtube, Twitter } from "lucide-react";

export default function CreatorDashboard() {
  const { user } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/profile'],
  });

  useEffect(() => {
    if (user && !user.completedOnboarding) {
      setShowOnboarding(true);
    }
  }, [user]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <>
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        userRole="creator"
      />

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
              <CardTitle className="text-sm font-medium">
                Instagram Followers
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
              <CardTitle className="text-sm font-medium">
                YouTube Subscribers
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
              <CardTitle className="text-sm font-medium">
                Twitter Followers
              </CardTitle>
              <Twitter className="h-4 w-4 text-blue-500" />
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
    </>
  );
}