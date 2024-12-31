import { useQuery } from "@tanstack/react-query";
import { User, Job, Application } from "@db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { Building2, Mail, User as UserIcon } from "lucide-react";
import EmployerDashboard from "@/components/EmployerDashboard";
import SeekerContent from "@/components/SeekerContent";

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
        <EmployerDashboard applications={applications} isLoading={isLoadingApplications} />
      ) : (
        <SeekerContent applications={applications} isLoading={isLoadingApplications} />
      )}
    </div>
  );
}