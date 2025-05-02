import {
  Product,
  InsertProduct,
  Client,
  InsertClient,
  LiveSession,
  InsertLiveSession,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  User,
  InsertUser,
  OrderStatus,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByReference(reference: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  
  // Live Session methods
  getLiveSessions(): Promise<LiveSession[]>;
  getLiveSession(id: number): Promise<LiveSession | undefined>;
  createLiveSession(session: InsertLiveSession): Promise<LiveSession>;
  updateLiveSession(id: number, session: Partial<InsertLiveSession>): Promise<LiveSession | undefined>;
  endLiveSession(id: number): Promise<LiveSession | undefined>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByClient(clientId: number): Promise<Order[]>;
  getOrdersByLiveSession(liveSessionId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  removeOrderItem(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private clients: Map<number, Client>;
  private liveSessions: Map<number, LiveSession>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userIdCounter: number;
  private productIdCounter: number;
  private clientIdCounter: number;
  private liveSessionIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.clients = new Map();
    this.liveSessions = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.clientIdCounter = 1;
    this.liveSessionIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    
    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true,
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductByReference(reference: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.reference === reference
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { 
      ...product, 
      id, 
      createdAt: new Date() 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClientByEmail(email: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(
      (client) => client.email === email
    );
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const newClient: Client = { 
      ...client, 
      id, 
      createdAt: new Date() 
    };
    this.clients.set(id, newClient);
    return newClient;
  }
  
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;
    
    const updatedClient = { ...existingClient, ...client };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  // Live Session methods
  async getLiveSessions(): Promise<LiveSession[]> {
    return Array.from(this.liveSessions.values());
  }
  
  async getLiveSession(id: number): Promise<LiveSession | undefined> {
    return this.liveSessions.get(id);
  }
  
  async createLiveSession(session: InsertLiveSession): Promise<LiveSession> {
    const id = this.liveSessionIdCounter++;
    const newSession: LiveSession = { 
      ...session, 
      id, 
      startedAt: new Date(),
      endedAt: null,
      isActive: true
    };
    this.liveSessions.set(id, newSession);
    return newSession;
  }
  
  async updateLiveSession(id: number, session: Partial<InsertLiveSession>): Promise<LiveSession | undefined> {
    const existingSession = this.liveSessions.get(id);
    if (!existingSession) return undefined;
    
    const updatedSession = { ...existingSession, ...session };
    this.liveSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async endLiveSession(id: number): Promise<LiveSession | undefined> {
    const existingSession = this.liveSessions.get(id);
    if (!existingSession) return undefined;
    
    const updatedSession = { 
      ...existingSession, 
      isActive: false,
      endedAt: new Date() 
    };
    this.liveSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByClient(clientId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.clientId === clientId
    );
  }
  
  async getOrdersByLiveSession(liveSessionId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.liveSessionId === liveSessionId
    );
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { 
      ...existingOrder, 
      ...order,
      updatedAt: new Date() 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { 
      ...existingOrder, 
      status,
      updatedAt: new Date() 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  async addOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemIdCounter++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }
  
  async removeOrderItem(id: number): Promise<boolean> {
    return this.orderItems.delete(id);
  }
}

export const storage = new MemStorage();
