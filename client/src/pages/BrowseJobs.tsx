import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Job } from "@db/schema";
import { useState } from "react";

interface JobWithClient extends Job {
  client: {
    displayName: string;
  };
}

export default function BrowseJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobType, setJobType] = useState<string>("all");

  const { data: jobs, isLoading } = useQuery<JobWithClient[]>({
    queryKey: ['/api/jobs', { type: jobType }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const searchParams = new URLSearchParams(params as Record<string, string>);
      const response = await fetch(`/api/jobs?${searchParams}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    },
  });

  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Browse Opportunities</h1>
        <p className="text-muted-foreground">
          Find and apply to creator opportunities that match your expertise
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Search jobs..." 
          className="flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="one-time">One-time</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredJobs?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs found matching your criteria</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs?.map((job) => (
            <JobCard 
              key={job.id} 
              job={job}
              onApply={() => {
                // Will implement application modal/form later
                console.log('Apply to job:', job.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}