import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertClientSchema, 
  insertLiveSessionSchema, 
  insertOrderSchema, 
  insertOrderItemSchema,
  OrderStatus,
  ShippingAddressSchema
} from "@shared/schema";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { toPng } from "html-to-image";
import { JSDOM } from "jsdom";

// Setup multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Setup uploads directory for static serving
const setupUploadsDirectory = (app: Express) => {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup uploads directory
  setupUploadsDirectory(app);
  
  // API Routes
  const apiRouter = express.Router();
  
  // Product Routes
  apiRouter.get("/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve products" });
    }
  });
  
  apiRouter.get("/products/:id", async (req: Request, res: Response) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve product" });
    }
  });
  
  apiRouter.post("/products", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });
  
  apiRouter.put("/products/:id", async (req: Request, res: Response) => {
    try {
      const updatedProduct = await storage.updateProduct(
        parseInt(req.params.id),
        req.body
      );
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });
  
  apiRouter.delete("/products/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteProduct(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Upload product image
  apiRouter.post("/products/upload", upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  });
  
  // Client Routes
  apiRouter.get("/clients", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve clients" });
    }
  });
  
  apiRouter.get("/clients/:id", async (req: Request, res: Response) => {
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve client" });
    }
  });
  
  apiRouter.post("/clients", async (req: Request, res: Response) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data", error });
    }
  });
  
  apiRouter.put("/clients/:id", async (req: Request, res: Response) => {
    try {
      const updatedClient = await storage.updateClient(
        parseInt(req.params.id),
        req.body
      );
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(updatedClient);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data", error });
    }
  });
  
  // Live Session Routes
  apiRouter.get("/live-sessions", async (req: Request, res: Response) => {
    try {
      const sessions = await storage.getLiveSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve live sessions" });
    }
  });
  
  apiRouter.get("/live-sessions/:id", async (req: Request, res: Response) => {
    try {
      const session = await storage.getLiveSession(parseInt(req.params.id));
      if (!session) {
        return res.status(404).json({ message: "Live session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve live session" });
    }
  });
  
  apiRouter.post("/live-sessions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertLiveSessionSchema.parse(req.body);
      const session = await storage.createLiveSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid live session data", error });
    }
  });
  
  apiRouter.put("/live-sessions/:id", async (req: Request, res: Response) => {
    try {
      const updatedSession = await storage.updateLiveSession(
        parseInt(req.params.id),
        req.body
      );
      if (!updatedSession) {
        return res.status(404).json({ message: "Live session not found" });
      }
      res.json(updatedSession);
    } catch (error) {
      res.status(400).json({ message: "Invalid live session data", error });
    }
  });
  
  apiRouter.post("/live-sessions/:id/end", async (req: Request, res: Response) => {
    try {
      const endedSession = await storage.endLiveSession(parseInt(req.params.id));
      if (!endedSession) {
        return res.status(404).json({ message: "Live session not found" });
      }
      res.json(endedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to end live session" });
    }
  });
  
  // Order Routes
  apiRouter.get("/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve orders" });
    }
  });
  
  apiRouter.get("/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(order.id);
      
      res.json({ ...order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order" });
    }
  });
  
  apiRouter.get("/clients/:clientId/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrdersByClient(parseInt(req.params.clientId));
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve client orders" });
    }
  });
  
  apiRouter.get("/live-sessions/:sessionId/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrdersByLiveSession(parseInt(req.params.sessionId));
      
      // Get all clients to add client info
      const clients = await storage.getClients();
      
      // Get client info for each order
      const ordersWithClientInfo = await Promise.all(orders.map(async (order) => {
        const client = clients.find(c => c.id === order.clientId);
        const orderItems = await storage.getOrderItems(order.id);
        
        // Calculate items count
        const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          ...order,
          client: client ? { id: client.id, name: client.name } : null,
          itemCount,
        };
      }));
      
      res.json(ordersWithClientInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve live session orders" });
    }
  });
  
  apiRouter.post("/orders", async (req: Request, res: Response) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      
      // Create order items if provided
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.addOrderItem({
            ...item,
            orderId: order.id
          });
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });
  
  apiRouter.put("/orders/:id", async (req: Request, res: Response) => {
    try {
      const updatedOrder = await storage.updateOrder(
        parseInt(req.params.id),
        req.body
      );
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });
  
  apiRouter.put("/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!status || !Object.values(OrderStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(
        parseInt(req.params.id),
        status
      );
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // Order Item Routes
  apiRouter.get("/orders/:orderId/items", async (req: Request, res: Response) => {
    try {
      const orderItems = await storage.getOrderItems(parseInt(req.params.orderId));
      
      // Get all products to add product info
      const products = await storage.getProducts();
      
      // Add product info to each order item
      const itemsWithProductInfo = orderItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          ...item,
          product: product || null
        };
      });
      
      res.json(itemsWithProductInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve order items" });
    }
  });
  
  apiRouter.post("/orders/:orderId/items", async (req: Request, res: Response) => {
    try {
      const orderItem = {
        ...req.body,
        orderId: parseInt(req.params.orderId)
      };
      const validatedData = insertOrderItemSchema.parse(orderItem);
      const item = await storage.addOrderItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid order item data", error });
    }
  });
  
  apiRouter.delete("/orders/items/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.removeOrderItem(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Order item not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order item" });
    }
  });
  
  // Client order management
  apiRouter.post("/clients/:clientId/orders/:orderId/payment", upload.single('proof'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No payment proof uploaded" });
      }
      
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.clientId !== parseInt(req.params.clientId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const paymentProofUrl = `/uploads/${req.file.filename}`;
      
      // Update the order with payment proof and status
      const updatedOrder = await storage.updateOrder(orderId, {
        paymentProofUrl,
        status: OrderStatus.PAID
      });
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to process payment" });
    }
  });
  
  apiRouter.post("/clients/:clientId/orders/:orderId/shipping", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.clientId !== parseInt(req.params.clientId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Validate shipping address
      const shippingAddress = ShippingAddressSchema.parse(req.body);
      
      // Update the order with shipping address
      const updatedOrder = await storage.updateOrder(orderId, {
        shippingAddress
      });
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ message: "Invalid shipping information", error });
    }
  });
  
  // Order summary generation
  apiRouter.get("/orders/:orderId/summary", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items with product info
      const orderItems = await storage.getOrderItems(orderId);
      const products = await storage.getProducts();
      
      const itemsWithProductInfo = orderItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          ...item,
          product
        };
      });
      
      // Get client info
      const client = await storage.getClient(order.clientId);
      
      // Send the complete order data for summary
      res.json({
        order,
        items: itemsWithProductInfo,
        client
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate order summary" });
    }
  });
  
  // Shipping label generation
  apiRouter.get("/orders/:orderId/shipping-label", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (!order.shippingAddress) {
        return res.status(400).json({ message: "Order has no shipping address" });
      }
      
      // Get client info
      const client = await storage.getClient(order.clientId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Prepare shipping label data
      const shippingLabel = {
        orderId: order.id,
        trackingNumber: order.trackingNumber || `TRK${Date.now()}`,
        client: {
          name: client.name,
          phone: client.phone
        },
        shippingAddress: order.shippingAddress
      };
      
      // Update tracking number if not already set
      if (!order.trackingNumber) {
        await storage.updateOrder(orderId, {
          trackingNumber: shippingLabel.trackingNumber
        });
      }
      
      res.json(shippingLabel);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate shipping label" });
    }
  });
  
  // Authentication routes
  apiRouter.post("/auth/admin", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Return user info without password
      const { password: _, ...userInfo } = user;
      res.json(userInfo);
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  
  apiRouter.post("/auth/client", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const client = await storage.getClientByEmail(email);
      
      if (!client || client.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Return client info without password
      const { password: _, ...clientInfo } = client;
      res.json(clientInfo);
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  
  // Register API router
  app.use("/api", apiRouter);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
