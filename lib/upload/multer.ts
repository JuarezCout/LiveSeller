import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create upload directories if they don't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const productsDir = path.join(uploadsDir, 'products');
const paymentsDir = path.join(uploadsDir, 'payments');

// Ensure directories exist
[uploadsDir, productsDir, paymentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for product images
const productStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, productsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  },
});

// Storage configuration for payment proofs
const paymentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, paymentsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'payment-' + uniqueSuffix + ext);
  },
});

// File filter to only allow image files
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Create multer instances
export const productUpload = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const paymentUpload = multer({
  storage: paymentStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});