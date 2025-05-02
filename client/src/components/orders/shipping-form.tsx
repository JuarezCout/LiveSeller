import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShippingAddressSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface ShippingFormProps {
  orderId: number;
  clientId: number;
  onSubmitComplete?: () => void;
  defaultValues?: z.infer<typeof ShippingAddressSchema>;
}

export function ShippingForm({
  orderId,
  clientId,
  onSubmitComplete,
  defaultValues,
}: ShippingFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof ShippingAddressSchema>>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: defaultValues || {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      notes: "",
    },
  });
  
  const submitShippingMutation = useMutation({
    mutationFn: (data: z.infer<typeof ShippingAddressSchema>) => {
      return apiRequest(
        "POST",
        `/api/clients/${clientId}/orders/${orderId}/shipping`,
        data
      );
    },
    onSuccess: () => {
      toast({
        title: "Shipping information saved",
        description: "Your shipping details have been saved successfully.",
      });
      if (onSubmitComplete) {
        onSubmitComplete();
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to save shipping information",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof ShippingAddressSchema>) => {
    submitShippingMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Maria Alvarez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Miami" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP / Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="33101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special instructions for delivery"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {submitShippingMutation.isError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {submitShippingMutation.error.message}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-6">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={submitShippingMutation.isPending}
          >
            {submitShippingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Shipping Information"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ShippingForm;
