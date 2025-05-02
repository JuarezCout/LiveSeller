import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';
import { createRouter } from 'next-connect';
import { paymentUpload } from '../../../../lib/upload/multer';

// Create a handler with next-connect to support multer middleware
const handler = createRouter<NextApiRequest, NextApiResponse>();

// Check authentication
handler.use(async (req, res, next) => {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  return next();
});

// POST - Upload payment proof
handler.post(paymentUpload.single('proof'), async (req, res) => {
  try {
    // Get order ID from URL
    const { id } = req.query;
    const orderId = Number(id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    // Get the order
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
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No payment proof provided' });
    }
    
    // Create a relative URL path to the file
    const paymentProofUrl = `/uploads/payments/${req.file.filename}`;
    
    // Update the order with payment proof URL and change status to PAID
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProof: paymentProofUrl,
        status: 'PAID',
      },
    });
    
    return res.status(200).json({
      success: true,
      message: 'Payment proof uploaded successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error uploading payment proof:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload payment proof' });
  }
});

export default handler;

// Configure Next.js to handle the file size limit
export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser to use multer
  },
};