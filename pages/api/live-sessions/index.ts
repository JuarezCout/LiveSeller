import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { liveSessionSchema } from '../../../lib/validations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getLiveSessions(req, res, session);
    case 'POST':
      return createLiveSession(req, res, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get all live sessions
async function getLiveSessions(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    // Clients can only see active sessions, admins can see all
    const isAdmin = session.user.role === 'admin';
    
    const liveSessions = await prisma.liveSession.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: { scheduledAt: 'desc' },
    });
    
    return res.status(200).json(liveSessions);
  } catch (error: any) {
    console.error('Error fetching live sessions:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch live sessions' });
  }
}

// POST - Create a new live session (admin only)
async function createLiveSession(req: NextApiRequest, res: NextApiResponse, session: any) {
  // Only admins can create live sessions
  if (session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires admin access' });
  }
  
  try {
    // Validate request body
    const validatedData = liveSessionSchema.parse(req.body);
    
    // Create the live session
    const liveSession = await prisma.liveSession.create({
      data: {
        ...validatedData,
        isActive: true, // New sessions are active by default
      },
    });
    
    return res.status(201).json(liveSession);
  } catch (error: any) {
    console.error('Error creating live session:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create live session' });
  }
}