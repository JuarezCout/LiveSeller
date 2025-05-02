import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';
import { productSchema } from '../../../lib/validations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if user is authenticated for write operations
  const session = await getServerSession(req, res, authOptions);
  
  if (req.method !== 'GET' && !session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // For admin-only operations, check if user is admin
  if (req.method !== 'GET' && session?.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires admin access' });
  }
  
  // Get product ID from the URL
  const { id } = req.query;
  const productId = Number(id);
  
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getProduct(req, res, productId);
    case 'PUT':
      return updateProduct(req, res, productId);
    case 'DELETE':
      return deleteProduct(req, res, productId);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET - Get a product by ID
async function getProduct(req: NextApiRequest, res: NextApiResponse, productId: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    return res.status(200).json(product);
  } catch (error: any) {
    console.error(`Error fetching product ${productId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to fetch product' });
  }
}

// PUT - Update a product
async function updateProduct(req: NextApiRequest, res: NextApiResponse, productId: number) {
  try {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Validate request body
    const validatedData = productSchema.parse(req.body);
    
    // Check if updated reference is unique (unless it's the same as the current one)
    if (validatedData.reference !== existingProduct.reference) {
      const productWithReference = await prisma.product.findUnique({
        where: { reference: validatedData.reference },
      });
      
      if (productWithReference) {
        return res.status(400).json({ error: 'A product with this reference already exists' });
      }
    }
    
    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: validatedData,
    });
    
    return res.status(200).json(updatedProduct);
  } catch (error: any) {
    console.error(`Error updating product ${productId}:`, error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update product' });
  }
}

// DELETE - Delete a product
async function deleteProduct(req: NextApiRequest, res: NextApiResponse, productId: number) {
  try {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if product is used in any order items
    const orderItems = await prisma.orderItem.findMany({
      where: { productId },
      take: 1,
    });
    
    if (orderItems.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product as it is associated with one or more orders' 
      });
    }
    
    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });
    
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting product ${productId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to delete product' });
  }
}