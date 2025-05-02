import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  X, 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ClientBagList, QuickAddForm } from "@/components/live-sessions/client-bag";
import { formatDateTime, formatTimeAgo } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { generateOrderSummary } from "@/utils/image-generator";

export default function LiveSessionDetail() {
  const { id } = useParams();
  const sessionId = parseInt(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEndSessionDialogOpen, setIsEndSessionDialogOpen] = useState(false);
  const [isViewBagDialogOpen, setIsViewBagDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [summaryGenerating, setSummaryGenerating] = useState(false);
  
  // Fetch session details
  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: [`/api/live-sessions/${sessionId}`],
    enabled: !isNaN(sessionId),
  });
  
  // Fetch client data and order items when a client bag is viewed
  const { data: clientBagData, isLoading: isLoadingClientBag } = useQuery({
    queryKey: [`/api/clients/${selectedClientId}/orders`],
    enabled: !!selectedClientId && isViewBagDialogOpen,
    select: async (orders) => {
      // Find the order for this session
      const sessionOrder = orders.find((order: any) => order.liveSessionId === sessionId);
      
      if (!sessionOrder) return null;
      
      // Fetch order items with product info
      const itemsResponse = await fetch(`/api/orders/${sessionOrder.id}/items`, {
        credentials: 'include',
      });
      
      if (!itemsResponse.ok) return { order: sessionOrder, items: [] };
      
      const items = await itemsResponse.json();
      return { order: sessionOrder, items };
    }
  });
  
  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: () => {
      return apiRequest("POST", `/api/live-sessions/${sessionId}/end`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/live-sessions/${sessionId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/live-sessions'] });
      setIsEndSessionDialogOpen(false);
      toast({
        title: "Session ended",
        description: "The live session has been ended successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to end session",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleViewBag = (clientId: number) => {
    setSelectedClientId(clientId);
    setIsViewBagDialogOpen(true);
  };
  
  const handleGenerateSummary = async (clientId: number) => {
    try {
      setSummaryGenerating(true);
      
      // Fetch the order summary data
      const clientOrders: any[] = await queryClient.fetchQuery({
        queryKey: [`/api/clients/${clientId}/orders`],
      });
      
      const order = clientOrders.find((order) => order.liveSessionId === sessionId);
      
      if (!order) {
        throw new Error("Order not found");
      }
      
      // Fetch order items with product info
      const itemsResponse = await fetch(`/api/orders/${order.id}/items`, {
        credentials: 'include',
      });
      
      if (!itemsResponse.ok) {
        throw new Error("Failed to fetch order items");
      }
      
      const items = await itemsResponse.json();
      
      // Generate summary
      await generateOrderSummary(order, items);
      
      toast({
        title: "Summary generated",
        description: "The order summary has been generated and saved.",
      });
    } catch (error) {
      toast({
        title: "Failed to generate summary",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSummaryGenerating(false);
    }
  };
  
  if (isNaN(sessionId)) {
    return <div>Invalid session ID</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation("/live-sessions")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sessions
        </Button>
      </div>
      
      {/* Session Info Section */}
      <div>
        {isLoadingSession ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ) : session ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">{session.title}</h4>
              <p className="text-sm text-gray-500">
                {session.isActive 
                  ? `Started ${formatTimeAgo(session.startedAt)}` 
                  : `Ended ${formatTimeAgo(session.endedAt)}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {session.isActive ? (
                <>
                  <span className="inline-flex items-center rounded-full bg-success-500/10 px-2.5 py-1 text-xs font-medium text-success-500">
                    <span className="relative mr-1.5 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500"></span>
                    </span>
                    Active
                  </span>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setIsEndSessionDialogOpen(true)}
                  >
                    End Session
                  </Button>
                </>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  Ended on {formatDateTime(session.endedAt)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 text-center text-red-500">
            Session not found
          </div>
        )}
      </div>
      
      {/* Quick Add Section - Only show if session is active */}
      {session && session.isActive && (
        <QuickAddForm sessionId={sessionId} />
      )}
      
      {/* Client Bags Section */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Client Bags</h4>
        <ClientBagList 
          sessionId={sessionId}
          onViewBag={handleViewBag}
          onGenerateSummary={handleGenerateSummary}
        />
      </div>
      
      {/* End Session Dialog */}
      <Dialog open={isEndSessionDialogOpen} onOpenChange={setIsEndSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Live Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this live session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEndSessionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => endSessionMutation.mutate()}
              disabled={endSessionMutation.isPending}
            >
              {endSessionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending...
                </>
              ) : (
                "End Session"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Bag Dialog */}
      <Dialog open={isViewBagDialogOpen} onOpenChange={setIsViewBagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Client Bag</DialogTitle>
            <DialogDescription>
              Items reserved during this live session
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingClientBag ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : clientBagData && clientBagData.items ? (
            <div className="max-h-[60vh] overflow-y-auto py-4">
              {clientBagData.items.length > 0 ? (
                <div className="space-y-4">
                  {clientBagData.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 rounded-md border p-2">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                        {item.product?.imageUrl ? (
                          <img 
                            src={item.product.imageUrl} 
                            alt={item.product.name} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100">
                            <span className="text-xs text-gray-400">No img</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">Ref: {item.product?.reference}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 rounded-md bg-gray-50 p-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="text-sm font-medium">
                        ${clientBagData.order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No items in this client's bag
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No items found for this client
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewBagDialogOpen(false)}
            >
              Close
            </Button>
            {clientBagData && clientBagData.items && clientBagData.items.length > 0 && (
              <Button
                onClick={() => {
                  if (selectedClientId) {
                    handleGenerateSummary(selectedClientId);
                    setIsViewBagDialogOpen(false);
                  }
                }}
                disabled={summaryGenerating}
              >
                {summaryGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
