import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import ReviewCard from "./ReviewCard";

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

interface ReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

interface ReviewsListProps {
  creatorId: number;
  onReviewClick?: () => void;
  showReviewButton?: boolean;
}

export default function ReviewsList({ creatorId, onReviewClick, showReviewButton = true }: ReviewsListProps) {
  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey: [`/api/creators/${creatorId}/reviews`],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { reviews, averageRating, totalReviews } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div>
                <div className="flex mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            {showReviewButton && (
              <Button onClick={onReviewClick}>Write a Review</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No reviews yet. Be the first to review!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
