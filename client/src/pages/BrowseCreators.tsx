import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function BrowseCreators() {
  const { data: creators, isLoading } = useQuery({
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Browse Creators</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {creators?.map((creator) => (
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
