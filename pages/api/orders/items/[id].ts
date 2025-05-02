import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only DELETE requests are allowed
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get order item ID from URL
  const { id } = req.query;
  const orderItemId = Number(id);
  
  if (isNaN(orderItemId)) {
    return res.status(400).json({ error: 'Invalid order item ID' });
  }
  
  try {
    // Check if order item exists
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
        product: true,
      },
    });
    
    if (!orderItem) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    
    // Check permissions
    const isAdmin = session.user.role === 'admin';
    const isClient = session.user.role === 'client' && 
      parseInt(session.user.id) === orderItem.order.clientId;
    const canRemoveItems = isAdmin || (isClient && orderItem.order.status === 'PENDING');
    
    if (!canRemoveItems) {
      return res.status(403).json({ error: 'Forbidden: Cannot remove items from this order' });
    }
    
    // Begin transaction to update everything
    const deletedItem = await prisma.$transaction(async (tx) => {
      // Delete the order item
      const deleted = await tx.orderItem.delete({
        where: { id: orderItemId },
      });
      
      // Return product to stock
      await tx.product.update({
        where: { id: orderItem.productId },
        data: {
          stockQuantity: {
            increment: orderItem.quantity
          },
          inStock: true
        }
      });
      
      // Recalculate order total
      const remainingItems = await tx.orderItem.findMany({
        where: { orderId: orderItem.orderId },
      });
      
      const totalAmount = remainingItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      // Update order
      await tx.order.update({
        where: { id: orderItem.orderId },
        data: { totalAmount },
      });
      
      return deleted;
    });
    
    return res.status(200).json({
      success: true,
      message: 'Order item deleted successfully',
      data: deletedItem,
    });
  } catch (error: any) {
    console.error(`Error deleting order item ${orderItemId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to delete order item' });
  }
}