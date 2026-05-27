const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/shipping_db',
  max: 3,
});

pool.on('error', (err) => console.error('DB pool error:', err.message));

module.exports = pool;
