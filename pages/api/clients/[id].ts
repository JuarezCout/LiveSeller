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
  
  // Get client ID from URL
  const { id } = req.query;
  const clientId = Number(id);
  
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  // Verify access rights (admin or the client themselves)
  const isAdmin = session.user.role === 'admin';
  const isClient = session.user.role === 'client' && session.user.id === clientId.toString();
  
  if (!isAdmin && !isClient) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getClient(req, res, clientId);
    case 'PUT':
      return updateClient(req, res, clientId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get a client by ID
async function getClient(req: NextApiRequest, res: NextApiResponse, clientId: number) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password
      },
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    return res.status(200).json(client);
  } catch (error: any) {
    console.error(`Error fetching client ${clientId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch client' });
  }
}

// PUT - Update a client
async function updateClient(req: NextApiRequest, res: NextApiResponse, clientId: number) {
  try {
    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
    });
    
    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // For password updates, we need a separate validation
    const { password, ...restData } = req.body;
    
    // Basic validation without requiring password
    const validatedData = clientSchema
      .omit({ password: true })
      .parse(restData);
    
    // Check if updated email is unique (unless it's the same as the current one)
    if (validatedData.email !== existingClient.email) {
      const clientWithEmail = await prisma.client.findUnique({
        where: { email: validatedData.email },
      });
      
      if (clientWithEmail) {
        return res.status(400).json({ error: 'A client with this email already exists' });
      }
    }
    
    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // Handle password update if provided
    if (password && password.length >= 6) {
      updateData.password = await hash(password, 10);
    }
    
    // Update the client
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password
      },
    });
    
    return res.status(200).json(updatedClient);
  } catch (error: any) {
    console.error(`Error updating client ${clientId}:`, error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update client' });
  }
}