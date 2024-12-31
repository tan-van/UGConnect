import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Job, Application, User } from "@db/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface EmployerDashboardProps {
  applications?: (Application & {
    job: Job;
    seeker?: User;
  })[];
  isLoading: boolean;
}

export default function EmployerDashboard({ applications, isLoading }: EmployerDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="font-medium">{application.seeker?.username}</div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(application.createdAt), "PPP")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={application.status}
                          onValueChange={(value) =>
                            updateApplicationMutation.mutate({
                              applicationId: application.id,
                              status: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue>
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
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
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