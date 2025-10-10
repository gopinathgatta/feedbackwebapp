import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Making SSL optional to support local development
  ...(process.env.NODE_ENV === 'production' ? { ssl: { rejectUnauthorized: false } } : {})
});

// Test the database connection asynchronously
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected successfully at:', res.rows[0].now);
  } catch (err) {
    console.error('Database connection error:', err.stack);
  }
})();

export default pool;
