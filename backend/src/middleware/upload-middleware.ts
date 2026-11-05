import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

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

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = getUploadSubdir('family-photos');
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'family-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PNG, JPG, and JPEG are allowed.'));
  }
};

export const uploadFamilyPhoto = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const clergyStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = getUploadSubdir('clergy-avatars');
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'clergy-' + uniqueSuffix + ext);
  }
});

export const uploadClergyAvatar = multer({
  storage: clergyStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

