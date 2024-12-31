import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ClientDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Client Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Find Creators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Browse our network of talented creators and start collaborating.
            </p>
            <Link href="/creators">
              <Button className="w-full">Browse Creators</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
