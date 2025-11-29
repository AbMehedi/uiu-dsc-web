import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, '../public/images/events'),
  path.join(__dirname, '../public/images/team'),
  path.join(__dirname, '../public/images/partners')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine folder based on route
    let folder = 'events';
    if (req.path.includes('/team')) {
      folder = 'team';
    } else if (req.path.includes('/partners')) {
      folder = 'partners';
    }
    
    cb(null, path.join(__dirname, `../public/images/${folder}`));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toLowerCase();
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Create upload middleware
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to delete old image file
export const deleteImageFile = (imageUrl: string): void => {
  if (!imageUrl || imageUrl.includes('default') || imageUrl.startsWith('http')) {
    return; // Don't delete default images or external URLs
  }
  
  const imagePath = path.join(__dirname, '../public', imageUrl);
  
  if (fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
      console.log(`Deleted old image: ${imagePath}`);
    } catch (error) {
      console.error(`Error deleting image: ${imagePath}`, error);
    }
  }
};
