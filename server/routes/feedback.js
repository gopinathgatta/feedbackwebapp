import express from 'express';
import pool from '../database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ✅ TEST ROUTE 
router.get('/test', (req, res) => { 
  res.json({ message: 'Feedback route working!' }); 
});

// 🔒 Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log("🧩 Authorization Header Received:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log("🪪 Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token Verified:", decoded);
    
    // ✅ Normalize keys for consistent access
    // Handles both user_id and student_id or userId naming cases
    const userInfo = {
      user_id: decoded.user_id || decoded.userId || decoded.id || decoded.student_id,
      email: decoded.email || decoded.user_email || '',
      role: decoded.role || decoded.user_role || ''
    };

    if (!userInfo.user_id) {
      console.warn("⚠️ Warning: No user_id found in decoded token!");
    }

    req.user = userInfo;
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};


// ✅ Get all feedback with related meal info
router.get('/', verifyToken, async (req, res) => {
  const { type, date, rating, student_id } = req.query;

  try {
    let query = `
      SELECT 
        f.feedback_id, f.rating, f.comments,
        m.meal_id, m.meal_name, m.meal_type, m.meal_date
      FROM feedback f
      JOIN meals m ON f.meal_id = m.meal_id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND m.meal_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    if (date) {
      query += ` AND m.meal_date = $${paramIndex}`;
      queryParams.push(date);
      paramIndex++;
    }

    if (rating) {
      query += ` AND f.rating = $${paramIndex}`;
      queryParams.push(parseInt(rating));
      paramIndex++;
    }

    if (student_id) {
      query += ` AND f.student_id = $${paramIndex}`;
      queryParams.push(parseInt(student_id));
      paramIndex++;
    }

    query += ' ORDER BY f.feedback_id DESC';

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({ error: 'Server error while fetching feedback' });
  }
});

// ✅ Submit feedback
router.post('/', verifyToken, async (req, res) => {
  const { meal_id, rating, comments } = req.body;
  const student_id = req.user.user_id; // ✅ Now always extracted from token properly

  if (!meal_id || !rating)
    return res.status(400).json({ error: 'Meal ID and rating are required' });

  if (!student_id)
    return res.status(400).json({ error: 'Student ID missing from token' });

  try {
    console.log('Submitting feedback with:', { meal_id, rating, comments, student_id });
    
    const result = await pool.query(
      `INSERT INTO feedback (meal_id, rating, comments, student_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [meal_id, rating, comments || '', student_id]
    );
    
    console.log('✅ Feedback inserted successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    res.status(500).json({ error: 'Server error while submitting feedback: ' + error.message });
  }
});

// ✅ Get present day meals for feedback
router.get('/present', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        meal_id, meal_name, meal_type, meal_date
      FROM meals
      WHERE meal_date = $1
      ORDER BY 
        CASE 
          WHEN meal_type = 'breakfast' THEN 1
          WHEN meal_type = 'lunch' THEN 2
          WHEN meal_type = 'dinner' THEN 3
          ELSE 4
        END
    `;

    const result = await pool.query(query, [today]);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching present meals:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Server error while fetching present meals' });
  }
});

// ✅ Feedback statistics
router.get('/stats', verifyToken, async (req, res) => {
  const { type, date } = req.query;

  try {
    let query = `
      SELECT 
        m.meal_id, m.meal_name, m.meal_type, m.meal_date,
        COUNT(f.feedback_id) AS feedback_count,
        ROUND(AVG(f.rating), 2) AS average_rating
      FROM meals m
      LEFT JOIN feedback f ON m.meal_id = f.meal_id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND m.meal_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    if (date) {
      query += ` AND m.meal_date = $${paramIndex}`;
      queryParams.push(date);
      paramIndex++;
    }

    query += ' GROUP BY m.meal_id, m.meal_name, m.meal_type, m.meal_date ORDER BY m.meal_date DESC';

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Server error while fetching feedback statistics' });
  }
});

export default router;
