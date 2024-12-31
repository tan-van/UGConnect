import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Facebook } from "lucide-react";
import { type Job } from "@db/schema";

interface ShareButtonsProps {
  job: Job & { client: { displayName: string } };
  className?: string;
}

export default function ShareButtons({ job, className }: ShareButtonsProps) {
  const baseUrl = window.location.origin;
  const jobUrl = `${baseUrl}/jobs/${job.id}`;
  const title = encodeURIComponent(job.title);
  const description = encodeURIComponent(`${job.client.displayName} is looking for a content creator for: ${job.title}`);

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${description}&url=${jobUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${jobUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${jobUrl}`,
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="flex-1 hover:text-[#1DA1F2]"
      >
        <Twitter className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="flex-1 hover:text-[#0A66C2]"
      >
        <Linkedin className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="flex-1 hover:text-[#1877F2]"
      >
        <Facebook className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  );
}