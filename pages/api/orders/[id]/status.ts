import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';
import { z } from 'zod';

// Status update validation schema
const statusUpdateSchema = z.object({
  status: z.string(),
  notes: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only PUT requests are allowed
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Admin only endpoint
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires admin access' });
  }
  
  // Get order ID from URL
  const { id } = req.query;
  const orderId = Number(id);
  
  if (isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  
  try {
    // Validate request body
    const validatedData = statusUpdateSchema.parse(req.body);
    
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Validate status transition if needed
    // (e.g., can't go from PENDING to DELIVERED without intermediate steps)
    
    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: validatedData.status,
        notes: validatedData.notes ? `${order.notes ? order.notes + ' | ' : ''}${validatedData.notes}` : order.notes,
      },
    });
    
    return res.status(200).json({
      success: true,
      message: `Order status updated to ${validatedData.status}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error(`Error updating order status for order ${orderId}:`, error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update order status' });
  }
}