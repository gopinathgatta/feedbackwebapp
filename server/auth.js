import jwt from 'jsonwebtoken';
import pool from './database.js';
import bcrypt from 'bcrypt';

// ✅ Generate JWT token
const generateToken = (user_id, email, role) => {
  return jwt.sign(
    { user_id, email, role },
    process.env.JWT_SECRET || 'default_secret_key',
    { expiresIn: '24h' }
  );
};

// ✅ Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ✅ Login function
const login = async (email, password) => {
  if (!email || !password) throw new Error('Email and password are required');

  // Check user in auth schema
  const result = await pool.query(
    'SELECT * FROM auth.user WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) throw new Error('Invalid credentials');

  const user = result.rows[0];

  // Compare password using bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isPasswordValid) throw new Error('Invalid credentials');

  // Fetch role-specific data
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

  const token = generateToken(user.user_id, user.email, user.role);

  return {
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.user_id,
      email: user.email,
      role: user.role,
      name: name || 'User'
    },
    roleData: roleData || {}
  };
};

// ✅ Register function
const register = async (userData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if email already exists
    const emailCheck = await client.query(
      'SELECT * FROM auth.user WHERE email = $1',
      [userData.email]
    );

    if (emailCheck.rows.length > 0) {
      throw new Error('Email already exists. Please use a different email address.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insert into auth.user table
    const userResult = await client.query(
      'INSERT INTO auth.user (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, email, role',
      [userData.email, hashedPassword, userData.role]
    );

    const user = userResult.rows[0];

    // Insert role-based data
    if (userData.role === 'student') {
      await client.query(
        `INSERT INTO public.student 
          (user_id, student_name, student_roll, department, room_no, phone_number, email_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.user_id,
          userData.name,
          userData.student_roll,
          userData.department,
          userData.room_no,
          userData.phone_number,
          userData.email
        ]
      );
    } else if (userData.role === 'admin') {
      await client.query(
        `INSERT INTO public.admin 
          (user_id, admin_name, department, level) 
         VALUES ($1, $2, $3, $4)`,
        [
          user.user_id,
          userData.name,
          userData.department,
          userData.level // matches frontend select
        ]
      );
    }

    await client.query('COMMIT');

    const token = generateToken(user.user_id, user.email, user.role);

    return {
      success: true,
      message: 'User registered successfully',
      token,
      user
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export { login, register, verifyToken, generateToken };
