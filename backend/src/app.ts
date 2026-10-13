import express from 'express';
import cors from 'cors';
import path from 'path';
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
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount central API routes
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Parish Management API (MongoDB Serverless)');
});

export default app;
