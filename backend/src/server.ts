import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import conditionRoutes from './routes/conditionRoutes.js';
import { authenticateToken, type AuthRequest } from './middleware/authMiddleware.js';

dotenv.config();

import decisionPathRoutes from './routes/decisionPathRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import answerGroupRoutes from './routes/answerGroupRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import userRoutes from './routes/userRoutes.js';

import cookieParser from 'cookie-parser';

const app = express();
const prisma = new PrismaClient();

app.use(morgan('dev'));

app.use(
  cors({
    origin: true, // Allow all origins for now, or specify frontend URL
    credentials: true, // Important for cookies
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/brands', brandRoutes);
app.use('/models', modelRoutes);
app.use('/conditions', conditionRoutes);
app.use('/paths', decisionPathRoutes);
app.use('/assessments', assessmentRoutes);
app.use('/answer-groups', answerGroupRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/users', userRoutes);
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', time: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'backend', message: 'Backend is running' });
});

app.get('/db-check', async (_req, res) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    res.json({ ok: true, database: 'connected', userCount });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ ok: false, database: 'disconnected', error: String(error) });
  }
});

app.get('/test-auth', authenticateToken, (req: AuthRequest, res) => {
  res.json({ message: 'Authenticated successfully', user: req.user });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
