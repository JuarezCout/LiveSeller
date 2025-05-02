import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download, Eye, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/orders/order-status";
import { OrderItemsList, OrderPriceSummary } from "@/components/orders/order-item";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrderStatus, ShippingAddress } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isShippingLabelOpen, setIsShippingLabelOpen] = useState(false);
  const [shippingLabel, setShippingLabel] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
    select: (data) => {
      // Sort by creation date (newest first)
      return [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  });
  
  // Fetch order details when selected
  const { data: orderDetails, isLoading: isLoadingOrderDetails } = useQuery({
    queryKey: [`/api/orders/${selectedOrder?.id}`],
    enabled: !!selectedOrder && isOrderDetailOpen,
  });
  
  // Fetch order items
  const { data: orderItems, isLoading: isLoadingOrderItems } = useQuery({
    queryKey: [`/api/orders/${selectedOrder?.id}/items`],
    enabled: !!selectedOrder && isOrderDetailOpen,
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number, status: string }) => {
      return apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${selectedOrder?.id}`] });
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Generate shipping label mutation
  const generateShippingLabelMutation = useMutation({
    mutationFn: (orderId: number) => {
      return apiRequest("GET", `/api/orders/${orderId}/shipping-label`);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setShippingLabel(data);
      setIsShippingLabelOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to generate shipping label",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };
  
  const handleUpdateStatus = (status: string) => {
    if (!selectedOrder) return;
    
    updateOrderStatusMutation.mutate({
      orderId: selectedOrder.id,
      status,
    });
  };
  
  const handleGenerateShippingLabel = () => {
    if (!selectedOrder) return;
    
    if (!selectedOrder.shippingAddress) {
      toast({
        title: "Missing shipping address",
        description: "This order doesn't have a shipping address yet.",
        variant: "destructive",
      });
      return;
    }
    
    generateShippingLabelMutation.mutate(selectedOrder.id);
  };
  
  // Filter orders
  const filteredOrders = orders
    ? orders.filter((order) => {
        // Search filter (by client name or order ID)
        const matchesSearch =
          searchQuery === "" ||
          (order.client?.name && order.client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          order.id.toString().includes(searchQuery);
        
        // Status filter
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Manage customer orders and shipments</p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by client name or order ID"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={OrderStatus.RESERVED}>Reserved</SelectItem>
              <SelectItem value={OrderStatus.PAID}>Paid</SelectItem>
              <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
              <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
              <SelectItem value={OrderStatus.CANCELED}>Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-9 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(order.client?.name || "User")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{order.client?.name || "Unknown Client"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              {selectedOrder ? formatDateTime(selectedOrder.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingOrderDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : orderDetails ? (
            <div className="grid gap-6 py-4">
              {/* Order Status */}
              <div className="rounded-md border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Status</h3>
                  <OrderStatusBadge status={orderDetails.status} />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {orderDetails.status !== OrderStatus.CANCELED && (
                    <>
                      {orderDetails.status === OrderStatus.RESERVED && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleUpdateStatus(OrderStatus.PAID)}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          <Package className="mr-1 h-3 w-3" />
                          Mark as Paid
                        </Button>
                      )}
                      
                      {orderDetails.status === OrderStatus.PAID && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleUpdateStatus(OrderStatus.SHIPPED)}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          <Truck className="mr-1 h-3 w-3" />
                          Mark as Shipped
                        </Button>
                      )}
                      
                      {orderDetails.status === OrderStatus.SHIPPED && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleUpdateStatus(OrderStatus.DELIVERED)}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          <Package className="mr-1 h-3 w-3" />
                          Mark as Delivered
                        </Button>
                      )}
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleUpdateStatus(OrderStatus.CANCELED)}
                        disabled={updateOrderStatusMutation.isPending}
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                  
                  {/* Shipping Label Button */}
                  {(orderDetails.status === OrderStatus.PAID || 
                   orderDetails.status === OrderStatus.SHIPPED) && 
                   orderDetails.shippingAddress && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs ml-auto"
                      onClick={handleGenerateShippingLabel}
                      disabled={generateShippingLabelMutation.isPending}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      {generateShippingLabelMutation.isPending ? "Generating..." : "Shipping Label"}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <div className="rounded-md border p-4">
                <h3 className="mb-3 text-sm font-medium text-gray-700">Order Items</h3>
                <div className="divide-y divide-gray-200">
                  {isLoadingOrderItems ? (
                    [...Array(3)].map((_, i) => (
                      <div className="flex items-center justify-between py-3" key={i}>
                        <div className="flex items-center">
                          <Skeleton className="h-16 w-16 rounded-md" />
                          <div className="ml-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="mt-1 h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))
                  ) : orderItems && orderItems.length > 0 ? (
                    <OrderItemsList items={orderItems} />
                  ) : (
                    <div className="py-3 text-center">
                      <p className="text-sm text-gray-500">No items in this order</p>
                    </div>
                  )}
                  
                  {/* Order Summary */}
                  {orderDetails && (
                    <OrderPriceSummary
                      subtotal={orderDetails.totalAmount - orderDetails.shippingFee}
                      shippingFee={orderDetails.shippingFee}
                    />
                  )}
                </div>
              </div>
              
              {/* Payment and Shipping Information */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Payment Information */}
                <div className="rounded-md border p-4">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">Payment Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Status: <span className="font-medium">{orderDetails.status === OrderStatus.RESERVED ? "Awaiting Payment" : "Paid"}</span>
                    </p>
                    {orderDetails.paymentProofUrl && (
                      <div>
                        <p className="mb-1 text-sm text-gray-600">Payment Proof:</p>
                        <div className="max-h-32 overflow-hidden rounded-md border">
                          <img 
                            src={orderDetails.paymentProofUrl} 
                            alt="Payment proof" 
                            className="w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Shipping Information */}
                <div className="rounded-md border p-4">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">Shipping Information</h3>
                  {orderDetails.shippingAddress ? (
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span> {(orderDetails.shippingAddress as ShippingAddress).fullName}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span> {(orderDetails.shippingAddress as ShippingAddress).phone}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Address:</span> {(orderDetails.shippingAddress as ShippingAddress).address}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">City:</span> {(orderDetails.shippingAddress as ShippingAddress).city}, {(orderDetails.shippingAddress as ShippingAddress).zipCode}
                      </p>
                      {(orderDetails.shippingAddress as ShippingAddress).notes && (
                        <p className="text-sm">
                          <span className="font-medium">Notes:</span> {(orderDetails.shippingAddress as ShippingAddress).notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No shipping information provided yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-red-500">
              Failed to load order details
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOrderDetailOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Shipping Label Dialog */}
      <Dialog open={isShippingLabelOpen} onOpenChange={setIsShippingLabelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shipping Label</DialogTitle>
            <DialogDescription>
              Print this label and attach it to the package.
            </DialogDescription>
          </DialogHeader>
          
          {shippingLabel ? (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-6">
                <div className="mb-4 border-b pb-4 text-center">
                  <h3 className="text-lg font-bold">SHIPPING LABEL</h3>
                  <p className="text-sm">Order #{shippingLabel.orderId}</p>
                  <p className="mt-1 text-xs">Tracking: {shippingLabel.trackingNumber}</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Ship To:</p>
                    <p className="font-medium">{shippingLabel.shippingAddress.fullName}</p>
                    <p>{shippingLabel.shippingAddress.address}</p>
                    <p>{shippingLabel.shippingAddress.city}, {shippingLabel.shippingAddress.zipCode}</p>
                    <p>Phone: {shippingLabel.shippingAddress.phone}</p>
                  </div>
                  
                  {shippingLabel.shippingAddress.notes && (
                    <div className="mt-2 rounded-md bg-gray-50 p-2 text-sm">
                      <p className="font-medium">Notes:</p>
                      <p>{shippingLabel.shippingAddress.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Button className="w-full" onClick={() => window.print()}>
                <Download className="mr-2 h-4 w-4" />
                Print Label
              </Button>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              Failed to generate shipping label
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
