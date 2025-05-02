import { formatCurrency } from "@/lib/utils";

interface OrderItemProps {
  imageUrl: string;
  name: string;
  reference: string;
  price: number;
}

export function OrderItem({ imageUrl, name, reference, price }: OrderItemProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-xs text-gray-500">No image</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">Ref: {reference}</p>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-900">{formatCurrency(price)}</p>
    </div>
  );
}

interface OrderItemsListProps {
  items: {
    id: number;
    product: {
      id: number;
      name: string;
      reference: string;
      imageUrl?: string;
    };
    price: number;
    quantity: number;
  }[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="py-3 text-center">
        <p className="text-sm text-gray-500">No items in this order</p>
      </div>
    );
  }
  
  return (
    <>
      {items.map((item) => (
        <OrderItem
          key={item.id}
          imageUrl={item.product?.imageUrl || ""}
          name={item.product?.name || "Unknown Product"}
          reference={item.product?.reference || "N/A"}
          price={item.price}
        />
      ))}
    </>
  );
}

interface OrderPriceSummaryProps {
  subtotal: number;
  shippingFee: number;
}

export function OrderPriceSummary({ subtotal, shippingFee }: OrderPriceSummaryProps) {
  const total = subtotal + shippingFee;
  
  return (
    <div className="space-y-2 py-4">
      <div className="flex justify-between text-sm">
        <p className="text-gray-500">Subtotal</p>
        <p className="font-medium text-gray-900">{formatCurrency(subtotal)}</p>
      </div>
      <div className="flex justify-between text-sm">
        <p className="text-gray-500">Shipping</p>
        <p className="font-medium text-gray-900">{formatCurrency(shippingFee)}</p>
      </div>
      <div className="flex justify-between text-base">
        <p className="font-medium text-gray-900">Total</p>
        <p className="font-medium text-gray-900">{formatCurrency(total)}</p>
      </div>
    </div>
  );
}

export default {
  OrderItem,
  OrderItemsList,
  OrderPriceSummary
};
