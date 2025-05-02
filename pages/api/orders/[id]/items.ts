import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';
import { orderItemSchema } from '../../../../lib/validations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get order ID from URL
  const { id } = req.query;
  const orderId = Number(id);
  
  if (isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getOrderItems(req, res, orderId, session);
    case 'POST':
      return addOrderItem(req, res, orderId, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get all items for an order
async function getOrderItems(req: NextApiRequest, res: NextApiResponse, orderId: number, session: any) {
  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check permissions
    const isAdmin = session.user.role === 'admin';
    const isClient = session.user.role === 'client' && parseInt(session.user.id) === order.clientId;
    
    if (!isAdmin && !isClient) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    // Get the order items
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: true,
      },
    });
    
    return res.status(200).json(orderItems);
  } catch (error: any) {
    console.error(`Error fetching order items for order ${orderId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch order items' });
  }
}

// POST - Add an item to an order
async function addOrderItem(req: NextApiRequest, res: NextApiResponse, orderId: number, session: any) {
  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check permissions (admin only or client who owns the order)
    const isAdmin = session.user.role === 'admin';
    const isClient = session.user.role === 'client' && parseInt(session.user.id) === order.clientId;
    const canAddItems = isAdmin || (isClient && order.status === 'PENDING');
    
    if (!canAddItems) {
      return res.status(403).json({ error: 'Forbidden: Cannot add items to this order' });
    }
    
    // Validate request body, but ensure orderId matches the URL parameter
    let itemData = { ...req.body, orderId };
    const validatedData = orderItemSchema.parse(itemData);
    
    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });
    
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }
    
    if (!product.inStock || product.stockQuantity < validatedData.quantity) {
      return res.status(400).json({ error: 'Product is out of stock or insufficient quantity' });
    }
    
    // Create the order item
    const orderItem = await prisma.orderItem.create({
      data: validatedData,
      include: {
        product: true,
      },
    });
    
    // Update order total
    const allOrderItems = await prisma.orderItem.findMany({
      where: { orderId },
    });
    
    const totalAmount = allOrderItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    await prisma.order.update({
      where: { id: orderId },
      data: { totalAmount },
    });
    
    // Update product stock
    await prisma.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: {
          decrement: validatedData.quantity
        },
        inStock: (product.stockQuantity - validatedData.quantity) > 0
      }
    });
    
    return res.status(201).json(orderItem);
  } catch (error: any) {
    console.error(`Error adding item to order ${orderId}:`, error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to add order item' });
  }
}