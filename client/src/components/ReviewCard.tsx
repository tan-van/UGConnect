import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Review {
  id: number;
  rating: number;
  review: string;
  helpfulVotes: number;
  createdAt: string;
  client: {
    id: number;
    username: string;
    displayName: string;
  };
}

interface ReviewCardProps {
  review: Review;
  showHelpfulButton?: boolean;
}

export default function ReviewCard({ review, showHelpfulButton = true }: ReviewCardProps) {
  const queryClient = useQueryClient();

  const markHelpfulMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/creators/${review.client.id}/reviews`] });
    },
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">
              {review.client.displayName || review.client.username}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          {review.helpfulVotes > 0 && (
            <Badge variant="secondary" className="ml-2">
              {review.helpfulVotes} found this helpful
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{review.review}</p>
        {showHelpfulButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markHelpfulMutation.mutate()}
            disabled={markHelpfulMutation.isPending}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Helpful
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
