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
  
  // Only client users can access this endpoint
  if (session.user.role !== 'client') {
    return res.status(403).json({ error: 'Forbidden: Only client users can access this endpoint' });
  }
  
  // Get the client ID from the session
  const clientId = parseInt(session.user.id);
  
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  try {
    // Parse query parameters for filtering
    const status = req.query.status as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const skip = (page - 1) * limit;
    
    // Build the where clause
    let where: any = { clientId };
    if (status) {
      where.status = status;
    }
    
    // Get the total count for pagination
    const totalCount = await prisma.order.count({ where });
    
    // Get client's orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        liveSession: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    
    // Calculate additional pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    
    return res.status(200).json({
      orders,
      pagination: {
        total: totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasMore,
      }
    });
  } catch (error: any) {
    console.error(`Error fetching orders for client ${clientId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch client orders' });
  }
}