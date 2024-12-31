import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import OnboardingTutorial from "@/components/OnboardingTutorial";

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

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {profile?.bio || "Add your bio to help clients learn more about you"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}