import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLiveSessionSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Extend the session schema with validation
const formSchema = insertLiveSessionSchema.extend({
  title: z.string().min(2, "Title must be at least 2 characters"),
});

interface SessionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (sessionId: number) => void;
}

export function SessionForm({
  open,
  onOpenChange,
  onSuccess,
}: SessionFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      isActive: true,
    },
  });
  
  const createSessionMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/live-sessions", data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      await queryClient.invalidateQueries({ queryKey: ['/api/live-sessions'] });
      toast({
        title: "Live session created",
        description: "Your live session has been created successfully.",
      });
      form.reset();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(data.id);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create live session",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createSessionMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Live Session</DialogTitle>
          <DialogDescription>
            Start a new live streaming session to showcase and sell your products.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Collection 2023" {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Details about the products you'll showcase in this session"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSessionMutation.isPending}>
                {createSessionMutation.isPending ? "Creating..." : "Start Live Session"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default SessionForm;
