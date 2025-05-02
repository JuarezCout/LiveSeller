import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = registerSchema.parse(req.body);
    
    // Check if email is already in use
    const existingClient = await prisma.client.findUnique({
      where: { email: data.email },
    });

    if (existingClient) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create new client
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        passwordHash,
      },
    });

    // Return client data without password
    const { passwordHash: _, ...clientData } = client;
    
    return res.status(201).json(clientData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Error creating account' });
  }
}