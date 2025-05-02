import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET requests are allowed
  if (req.method !== 'GET') {
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
    // Get the order with client and shipping details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
      },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if the order has shipping address
    if (!order.shippingAddress) {
      return res.status(400).json({ error: 'Order does not have a shipping address' });
    }
    
    // Generate the HTML for the shipping label
    const html = generateShippingLabelHTML(order);
    
    // Return the HTML and order data
    return res.status(200).json({
      success: true,
      order: order,
      html: html,
    });
  } catch (error: any) {
    console.error(`Error generating shipping label for order ${orderId}:`, error);
    return res.status(500).json({ error: error.message || 'Failed to generate shipping label' });
  }
}

// Function to generate HTML for the shipping label
function generateShippingLabelHTML(order: any) {
  const { client, shippingAddress } = order;
  
  // Format the address
  const formattedAddress = [
    shippingAddress.street,
    `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
    shippingAddress.country
  ].join('\n');
  
  const html = `
    <div style="font-family: Arial, sans-serif; width: 400px; padding: 20px; border: 2px solid #000; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 18px;">SHIPPING LABEL</h1>
        <p style="margin: 5px 0; font-size: 14px;">Order #${order.id}</p>
      </div>
      
      <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 10px;">
        <h2 style="margin: 0 0 10px 0; font-size: 16px; text-transform: uppercase;">Ship To:</h2>
        <p style="margin: 0; font-size: 14px; font-weight: bold;">${client.name}</p>
        <p style="margin: 0; font-size: 14px;">${shippingAddress.street}</p>
        <p style="margin: 0; font-size: 14px;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}</p>
        <p style="margin: 0; font-size: 14px;">${shippingAddress.country}</p>
        ${client.phone ? `<p style="margin: 5px 0 0 0; font-size: 14px;">Phone: ${client.phone}</p>` : ''}
      </div>
      
      <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
        <div style="width: 48%;">
          <h2 style="margin: 0 0 5px 0; font-size: 12px;">ORDER DATE</h2>
          <p style="margin: 0; font-size: 14px;">${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div style="width: 48%;">
          <h2 style="margin: 0 0 5px 0; font-size: 12px;">SHIPPING METHOD</h2>
          <p style="margin: 0; font-size: 14px;">${order.shippingMethod || 'Standard Shipping'}</p>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <div style="border: 1px solid #000; padding: 10px; text-align: center;">
          <p style="margin: 0; font-size: 12px;">Order Status</p>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${order.status}</p>
        </div>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px dashed #000; padding-top: 10px; font-size: 10px; text-align: center;">
        <p style="margin: 0;">This shipping label was generated on ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
  
  return html;
}