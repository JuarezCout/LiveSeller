import { z } from 'zod';

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  reference: z.string().optional(),
  imageUrl: z.string().optional(),
  stockQuantity: z.number().int().nonnegative('Stock quantity cannot be negative').default(0),
  inStock: z.boolean().default(true),
  category: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

// Client validation schema
export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

// Live session validation schema
export const liveSessionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  scheduledAt: z.date(),
  endedAt: z.date().optional(),
  isActive: z.boolean().default(true),
  platform: z.string().optional(),
  platformUrl: z.string().optional(),
});

export type LiveSessionInput = z.infer<typeof liveSessionSchema>;

// Order validation schema
export const orderSchema = z.object({
  clientId: z.number().int().positive('Client ID is required'),
  liveSessionId: z.number().int().positive('Live session ID is required').optional(),
  status: z.string().default('PENDING'),
  totalAmount: z.number().nonnegative('Total amount cannot be negative'),
  shippingCost: z.number().nonnegative('Shipping cost cannot be negative').optional(),
  taxAmount: z.number().nonnegative('Tax amount cannot be negative').optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  shippingMethod: z.string().optional(),
  trackingNumber: z.string().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

// Order item validation schema
export const orderItemSchema = z.object({
  orderId: z.number().int().positive('Order ID is required'),
  productId: z.number().int().positive('Product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  price: z.number().positive('Price must be a positive number'),
  notes: z.string().optional(),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;

// Shipping address validation schema
export const shippingAddressSchema = z.object({
  street: z.string().min(3, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;