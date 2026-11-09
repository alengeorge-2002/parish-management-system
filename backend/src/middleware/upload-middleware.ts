import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getUploadSubdir = (subdir: string) => {
  const candidateBases = [
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'backend/uploads'),
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../../uploads'),
  ];
  const base = candidateBases.find((dir) => fs.existsSync(dir)) || path.join(process.cwd(), 'uploads');
  const target = path.join(base, subdir);
  fs.mkdirSync(target, { recursive: true });
  return target;
};

// Fallback disk storage for local development when Cloudinary is not configured
const diskFamilyStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = getUploadSubdir('family-photos');
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'family-' + uniqueSuffix + ext);
  }
});

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Cloudinary storage engine for family group photos
const cloudinaryFamilyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'parish/family-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  } as any,
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.'));
  }
};

export const uploadFamilyPhoto = multer({
  storage: isCloudinaryConfigured ? cloudinaryFamilyStorage : diskFamilyStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Cloudinary storage engine for clergy portraits
const cloudinaryClergyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'parish/clergy',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'fill', gravity: 'face', quality: 'auto' }],
  } as any,
});

const clergyStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = getUploadSubdir('clergy-avatars');
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'clergy-' + uniqueSuffix + ext);
  }
});

export const uploadClergyPhoto = multer({
  storage: isCloudinaryConfigured ? cloudinaryClergyStorage : clergyStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadClergyAvatar = uploadClergyPhoto;
