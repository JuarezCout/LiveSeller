import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ClientBagProps {
  sessionId: number;
  clientId: number;
  clientName: string;
  itemCount: number;
  onViewBag: (clientId: number) => void;
  onGenerateSummary: (clientId: number) => void;
}

export function ClientBag({
  sessionId,
  clientId,
  clientName,
  itemCount,
  onViewBag,
  onGenerateSummary,
}: ClientBagProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <AvatarFallback>{getInitials(clientName)}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">{clientName}</p>
            <p className="text-sm text-gray-500">{itemCount} items</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewBag(clientId)}
            className="text-xs"
          >
            View Bag
          </Button>
          <Button 
            size="sm" 
            onClick={() => onGenerateSummary(clientId)}
            className="text-xs"
          >
            Generate Summary
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ClientBagListProps {
  sessionId: number;
  onViewBag: (clientId: number) => void;
  onGenerateSummary: (clientId: number) => void;
}

export function ClientBagList({
  sessionId,
  onViewBag,
  onGenerateSummary,
}: ClientBagListProps) {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: [`/api/live-sessions/${sessionId}/orders`],
    enabled: !!sessionId,
  });
  
  if (isLoading) {
    return (
      <div className="divide-y divide-gray-200 rounded-md border">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load client bags
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-sm text-gray-500">No clients have items in their bag yet.</p>
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-200 rounded-md border">
      {orders.map((order: any) => (
        <ClientBag
          key={order.id}
          sessionId={sessionId}
          clientId={order.clientId}
          clientName={order.client?.name || "Unknown Client"}
          itemCount={order.itemCount || 0}
          onViewBag={onViewBag}
          onGenerateSummary={onGenerateSummary}
        />
      ))}
    </div>
  );
}

interface QuickAddFormProps {
  sessionId: number;
}

export function QuickAddForm({ sessionId }: QuickAddFormProps) {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
  });
  
  const addToBagMutation = useMutation({
    mutationFn: async () => {
      // Check if client has an existing order for this session
      const clientOrders: any[] = await queryClient.fetchQuery({
        queryKey: [`/api/live-sessions/${sessionId}/orders`],
      });
      
      const existingOrder = clientOrders?.find(
        (order) => order.clientId === parseInt(selectedClient)
      );
      
      const product = products?.find((p: any) => p.id === parseInt(selectedProduct));
      
      if (!product) {
        throw new Error("Product not found");
      }
      
      if (existingOrder) {
        // Add item to existing order
        return apiRequest("POST", `/api/orders/${existingOrder.id}/items`, {
          productId: parseInt(selectedProduct),
          quantity: 1,
          price: product.price,
        });
      } else {
        // Create new order with item
        return apiRequest("POST", "/api/orders", {
          clientId: parseInt(selectedClient),
          liveSessionId: sessionId,
          status: "reserved",
          totalAmount: product.price,
          shippingFee: 0,
          items: [
            {
              productId: parseInt(selectedProduct),
              quantity: 1,
              price: product.price,
            },
          ],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/live-sessions/${sessionId}/orders`] 
      });
      toast({
        title: "Added to bag",
        description: "The product has been added to the client's bag.",
      });
      setSelectedProduct("");
    },
    onError: (error) => {
      toast({
        title: "Failed to add to bag",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAddToBag = () => {
    if (!selectedClient) {
      toast({
        title: "No client selected",
        description: "Please select a client.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedProduct) {
      toast({
        title: "No product selected",
        description: "Please select a product.",
        variant: "destructive",
      });
      return;
    }
    
    addToBagMutation.mutate();
  };
  
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <h4 className="mb-3 text-sm font-medium text-gray-700">Quick Add to Client Bag</h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="clientSelect" className="block text-xs font-medium text-gray-700">
            Client
          </label>
          <select
            id="clientSelect"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary-500 focus:outline-none"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={isLoadingClients || addToBagMutation.isPending}
          >
            <option value="">Select client...</option>
            {clients?.map((client: any) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="productSelect" className="block text-xs font-medium text-gray-700">
            Product Reference
          </label>
          <select
            id="productSelect"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary-500 focus:outline-none"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={isLoadingProducts || addToBagMutation.isPending}
          >
            <option value="">Select product...</option>
            {products?.map((product: any) => (
              <option key={product.id} value={product.id}>
                {product.reference}: {product.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <Button
            onClick={handleAddToBag}
            disabled={addToBagMutation.isPending}
            className="inline-flex w-full items-center justify-center"
          >
            {addToBagMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add to Bag
          </Button>
        </div>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default {
  ClientBag,
  ClientBagList,
  QuickAddForm,
};
