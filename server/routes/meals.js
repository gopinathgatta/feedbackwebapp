import express from 'express';
import pool from '../database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    req.user = verified;
    next();
  } catch (error) {
    console.log('Invalid token:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET all meals
router.get('/', verifyToken, async (req, res) => {
  const { type, date } = req.query;
  
  try {
    let query = 'SELECT * FROM meals WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;
    
    if (type) {
      query += ` AND meal_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }
    
    if (date) {
      query += ` AND meal_date = $${paramIndex}`;
      queryParams.push(date);
      paramIndex++;
    }
    
    console.log('Running GET query:', query, queryParams);
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching meals:', error.message);
    res.status(500).json({ error: 'Server error while fetching meals: ' + error.message });
  }
});

// POST create meal (admin only)
router.post('/', verifyToken, async (req, res) => {
  console.log('--- POST /meals called ---');
  console.log('User info:', req.user);

  if (req.user.role !== 'admin') {
    console.log('Access denied: not admin');
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { meal_name, type, meal_date } = req.body;
  console.log('Request body:', req.body);

  if (!meal_name || !type || !meal_date) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (isNaN(Date.parse(meal_date))) {
    console.log('Invalid date format:', meal_date);
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO meals (meal_name, meal_type, meal_date) VALUES ($1, $2, $3) RETURNING *',
      [meal_name, type, meal_date]
    );
    
    console.log('INSERT result:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating meal - full error object:', error);
    res.status(500).json({ 
      error: 'Server error while creating meal', 
      details: error.message 
    });
  }
});

// PUT update meal (admin only)
router.put('/:id', verifyToken, async (req, res) => {
  console.log('--- PUT /meals/:id called ---');
  console.log('User info:', req.user);

  if (req.user.role !== 'admin') {
    console.log('Access denied: not admin');
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  const { meal_name, type, meal_date } = req.body;
  console.log('Request body:', req.body);

  if (!meal_name || !type || !meal_date) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (isNaN(Date.parse(meal_date))) {
    console.log('Invalid date format:', meal_date);
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
  }

  try {
    const checkResult = await pool.query('SELECT * FROM meals WHERE meal_id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      console.log('Meal not found:', id);
      return res.status(404).json({ error: 'Meal not found' });
    }

    const result = await pool.query(
      'UPDATE meals SET meal_name = $1, meal_type = $2, meal_date = $3 WHERE meal_id = $4 RETURNING *',
      [meal_name, type, meal_date, id]
    );

    console.log('UPDATE result:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating meal - full error object:', error);
    res.status(500).json({ error: 'Failed to update meal: ' + error.message });
  }
});

// DELETE meal (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  console.log('--- DELETE /meals/:id called ---');
  console.log('User info:', req.user);

  if (req.user.role !== 'admin') {
    console.log('Access denied: not admin');
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM meals WHERE meal_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.log('Meal not found:', id);
      return res.status(404).json({ error: 'Meal not found' });
    }

    console.log('Meal deleted successfully:', result.rows[0]);
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal - full error object:', error);
    res.status(500).json({ error: 'Failed to delete meal: ' + error.message });
  }
});

export default router;
