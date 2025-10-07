import express from 'express';
import pool from '../database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM auth.user WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Fetch role-specific data and name
    let roleData = null;
    let name = null;
    
    if (user.role === 'student') {
      const studentResult = await pool.query(
        'SELECT * FROM public.student WHERE user_id = $1',
        [user.user_id]
      );
      if (studentResult.rows.length > 0) {
        roleData = studentResult.rows[0];
        name = roleData.student_name;
      }
    } else if (user.role === 'admin') {
      const adminResult = await pool.query(
        'SELECT * FROM public.admin WHERE user_id = $1',
        [user.user_id]
      );
      if (adminResult.rows.length > 0) {
        roleData = adminResult.rows[0];
        name = roleData.admin_name;
      }
    }
    
    // Generate JWT token with fallback for JWT_SECRET
    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    res.json({
      success: true,
      user: {
        id: user.user_id,
        name: name || 'User',
        email: user.email,
        role: user.role
      },
      token,
      roleData: roleData || {}
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'student', ...otherData } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  
  try {
    // Import the register function from auth.js
    const { register } = await import('../auth.js');
    
    // Use the complete registration implementation
    const result = await register({
      name,
      email,
      password,
      role,
      ...otherData
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    
    // Improve error handling with appropriate status codes
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    } else if (error.message.includes('Invalid') || error.message.includes('credentials')) {
      return res.status(401).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Server error during registration' });
    }
  }
});

export default router;