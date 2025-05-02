import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { clientSchema } from '../../../lib/validations';
import { hash } from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated for admin actions
  const session = await getServerSession(req, res, authOptions);
  
  if (req.method !== 'GET' && (!session || session.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Forbidden: Requires admin access' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getClients(req, res);
    case 'POST':
      return createClient(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get all clients
async function getClients(req: NextApiRequest, res: NextApiResponse) {
  // Only admins can see all clients
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires admin access' });
  }
  
  try {
    const clients = await prisma.client.findMany({
      orderBy: { updatedAt: 'desc' },
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
    
    return res.status(200).json(clients);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch clients' });
  }
}

// POST - Create a new client
async function createClient(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate request body
    const validatedData = clientSchema.parse(req.body);
    
    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingClient) {
      return res.status(400).json({ error: 'A client with this email already exists' });
    }
    
    // Hash the password
    const hashedPassword = await hash(validatedData.password, 10);
    
    // Create the client
    const client = await prisma.client.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
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
    
    return res.status(201).json(client);
  } catch (error: any) {
    console.error('Error creating client:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create client' });
  }
}