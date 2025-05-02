import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';
import { shippingAddressSchema } from '../../../../lib/validations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only POST/PUT requests are allowed
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get order ID from URL
  const { id } = req.query;
  const orderId = Number(id);
  
  if (isNaN(orderId)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }
  
  try {
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check permissions
    const isAdmin = session.user.role === 'admin';
    const isClient = session.user.role === 'client' && parseInt(session.user.id) === order.clientId;
    
    if (!isAdmin && !isClient) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    
    // Validate the shipping address
    const validatedData = shippingAddressSchema.parse(req.body);
    
    // Update the order with the shipping address
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingAddress: validatedData,
        status: order.status === 'PENDING' ? 'ADDRESS_ADDED' : order.status,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
      },
    });
    
    return res.status(200).json({
      success: true,
      message: 'Shipping address updated successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error(`Error updating shipping address for order ${orderId}:`, error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: error.message || 'Failed to update shipping address' });
  }
}