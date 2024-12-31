import { User, Job, Application } from "@db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

interface SeekerContentProps {
  applications?: (Application & {
    job: Job & {
      employer: { companyName: string };
    };
  })[];
  isLoading: boolean;
}

export default function SeekerContent({ applications, isLoading }: SeekerContentProps) {
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!applications?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          You haven't applied to any jobs yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Applications</h2>
      <div className="grid gap-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{application.job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4" />
                    {application.job.employer.companyName}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    application.status === "accepted"
                      ? "secondary"
                      : application.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {application.job.location}
                  {application.job.remote && " (Remote)"}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Applied on {format(new Date(application.createdAt), "PPP")}
                </div>
              </div>
              {application.coverLetter && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Cover Letter</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {application.coverLetter}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
