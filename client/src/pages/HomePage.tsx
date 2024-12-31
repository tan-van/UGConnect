
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, MessageSquare, Trophy } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Connect with Top Content Creators
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          UGConnect bridges the gap between brands and content creators, making collaboration seamless and efficient.
        </p>
        {!user && (
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/creators">
              <Button variant="outline" size="lg">Browse Creators</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Find Creators</CardTitle>
              </CardHeader>
              <CardContent>
                Discover talented content creators across various platforms and niches.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Briefcase className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Post Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                Create opportunities and find the perfect creator for your campaign.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Collaborate</CardTitle>
              </CardHeader>
              <CardContent>
                Communicate effectively and manage projects all in one place.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Trophy className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Succeed</CardTitle>
              </CardHeader>
              <CardContent>
                Achieve your marketing goals with the right partnerships.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
