import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Youtube, Twitter, Hash, BadgeCheck } from "lucide-react";
import { format } from "date-fns";

interface VerificationStatus {
  verified: boolean;
  verifiedAt: string | null;
}

interface VerificationStatusResponse {
  instagram: VerificationStatus;
  youtube: VerificationStatus;
  twitter: VerificationStatus;
  tiktok: VerificationStatus;
}

const profileSchema = z.object({
  instagram: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  instagramFollowers: z.coerce.number().optional().nullable(),
  youtubeSubscribers: z.coerce.number().optional().nullable(),
  tiktokFollowers: z.coerce.number().optional().nullable(),
  twitterFollowers: z.coerce.number().optional().nullable(),
  averageViews: z.coerce.number().optional().nullable(),
  engagementRate: z.string().optional().nullable(),
  ratePerPost: z.string().optional().nullable(),
  availability: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface CreatorProfileEditorProps {
  initialData?: Partial<ProfileFormValues>;
}

export default function CreatorProfileEditor({ initialData }: CreatorProfileEditorProps) {
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      instagram: "",
      youtube: "",
      tiktok: "",
      twitter: "",
      instagramFollowers: null,
      youtubeSubscribers: null,
      tiktokFollowers: null,
      twitterFollowers: null,
      averageViews: null,
      engagementRate: "",
      ratePerPost: "",
      availability: true,
      ...initialData,
    },
  });

  const { data: verificationStatus } = useQuery<VerificationStatusResponse>({
    queryKey: ['/api/profile/verification-status'],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
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

  const verifyPlatformMutation = useMutation({
    mutationFn: async (platform: 'instagram' | 'youtube' | 'twitter' | 'tiktok') => {
      const res = await fetch(`/api/profile/verify/${platform}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
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

  const renderVerificationBadge = (platform: keyof VerificationStatusResponse) => {
    if (!verificationStatus?.[platform]) return null;

    const { verified, verifiedAt } = verificationStatus[platform];

    if (!verified) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => verifyPlatformMutation.mutate(platform)}
          disabled={!form.getValues(platform)}
        >
          Verify Account
        </Button>
      );
    }

    return (
      <Badge 
        className="ml-2" 
        variant="secondary"
        title={verifiedAt ? `Verified on ${format(new Date(verifiedAt), 'PPP')}` : 'Verified'}
      >
        <BadgeCheck className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  Instagram Handle
                  {renderVerificationBadge('instagram')}
                </FormLabel>
                <FormControl>
                  <Input placeholder="@username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="youtube"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  YouTube Channel
                  {renderVerificationBadge('youtube')}
                </FormLabel>
                <FormControl>
                  <Input placeholder="channel-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-blue-500" />
                  Twitter Handle
                  {renderVerificationBadge('twitter')}
                </FormLabel>
                <FormControl>
                  <Input placeholder="@username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tiktok"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  TikTok Handle
                  {renderVerificationBadge('tiktok')}
                </FormLabel>
                <FormControl>
                  <Input placeholder="@username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="instagramFollowers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram Followers</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="youtubeSubscribers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>YouTube Subscribers</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twitterFollowers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter Followers</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tiktokFollowers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TikTok Followers</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="averageViews"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Average Views per Post</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ratePerPost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate per Post</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. $500-1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Available for Collaborations</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={updateProfileMutation.isPending}
        >
          Save Profile
        </Button>
      </form>
    </Form>
  );
}