import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only POST requests are allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Only admins can end live sessions
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires admin access' });
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
    
    // Cannot end an already ended session
    if (!liveSession.isActive) {
      return res.status(400).json({ error: 'Live session is already ended' });
    }
    
    // End the live session
    const endedLiveSession = await prisma.liveSession.update({
      where: { id: liveSessionId },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });
    
    return res.status(200).json({
      success: true,
      message: 'Live session ended successfully',
      liveSession: endedLiveSession,
    });
  } catch (error: any) {
    console.error(`Error ending live session ${liveSessionId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to end live session' });
  }
}