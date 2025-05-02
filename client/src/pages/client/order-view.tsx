import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { 
  OrderItemsList, 
  OrderPriceSummary 
} from "@/components/orders/order-item";
import { 
  OrderStatusBadge, 
  OrderStatusProgress 
} from "@/components/orders/order-status";
import { PaymentForm } from "@/components/orders/payment-form";
import { ShippingForm } from "@/components/orders/shipping-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ClientOrderView() {
  const { client } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    [key: number]: { payment: boolean; shipping: boolean }
  }>({});
  
  // Fetch client orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: [`/api/clients/${client?.id}/orders`],
    enabled: !!client,
  });
  
  // Fetch order items for selected order
  const { data: orderItems, isLoading: isLoadingOrderItems } = useQuery({
    queryKey: [`/api/orders/${selectedOrderId}/items`],
    enabled: !!selectedOrderId,
  });
  
  const handleOrderClick = (orderId: number) => {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
    } else {
      setSelectedOrderId(orderId);
      // Initialize expanded sections state if it doesn't exist
      if (!expandedSections[orderId]) {
        setExpandedSections({
          ...expandedSections,
          [orderId]: { payment: true, shipping: true }
        });
      }
    }
  };
  
  const toggleSection = (orderId: number, section: 'payment' | 'shipping') => {
    setExpandedSections({
      ...expandedSections,
      [orderId]: {
        ...expandedSections[orderId],
        [section]: !expandedSections[orderId]?.[section]
      }
    });
  };
  
  const handlePaymentComplete = () => {
    // Refetch orders to update the status
    window.location.reload();
  };
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">My Orders</h2>
        <p className="text-sm text-gray-500">View and manage your purchases</p>
      </div>
      
      {isLoadingOrders ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="mt-1 h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
              <div className="p-6">
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="overflow-hidden rounded-lg bg-white shadow">
              <div 
                className="border-b border-gray-200 bg-white px-6 py-4 cursor-pointer"
                onClick={() => handleOrderClick(order.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      {order.liveSessionId && `From Live Session #${order.liveSessionId}`} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              </div>
              
              {selectedOrderId === order.id && (
                <div className="border-b border-gray-200 px-6 py-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Order Summary</h4>
                  <div className="divide-y divide-gray-200">
                    {isLoadingOrderItems ? (
                      [...Array(2)].map((_, i) => (
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
                    ) : orderItems ? (
                      <>
                        <OrderItemsList items={orderItems} />
                        <OrderPriceSummary 
                          subtotal={order.totalAmount - (order.shippingFee || 0)} 
                          shippingFee={order.shippingFee || 0} 
                        />
                      </>
                    ) : (
                      <div className="py-3 text-center">
                        <p className="text-sm text-gray-500">Failed to load order items</p>
                      </div>
                    )}
                  </div>
                  
                  <OrderStatusProgress status={order.status} />
                </div>
              )}
              
              {selectedOrderId === order.id && order.status === 'reserved' && (
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Payment Information</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleSection(order.id, 'payment')}
                    >
                      {expandedSections[order.id]?.payment ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {expandedSections[order.id]?.payment && (
                    <PaymentForm 
                      orderId={order.id} 
                      clientId={client!.id}
                      onPaymentComplete={handlePaymentComplete}
                    />
                  )}
                </div>
              )}
              
              {selectedOrderId === order.id && (
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Shipping Information</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleSection(order.id, 'shipping')}
                    >
                      {expandedSections[order.id]?.shipping ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {expandedSections[order.id]?.shipping && (
                    order.shippingAddress ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-gray-50 p-4 rounded-md">
                        <div>
                          <p className="text-sm font-medium">Full Name</p>
                          <p className="text-sm text-gray-500">{order.shippingAddress.fullName}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Phone Number</p>
                          <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <p className="text-sm font-medium">Address</p>
                          <p className="text-sm text-gray-500">{order.shippingAddress.address}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">City</p>
                          <p className="text-sm text-gray-500">{order.shippingAddress.city}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">ZIP / Postal Code</p>
                          <p className="text-sm text-gray-500">{order.shippingAddress.zipCode}</p>
                        </div>
                        
                        {order.shippingAddress.notes && (
                          <div className="sm:col-span-2">
                            <p className="text-sm font-medium">Delivery Notes</p>
                            <p className="text-sm text-gray-500">{order.shippingAddress.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <ShippingForm 
                        orderId={order.id} 
                        clientId={client!.id}
                        onSubmitComplete={handlePaymentComplete}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your orders will appear here once you've made a purchase.
          </p>
        </div>
      )}
    </div>
  );
}
