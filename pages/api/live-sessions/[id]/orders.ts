import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET requests are allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get live session ID from URL
  const { id } = req.query;
  const liveSessionId = Number(id);
  
  if (isNaN(liveSessionId)) {
    return res.status(400).json({ error: 'Invalid live session ID' });
  }
  
  try {
    // Check if the live session exists
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
    });
    
    if (!liveSession) {
      return res.status(404).json({ error: 'Live session not found' });
    }
    
    // For client, ensure the session is active
    const isAdmin = session.user?.role === 'admin';
    if (!isAdmin && !liveSession.isActive) {
      return res.status(403).json({ error: 'Forbidden: The live session is not active' });
    }
    
    // Handle filtering based on user role
    let orderFilter: any = { liveSessionId };
    
    // If client, only show their orders
    if (session.user?.role === 'client') {
      orderFilter.clientId = parseInt(session.user.id as string);
    }
    
    // Get all orders for this live session
    const orders = await prisma.order.findMany({
      where: orderFilter,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return res.status(200).json(orders);
  } catch (error: any) {
    console.error(`Error fetching orders for live session ${liveSessionId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch orders' });
  }
}