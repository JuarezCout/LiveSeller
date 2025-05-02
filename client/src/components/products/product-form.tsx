import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Extend the product schema with validation
const formSchema = insertProductSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  reference: z.string().min(2, "Reference must be at least 2 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
});

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any; // The product to edit, if any
}

export function ProductForm({
  open,
  onOpenChange,
  product,
}: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(product?.imageUrl || null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const isEditing = !!product;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: product || {
      name: "",
      reference: "",
      description: "",
      price: 0,
      category: "Dresses",
      inStock: true,
      stockQuantity: 0,
    },
  });
  
  const createProductMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/products", {
        ...data,
        imageUrl,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product created",
        description: "The product has been created successfully.",
      });
      form.reset();
      setImageUrl(null);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateProductMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return apiRequest("PUT", `/api/products/${product.id}`, {
        ...data,
        imageUrl,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product updated",
        description: "The product has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleUploadSuccess = (url: string) => {
    setImageUrl(url);
  };
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditing) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };
  
  const isPending = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your product details below."
              : "Add a new product to your inventory."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <FormLabel>Product Photo</FormLabel>
                <FileUpload
                  endpoint="/api/products/upload"
                  onUploadSuccess={handleUploadSuccess}
                  value={imageUrl}
                  className="mt-2"
                />
              </div>
              
              <div className="sm:col-span-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Dresses">Dresses</SelectItem>
                          <SelectItem value="Blouses">Blouses</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                          <SelectItem value="Shoes">Shoes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-7"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="sm:col-span-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "true")} 
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">In Stock</SelectItem>
                          <SelectItem value="false">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Product"
                  : "Save Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductForm;
