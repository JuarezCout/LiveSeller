import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { productUpload } from '../../../lib/upload/multer';
import { createRouter } from 'next-connect';

// Create a handler with next-connect to support multer middleware
const handler = createRouter<NextApiRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error('Error uploading product image:', err);
    res.status(500).json({ 
      error: err.message || 'Error uploading image' 
    });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' not allowed` });
  },
});

// Check authentication - admin only
handler.use(async (req, res, next) => {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Requires admin access' });
  }
  
  return next();
});

// Handle file upload
handler.post(productUpload.single('image'), async (req, res) => {
  try {
    // If we got here, the upload was successful
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Create a relative URL path to the file
    const imageUrl = `/uploads/products/${file.filename}`;
    
    // Return success with the image URL
    return res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      file: {
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      },
    });
  } catch (error: any) {
    console.error('Error processing uploaded image:', error);
    return res.status(500).json({ error: error.message || 'Failed to process uploaded image' });
  }
});

export default handler;

// Configure Next.js to handle the file size limit
export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser to use multer
  },
};