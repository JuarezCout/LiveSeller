import { OrderStatus } from "@shared/schema";
import { getStatusColors } from "@/lib/utils";

type OrderStatusBadgeProps = {
  status: string;
  className?: string;
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const statusColors = getStatusColors(status);
  
  return (
    <span className={`inline-flex items-center rounded-full ${statusColors.bg} px-2.5 py-0.5 text-xs font-medium ${statusColors.text} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

type OrderStatusStepProps = {
  label: string;
  status: string;
  currentStatus: string;
  isActive: boolean;
  isCompleted: boolean;
};

export function OrderStatusStep({ 
  label, 
  status, 
  currentStatus, 
  isActive, 
  isCompleted 
}: OrderStatusStepProps) {
  // Determine if this step is active or completed
  isActive = currentStatus === status;
  isCompleted = Object.values(OrderStatus).indexOf(currentStatus as any) > 
                Object.values(OrderStatus).indexOf(status as any);
  
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
        isCompleted ? 'bg-primary-600' : 
        isActive ? 'bg-primary-600' : 'bg-gray-200'
      }`}>
        {isCompleted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-500'}`}>
            {Object.values(OrderStatus).indexOf(status as any) + 1}
          </span>
        )}
      </div>
      <p className={`mt-2 text-xs font-medium ${
        isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
      }`}>
        {label}
      </p>
    </div>
  );
}

type OrderStatusProgressProps = {
  status: string;
};

export function OrderStatusProgress({ status }: OrderStatusProgressProps) {
  const steps = [
    { status: OrderStatus.RESERVED, label: "Reserved" },
    { status: OrderStatus.PAID, label: "Paid" },
    { status: OrderStatus.SHIPPED, label: "Shipped" },
    { status: OrderStatus.DELIVERED, label: "Delivered" },
  ];
  
  // Skip status progress for canceled orders
  if (status === OrderStatus.CANCELED) {
    return (
      <div className="mt-4 flex justify-center">
        <OrderStatusBadge status={OrderStatus.CANCELED} />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="relative flex items-center justify-between">
        {/* Connect steps with line */}
        <div className="absolute left-0 right-0 top-4 h-0.5 -translate-y-1/2 transform bg-gray-200" />
        
        {/* Steps */}
        {steps.map((step, index) => (
          <OrderStatusStep
            key={step.status}
            label={step.label}
            status={step.status}
            currentStatus={status}
            isActive={status === step.status}
            isCompleted={
              Object.values(OrderStatus).indexOf(status as any) > 
              Object.values(OrderStatus).indexOf(step.status as any)
            }
          />
        ))}
      </div>
    </div>
  );
}

export default {
  OrderStatusBadge,
  OrderStatusProgress
};
