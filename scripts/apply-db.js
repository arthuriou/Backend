/* eslint-disable no-console */
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

(async () => {
  try {
    const sql = fs.readFileSync('src/shared/script/database.sql', 'utf8');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'santeAfrikDb',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: false,
    });

    await pool.query(sql);
    console.log('✅ Database script applied successfully');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ DB apply error:', err.message);
    process.exit(1);
  }
})();


