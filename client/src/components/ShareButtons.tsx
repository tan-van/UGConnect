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
    x: `https://x.com/intent/tweet?text=${description}&url=${jobUrl}`,
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
        onClick={() => handleShare('x')}
        className="flex-1 hover:text-black"
      >
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
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