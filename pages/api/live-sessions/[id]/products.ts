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
    // Check if the live session exists and is active
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
    });
    
    if (!liveSession) {
      return res.status(404).json({ error: 'Live session not found' });
    }
    
    // Clients can only view products from active sessions
    const isAdmin = session.user.role === 'admin';
    if (!isAdmin && !liveSession.isActive) {
      return res.status(403).json({ error: 'Forbidden: This live session is not active' });
    }
    
    // Get all products that are in stock and available during this live session
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        // Products are associated with a session
        // This assumes there's a field to mark products as available for a specific session
        // If that's not the case, we'll return all available products
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return res.status(200).json(products);
  } catch (error: any) {
    console.error(`Error fetching products for live session ${liveSessionId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
}