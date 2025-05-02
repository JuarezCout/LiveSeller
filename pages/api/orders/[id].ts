import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { orderSchema } from '../../../lib/validations';

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
      return getOrder(req, res, orderId, session);
    case 'PUT':
      return updateOrder(req, res, orderId, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get an order by ID
async function getOrder(req: NextApiRequest, res: NextApiResponse, orderId: number, session: any) {
  try {
    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        liveSession: true,
        items: {
          include: {
            product: true
          }
        }
      },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if the user has permission to view this order
    const isAdmin = session.user.role === 'admin';
    const isClient = session.user.role === 'client' && parseInt(session.user.id) === order.clientId;
    
    if (!isAdmin && !isClient) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    return res.status(200).json(order);
  } catch (error: any) {
    console.error(`Error fetching order ${orderId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch order' });
  }
}

// PUT - Update an order
async function updateOrder(req: NextApiRequest, res: NextApiResponse, orderId: number, session: any) {
  try {
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true },
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check permissions
    const isAdmin = session.user.role === 'admin';
    const isClient = session.user.role === 'client' && parseInt(session.user.id) === existingOrder.clientId;
    
    if (!isAdmin && !isClient) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    // Different update permissions for admin vs. client
    let updateData: any = {};
    
    if (isAdmin) {
      // Admin can update anything
      const validatedData = orderSchema.parse(req.body);
      updateData = validatedData;
    } else {
      // Client can only update shipping address
      if (req.body.shippingAddress) {
        updateData.shippingAddress = req.body.shippingAddress;
      } else {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
    }
    
    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        liveSession: true,
      },
    });
    
    return res.status(200).json(updatedOrder);
  } catch (error: any) {
    console.error(`Error updating order ${orderId}:`, error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update order' });
  }
}