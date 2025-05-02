import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const statusLabel = product.inStock 
    ? product.stockQuantity && product.stockQuantity <= 5 
      ? "Low Stock" 
      : "In Stock"
    : "Out of Stock";

  const statusClass = product.inStock
    ? product.stockQuantity && product.stockQuantity <= 5
      ? "bg-warning-500/10 text-warning-500"
      : "bg-success-500/10 text-success-500"
    : "bg-danger-500/10 text-danger-500";

  const deleteProductMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/products/${product.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="relative pt-[100%]">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="absolute inset-0 h-full w-full object-cover" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center rounded-full ${statusClass} px-2.5 py-0.5 text-xs font-medium`}>
              {statusLabel}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
          <p className="mt-1 text-xs text-gray-500">Ref: {product.reference}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-base font-semibold text-gray-900">{formatCurrency(product.price)}</p>
            <div className="flex space-x-2">
              <button 
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                onClick={() => onEdit(product)}
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button 
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-danger-500"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product &quot;{product.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ProductCard;
