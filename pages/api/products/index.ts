import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { productSchema } from '../../../lib/validations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session && req.method !== 'GET') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // For admin-only operations, check if user is admin
  if (req.method !== 'GET' && session?.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires admin access' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getProducts(req, res);
    case 'POST':
      return createProduct(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get all products
async function getProducts(req: NextApiRequest, res: NextApiResponse) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return res.status(200).json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
}

// POST - Create a new product
async function createProduct(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate request body
    const validatedData = productSchema.parse(req.body);
    
    // Check if reference already exists
    const existingProduct = await prisma.product.findUnique({
      where: { reference: validatedData.reference },
    });
    
    if (existingProduct) {
      return res.status(400).json({ error: 'A product with this reference already exists' });
    }
    
    // Create the product
    const product = await prisma.product.create({
      data: validatedData,
    });
    
    return res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to create product' });
  }
}