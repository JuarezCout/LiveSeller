import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { clientSchema } from '../../../lib/validations';
import { hash } from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getClientProfile(req, res, clientId);
    case 'PUT':
      return updateClientProfile(req, res, clientId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get client profile
async function getClientProfile(req: NextApiRequest, res: NextApiResponse, clientId: number) {
  try {
    // Get the client profile
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    return res.status(200).json(client);
  } catch (error: any) {
    console.error(`Error fetching client profile for client ${clientId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch client profile' });
  }
}

// PUT - Update client profile
async function updateClientProfile(req: NextApiRequest, res: NextApiResponse, clientId: number) {
  try {
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
    });
    
    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Validate request body - exclude password if not provided
    const { password, ...otherData } = req.body;
    let validatedData = clientSchema.omit({ password: true }).parse(otherData);
    
    // If password is provided, hash it
    if (password) {
      const hashedPassword = await hash(password, 10);
      validatedData = { 
        ...validatedData,
        password: hashedPassword 
      } as any; // Type cast to avoid TypeScript error
    }
    
    // Update the client profile
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return res.status(200).json(updatedClient);
  } catch (error: any) {
    console.error(`Error updating client profile for client ${clientId}:`, error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update client profile' });
  }
}