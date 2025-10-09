import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  user: 'pgadmin',
  host: 'mypgserver.postgres.database.azure.com',
  database: 'hostelmealDB',
  password: '#Gatt2005#',
  port: 5432,
  ssl: { rejectUnauthorized: false }
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
