import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Job } from "@db/schema";
import { Building2, MapPin, Timer } from "lucide-react";
import { Link } from "wouter";

interface JobCardProps {
  job: Job & { client: { displayName: string } };
  onApply?: () => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
            <div className="flex items-center text-muted-foreground text-sm">
              <Building2 className="h-4 w-4 mr-1" />
              {job.client.displayName}
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
              {job.location || 'No location specified'}
              {job.remote && " (Remote)"}
            </div>
            <div className="flex items-center">
              <Timer className="h-4 w-4 mr-1" />
              {job.type}
            </div>
            <Badge variant="outline" className="ml-auto">
              {job.budget}
            </Badge>
          </div>

          <p className="text-sm line-clamp-3">
            {job.description}
          </p>

          {job.requirements && job.requirements.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.requirements.map((req, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {req}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Link href={`/jobs/${job.id}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                View Details
              </Button>
            </Link>
            {onApply && (
              <Button onClick={onApply} className="flex-1">
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}