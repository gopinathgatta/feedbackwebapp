
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

// Use Azure PORT or fallback
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN, // now strictly using deployed frontend URL
  credentials: true,
  exposedHeaders: ['Content-Type']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/feedback', feedbackRoutes);

// API Status Route
app.get('/api/status', (req, res) => {
  res.json({ status: 'success', message: 'API is running' });
});

// Database Test Route
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'success', message: 'Database connection successful', timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

// API Error Handler
app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong with the API!', message: err.message });
});

// Serve React build files
const reactBuildPath = path.join(__dirname, '../dist');
app.use(express.static(reactBuildPath));

// React Router Fallback
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.resolve(reactBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('React build not found');
  }
});

// General Error Handler
app.use((err, req, res, next) => {
  console.error('General Error:', err.stack);
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'Something went wrong!', message: err.message });
  }
  const indexPath = path.resolve(reactBuildPath, 'index.html');
  res.status(500).sendFile(indexPath);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running and listening on port ${PORT}`);
});

export default app;
