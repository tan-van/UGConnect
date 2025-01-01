import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Job } from "@db/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Building2, MapPin, Timer, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function JobListingPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useUser();
  const [coverLetter, setCoverLetter] = useState("");

  const { data: job, isLoading } = useQuery<Job & { client: { displayName: string } }>({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error('Failed to fetch job');
      return res.json();
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      setCoverLetter("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !job) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{job.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            {job.client.displayName}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {job.location}
            {job.remote && " (Remote)"}
          </div>
          <div className="flex items-center">
            <Timer className="h-4 w-4 mr-2" />
            {job.type}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Posted {format(new Date(job.createdAt), 'PPP')}
          </div>
        </div>
      </div>

      <div className="prose max-w-none">
        <h2>Job Description</h2>
        <p>{job.description}</p>

        <h2>Requirements</h2>
        <p>{job.requirements}</p>

        {job.salary && (
          <>
            <h2>Compensation</h2>
            <p>{job.salary}</p>
          </>
        )}
      </div>

      {user?.role === 'seeker' && (
        <div className="space-y-4 border-t pt-8">
          <h2 className="text-2xl font-bold">Apply for this position</h2>
          <Textarea
            placeholder="Write your cover letter..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="min-h-[200px]"
          />
          <Button 
            onClick={() => applyMutation.mutate()}
            disabled={!coverLetter.trim() || applyMutation.isPending}
          >
            Submit Application
          </Button>
        </div>
      )}
    </div>
  );
}
