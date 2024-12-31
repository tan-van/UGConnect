import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Job } from "@db/schema";
import { Building2, MapPin, Timer } from "lucide-react";
import { Link } from "wouter";

interface JobCardProps {
  job: Job & { employer: { companyName: string } };
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
            <div className="flex items-center text-muted-foreground text-sm">
              <Building2 className="h-4 w-4 mr-1" />
              {job.employer.companyName}
            </div>
          </div>
          {job.featured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {job.location}
              {job.remote && " (Remote)"}
            </div>
            <div className="flex items-center">
              <Timer className="h-4 w-4 mr-1" />
              {job.type}
            </div>
            {job.salary && (
              <Badge variant="outline">
                {job.salary}
              </Badge>
            )}
          </div>
          
          <p className="text-sm line-clamp-2">
            {job.description}
          </p>
          
          <Link href={`/jobs/${job.id}`}>
            <Button variant="secondary" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
