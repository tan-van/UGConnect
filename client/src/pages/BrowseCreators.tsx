import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface Creator {
  id: number;
  username: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
}

export default function BrowseCreators() {
  const { data: creators, isLoading } = useQuery<Creator[]>({
    queryKey: ['/api/creators'],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (!creators) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">No creators found</h2>
        <p className="text-muted-foreground mt-2">
          Check back later for new creators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Browse Creators</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {creators.map((creator) => (
          <Link key={creator.id} href={`/creators/${creator.username}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{creator.displayName || creator.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {creator.bio || 'No bio provided'}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}