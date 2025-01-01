import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import JobCard from "@/components/JobCard";
import { Loader2 } from "lucide-react";
import type { Job } from "@db/schema";

interface JobWithClient extends Job {
  client: {
    displayName: string;
  };
}

export default function ClientDashboard() {
  const { user } = useUser();
  const { data: jobs, isLoading } = useQuery<JobWithClient[]>({
    
  const shouldShowTutorial = !jobs || jobs.length === 0;
    queryKey: ['/api/jobs', { clientId: user?.id?.toString() }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const searchParams = new URLSearchParams();
      if (params.clientId) {
        searchParams.append('clientId', params.clientId);
      }
      const response = await fetch(`/api/jobs?${searchParams}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <Link href="/jobs/create">
          <Button>Post New Job</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Find Creators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Browse our network of talented creators and start collaborating.
            </p>
            <Link href="/creators">
              <Button className="w-full">Browse Creators</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Posted Jobs</h2>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs?.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                You haven't posted any jobs yet. Create your first job listing to find creators!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs?.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}