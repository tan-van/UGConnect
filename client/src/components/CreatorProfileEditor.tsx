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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck } from "lucide-react";
import { format } from "date-fns";
import { SiInstagram, SiYoutube, SiTiktok } from "react-icons/si";

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
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  instagramFollowers: z.coerce.number().optional(),
  youtubeSubscribers: z.coerce.number().optional(),
  tiktokFollowers: z.coerce.number().optional(),
  twitterFollowers: z.coerce.number().optional(),
  averageViews: z.coerce.number().optional(),
  engagementRate: z.string().optional(),
  ratePerPost: z.string().optional(),
  contentCategories: z.array(z.string()).default([]),
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
      instagram: initialData?.instagram || "",
      youtube: initialData?.youtube || "",
      tiktok: initialData?.tiktok || "",
      twitter: initialData?.twitter || "",
      instagramFollowers: initialData?.instagramFollowers || undefined,
      youtubeSubscribers: initialData?.youtubeSubscribers || undefined,
      tiktokFollowers: initialData?.tiktokFollowers || undefined,
      twitterFollowers: initialData?.twitterFollowers || undefined,
      averageViews: initialData?.averageViews || undefined,
      engagementRate: initialData?.engagementRate || "",
      ratePerPost: initialData?.ratePerPost || "",
      availability: initialData?.availability ?? true,
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
        throw new Error(await res.text());
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
      <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-8">
        {/* Social Media Connections */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <SiInstagram className="h-4 w-4 text-pink-500" />
                      Instagram Handle
                      {renderVerificationBadge('instagram')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} value={field.value || ''} />
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
                      <SiYoutube className="h-4 w-4 text-red-500" />
                      YouTube Channel
                      {renderVerificationBadge('youtube')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="channel-name" {...field} value={field.value || ''} />
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
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X Handle
                      {renderVerificationBadge('twitter')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} value={field.value || ''} />
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
                      <SiTiktok className="h-4 w-4" />
                      TikTok Handle
                      {renderVerificationBadge('tiktok')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audience Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Audience Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="instagramFollowers"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Instagram Followers</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtubeSubscribers"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>YouTube Subscribers</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitterFollowers"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Twitter Followers</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktokFollowers"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>TikTok Followers</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Content Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="contentCategories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories (comma-separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Gaming, Technology, Reviews" 
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => {
                        const categories = e.target.value
                          .split(',')
                          .map(cat => cat.trim())
                          .filter(cat => cat.length > 0);
                        field.onChange(categories);
                      }}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Add categories that best describe your content
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((category, index) => (
                      <Badge 
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          const newCategories = field.value?.filter((_, i) => i !== index);
                          field.onChange(newCategories);
                        }}
                      >
                        {category}
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="averageViews"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Average Views per Post</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                      <Input placeholder="e.g. $500-1000" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Availability Status */}
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="w-[200px]"
            disabled={updateProfileMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}