import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import JobCard from "@/components/JobCard";
import { useState } from "react";

const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().min(1, "Requirements are required"),
  budget: z.string().min(1, "Budget is required"),
  location: z.string().optional(),
  remote: z.boolean().default(false),
  type: z.enum(["one-time", "ongoing"]),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function CreateJob() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      remote: false,
      type: "one-time",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (values: JobFormValues) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          requirements: values.requirements.split("\n").filter(Boolean),
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job posted successfully",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: JobFormValues) {
    createJobMutation.mutate(values);
  }

  const previewJob = {
    ...form.getValues(),
    id: 0,
    requirements: form.getValues().requirements.split("\n").filter(Boolean),
    featured: false,
    status: "open" as const,
    createdAt: new Date(),
    client: {
      displayName: "You",
    },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
        <p className="text-muted-foreground">
          Create a new job listing for content creators
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Looking for Gaming Content Creator" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the job requirements, responsibilities, and expectations..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requirements</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="List each requirement on a new line..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter each requirement on a new line
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., $500 per video, $2000-3000/month" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., New York, NY" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remote"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Remote Work</FormLabel>
                  <FormDescription>
                    Can this job be done remotely?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={field.value === "one-time" ? "default" : "outline"}
                    onClick={() => field.onChange("one-time")}
                  >
                    One-time
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "ongoing" ? "default" : "outline"}
                    onClick={() => field.onChange("ongoing")}
                  >
                    Ongoing
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Preview Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Job Post Preview</DialogTitle>
                </DialogHeader>
                <JobCard job={previewJob} />
              </DialogContent>
            </Dialog>

            <Button 
              type="submit" 
              className="flex-1"
              disabled={createJobMutation.isPending}
            >
              {createJobMutation.isPending ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}