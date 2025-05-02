import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';
import { JSDOM } from 'jsdom';
import { toPng } from 'html-to-image';
import path from 'path';
import fs from 'fs';

// Helper function to generate HTML for order summary
function generateOrderSummaryHTML(order: any, client: any, orderItems: any[]) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Order Summary</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #eaeaea;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }
        .header h1 {
          color: #2c3e50;
          margin-bottom: 5px;
        }
        .order-info, .client-info {
          margin-bottom: 20px;
        }
        .order-info div, .client-info div {
          margin-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px 15px;
          border-bottom: 1px solid #eaeaea;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
        }
        .totals div {
          margin-bottom: 5px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 14px;
          color: #7f8c8d;
        }
        .status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
        }
        .status.pending { background-color: #fff3cd; color: #856404; }
        .status.confirmed { background-color: #d1ecf1; color: #0c5460; }
        .status.paid { background-color: #d4edda; color: #155724; }
        .status.shipped { background-color: #e2e3e5; color: #383d41; }
        .status.delivered { background-color: #c3e6cb; color: #155724; }
        .status.cancelled { background-color: #f8d7da; color: #721c24; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Summary</h1>
          <p>Thank you for your purchase!</p>
        </div>
        
        <div class="order-info">
          <h2>Order Details</h2>
          <div><strong>Order ID:</strong> #${order.id}</div>
          <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
          <div>
            <strong>Status:</strong> 
            <span class="status ${order.status.toLowerCase()}">${order.status}</span>
          </div>
        </div>
        
        <div class="client-info">
          <h2>Client Information</h2>
          <div><strong>Name:</strong> ${client.name}</div>
          <div><strong>Email:</strong> ${client.email}</div>
          ${client.phone ? `<div><strong>Phone:</strong> ${client.phone}</div>` : ''}
        </div>
        
        <div class="items">
          <h2>Ordered Items</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="totals">
          <div><strong>Subtotal:</strong> $${order.totalAmount.toFixed(2)}</div>
          ${order.shippingCost ? `<div><strong>Shipping:</strong> $${order.shippingCost.toFixed(2)}</div>` : ''}
          ${order.taxAmount ? `<div><strong>Tax:</strong> $${order.taxAmount.toFixed(2)}</div>` : ''}
          <div style="font-size: 18px; margin-top: 10px;">
            <strong>Total:</strong> $${((order.totalAmount || 0) + (order.shippingCost || 0) + (order.taxAmount || 0)).toFixed(2)}
          </div>
        </div>
        
        ${order.notes ? `
          <div class="notes" style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #ddd;">
            <strong>Notes:</strong> ${order.notes}
          </div>
        ` : ''}
        
        <div class="footer">
          <p>If you have any questions about your order, please contact us.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET requests are allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check authentication
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
    // Get order with client and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
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
    
    // Generate order summary HTML
    const html = generateOrderSummaryHTML(order, order.client, order.items);
    
    // Setup JSDOM environment for html-to-image
    const dom = new JSDOM(html, { 
      resources: "usable",
      runScripts: "dangerously",
    });
    
    global.window = dom.window as any;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads');
    const summariesDir = path.join(uploadDir, 'summaries');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(summariesDir)) {
      fs.mkdirSync(summariesDir, { recursive: true });
    }
    
    // Generate PNG from HTML
    const summaryElement = dom.window.document.querySelector('.container');
    const dataUrl = await toPng(summaryElement as any);
    
    // Convert base64 to buffer and save to file
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filename = `order_summary_${orderId}_${Date.now()}.png`;
    const filePath = path.join(summariesDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    // Return the URL to the generated file
    const fileUrl = `/uploads/summaries/${filename}`;
    
    return res.status(200).json({
      success: true,
      message: 'Order summary generated successfully',
      summaryUrl: fileUrl,
      order,
    });
  } catch (error: any) {
    console.error('Error generating order summary:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate order summary' });
  }
}

// Configure Next.js config for larger payload handling
export const config = {
  api: {
    responseLimit: '8mb',
  },
};