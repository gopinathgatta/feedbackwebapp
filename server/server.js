import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

import pool from './database.js';
import authRoutes from './routes/authRoutes.js';
import mealRoutes from './routes/meals.js';
import feedbackRoutes from './routes/feedback.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['Content-Type']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'API is running' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'success', message: 'Database connection successful', timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong with the API!' });
});

// Serve React build files
app.use(express.static(path.join(__dirname, '../dist')));

// ✅ React client-side routing fallback (safe for Node 22)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();

  const indexPath = path.resolve(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('React build not found');
  }
});

// General error handler
app.use((err, req, res, next) => {
  console.error('General Error:', err.stack);

  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'Something went wrong!', message: err.message });
  }

  res.status(500).sendFile(path.resolve(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running and listening on port ${PORT}`);
});

export default app;
