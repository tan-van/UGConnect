
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Job } from "@db/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { Building2, MapPin, Timer, Calendar, Pencil, Trash } from "lucide-react";
import { format } from "date-fns";

export default function JobListingPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");

  const { data: job, isLoading, error } = useQuery<Job>({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${id}`);
      const contentType = res.headers.get('content-type');
      
      if (!res.ok || !contentType?.includes('application/json')) {
        throw new Error('Failed to fetch job details');
      }
      
      const data = await res.json();
      if (!data) throw new Error('No job data found');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete job');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Job deleted successfully" });
      setLocation('/jobs');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading job details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading job: {error.message}</div>;
  }

  if (!job) {
    return <div className="p-8 text-center">Job not found</div>;
  }

  const isOwner = user?.id === job.clientId;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h1 className="text-4xl font-bold">{job.title}</h1>
          {isOwner && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setLocation(`/jobs/${id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            {job.clientId}
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

        {job.budget && (
          <>
            <h2>Budget</h2>
            <p>{job.budget}</p>
          </>
        )}
      </div>

      {user?.role === 'creator' && (
        <div className="space-y-4 border-t pt-8">
          <h2 className="text-2xl font-bold">Apply for this position</h2>
          <textarea
            placeholder="Write your cover letter..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full min-h-[200px] p-4 border rounded-md"
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
