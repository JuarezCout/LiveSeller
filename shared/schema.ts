import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Product Table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  reference: text("reference").notNull().unique(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  inStock: boolean("in_stock").default(true),
  stockQuantity: integer("stock_quantity").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Client Table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

// Live Session Table
export const liveSessions = pgTable("live_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  isActive: boolean("is_active").default(true),
});

export const insertLiveSessionSchema = createInsertSchema(liveSessions).omit({
  id: true,
  startedAt: true,
  endedAt: true,
});

export type LiveSession = typeof liveSessions.$inferSelect;
export type InsertLiveSession = z.infer<typeof insertLiveSessionSchema>;

// Order Status Enum
export const OrderStatus = {
  RESERVED: "reserved",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELED: "canceled",
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

// Order Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  liveSessionId: integer("live_session_id").notNull(),
  status: text("status").notNull().default(OrderStatus.RESERVED),
  totalAmount: doublePrecision("total_amount").notNull(),
  shippingFee: doublePrecision("shipping_fee").default(0),
  shippingAddress: json("shipping_address"),
  paymentProofUrl: text("payment_proof_url"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Order Items Table 
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: doublePrecision("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// User Table (Admin Users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Shipping Address Schema
export const ShippingAddressSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  zipCode: z.string(),
  notes: z.string().optional(),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
