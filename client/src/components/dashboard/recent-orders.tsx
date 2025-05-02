import { useQuery } from "@tanstack/react-query";
import { OrderStatus } from "@shared/schema";
import { formatCurrency, getStatusColors } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface OrderItemProps {
  id: number;
  clientName: string;
  itemCount: number;
  total: number;
  status: string;
}

function OrderItem({ id, clientName, itemCount, total, status }: OrderItemProps) {
  const statusColors = getStatusColors(status);
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <AvatarFallback>{getInitials(clientName)}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-900">{clientName}</p>
            <p className="text-sm text-gray-500">{itemCount} items - {formatCurrency(total)}</p>
          </div>
        </div>
        <div>
          <span className={`inline-flex items-center rounded-full ${statusColors.bg} px-2.5 py-0.5 text-xs font-medium ${statusColors.text}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RecentOrders() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['/api/orders'],
    select: (data) => {
      // Sort orders by creation date
      return [...data]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
    }
  });
  
  if (isLoading) {
    return (
      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
        </div>
        <div className="p-6 text-center text-sm text-gray-500">
          Failed to load recent orders
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <OrderItem
              key={order.id}
              id={order.id}
              clientName={order.client?.name || "Unknown Client"}
              itemCount={order.itemCount || 0}
              total={order.totalAmount}
              status={order.status}
            />
          ))
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            No recent orders
          </div>
        )}
      </div>
      <div className="border-t px-6 py-4">
        <a href="/orders" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          View all orders
        </a>
      </div>
    </div>
  );
}

export default RecentOrders;
