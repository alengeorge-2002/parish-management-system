import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8081',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8081'
];


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev
    }
  },
  credentials: true
}));

app.use(express.json());

// Resilient uploads path detection across local, root-workspace, and deployed containers
const candidateUploadDirs = [
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'backend/uploads'),
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../../uploads'),
];
const uploadsDir = candidateUploadDirs.find((dir) => fs.existsSync(dir)) || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) {}
}

app.use('/uploads', express.static(uploadsDir));
app.use('/api/uploads', express.static(uploadsDir));

// Normalize URL to handle redundant slashes or double '/api/api/'
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api/api/')) {
    req.url = req.url.replace(/^\/api\/api\//, '/api/');
  }
  next();
});

// Dedicated Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Fallback root route indicating API is active
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Parish Management API (PostgreSQL)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount central API routes under /api and alias under root /
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
