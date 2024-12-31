import { useQuery } from "@tanstack/react-query";
import { User, Job, Application } from "@db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { Building2, Mail, User as UserIcon, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const { user } = useUser();

  const { data: applications, isLoading: isLoadingApplications } = useQuery<(
    Application & {
      job: Job & { employer: { companyName: string } };
      seeker?: User;
    }
  )[]>({
    queryKey: ["/api/applications"],
  });

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Profile</CardTitle>
          <CardDescription>Manage your profile and activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <span>{user.username}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            {user.companyName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{user.companyName}</span>
              </div>
            )}
            <Badge variant="secondary" className="w-fit">
              {user.role === "employer" ? "Employer" : "Job Seeker"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Content based on user role */}
      {user.role === "employer" ? (
        <EmployerContent applications={applications} isLoading={isLoadingApplications} />
      ) : (
        <SeekerContent applications={applications} isLoading={isLoadingApplications} />
      )}
    </div>
  );
}

function EmployerContent({
  applications,
  isLoading,
}: {
  applications?: (Application & {
    job: Job;
    seeker?: User; // Make seeker optional since it might not be loaded
  })[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  // Group applications by job
  const applicationsByJob = applications?.reduce((acc, app) => {
    if (!acc[app.job.id]) {
      acc[app.job.id] = {
        job: app.job,
        applications: [],
      };
    }
    acc[app.job.id].applications.push(app);
    return acc;
  }, {} as Record<number, { job: Job; applications: typeof applications }>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Listings & Applications</h2>
        <Link href="/jobs/new">
          <Button>Post New Job</Button>
        </Link>
      </div>

      {!applications?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No applications received yet
          </CardContent>
        </Card>
      ) : (
        Object.values(applicationsByJob || {}).map(({ job, applications }) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {job.location}
                {job.remote && " (Remote)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>{application.seeker?.username}</TableCell>
                      <TableCell>
                        {format(new Date(application.createdAt), "PPP")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            application.status === "accepted"
                              ? "secondary" // Changed from success to secondary
                              : application.status === "rejected"
                              ? "destructive"
                              : "outline" // Changed from secondary to outline for pending
                          }
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function SeekerContent({
  applications,
  isLoading,
}: {
  applications?: (Application & {
    job: Job & {
      employer: { companyName: string };
    };
  })[];
  isLoading: boolean;
}) {
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
                      ? "secondary" // Changed from success to secondary
                      : application.status === "rejected"
                      ? "destructive"
                      : "outline" // Changed from secondary to outline for pending
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