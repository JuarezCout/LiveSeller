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
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getOrders(req, res, session);
    case 'POST':
      return createOrder(req, res, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get all orders (filtered by role)
async function getOrders(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    // If admin, get all orders
    // If client, get only their orders
    const isAdmin = session.user.role === 'admin';
    
    const orders = await prisma.order.findMany({
      where: isAdmin 
        ? {} 
        : { clientId: parseInt(session.user.id) },
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
      orderBy: { updatedAt: 'desc' },
    });
    
    return res.status(200).json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch orders' });
  }
}

// POST - Create a new order
async function createOrder(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    // Validate request body
    const validatedData = orderSchema.parse(req.body);
    
    // For security, ensure clients can only create orders for themselves
    if (session.user.role === 'client' && parseInt(session.user.id) !== validatedData.clientId) {
      return res.status(403).json({ error: 'Forbidden: Cannot create order for another client' });
    }
    
    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: validatedData.clientId },
    });
    
    if (!client) {
      return res.status(400).json({ error: 'Client not found' });
    }
    
    // Check if live session exists if provided
    if (validatedData.liveSessionId) {
      const liveSession = await prisma.liveSession.findUnique({
        where: { id: validatedData.liveSessionId },
      });
      
      if (!liveSession) {
        return res.status(400).json({ error: 'Live session not found' });
      }
      
      if (!liveSession.isActive) {
        return res.status(400).json({ error: 'Cannot create order for an inactive live session' });
      }
    }
    
    // Create the order
    const order = await prisma.order.create({
      data: validatedData,
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
    
    return res.status(201).json(order);
  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create order' });
  }
}