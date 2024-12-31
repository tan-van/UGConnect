import { useQuery } from "@tanstack/react-query";
import { Job } from "@db/schema";
import JobCard from "@/components/JobCard";
import SearchFilters from "@/components/SearchFilters";
import { useState } from "react";

export default function HomePage() {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    type: "",
    remote: false,
  });

  const { data: jobs, isLoading } = useQuery<(Job & { employer: { companyName: string } })[]>({
    queryKey: ["/api/jobs"],
  });

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesType = !filters.type || job.type === filters.type;
    const matchesRemote = !filters.remote || job.remote;

    return matchesSearch && matchesLocation && matchesType && matchesRemote;
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Find Your Next Opportunity</h1>
        <p className="text-muted-foreground">
          Browse through our curated list of opportunities
        </p>
      </div>

      <SearchFilters onFilter={setFilters} />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[300px] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {filteredJobs?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No jobs found matching your criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
}
