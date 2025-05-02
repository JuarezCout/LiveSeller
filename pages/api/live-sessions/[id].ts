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
  
  // Get live session ID from URL
  const { id } = req.query;
  const liveSessionId = Number(id);
  
  if (isNaN(liveSessionId)) {
    return res.status(400).json({ error: 'Invalid live session ID' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getLiveSession(req, res, liveSessionId, session);
    case 'PUT':
      return updateLiveSession(req, res, liveSessionId, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get a live session by ID
async function getLiveSession(req: NextApiRequest, res: NextApiResponse, liveSessionId: number, session: any) {
  try {
    // Get the live session
    const liveSession = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
    });
    
    if (!liveSession) {
      return res.status(404).json({ error: 'Live session not found' });
    }
    
    // Clients can only see active sessions
    const isAdmin = session.user?.role === 'admin';
    if (!isAdmin && !liveSession.isActive) {
      return res.status(403).json({ error: 'Forbidden: This live session is not active' });
    }
    
    return res.status(200).json(liveSession);
  } catch (error: any) {
    console.error(`Error fetching live session ${liveSessionId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch live session' });
  }
}

// PUT - Update a live session (admin only)
async function updateLiveSession(req: NextApiRequest, res: NextApiResponse, liveSessionId: number, session: any) {
  // Only admins can update live sessions
  if (session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires admin access' });
  }
  
  try {
    // Check if live session exists
    const existingLiveSession = await prisma.liveSession.findUnique({
      where: { id: liveSessionId },
    });
    
    if (!existingLiveSession) {
      return res.status(404).json({ error: 'Live session not found' });
    }
    
    // Validate request body
    const validatedData = liveSessionSchema.parse(req.body);
    
    // Update the live session
    const updatedLiveSession = await prisma.liveSession.update({
      where: { id: liveSessionId },
      data: validatedData,
    });
    
    return res.status(200).json(updatedLiveSession);
  } catch (error: any) {
    console.error(`Error updating live session ${liveSessionId}:`, error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update live session' });
  }
}