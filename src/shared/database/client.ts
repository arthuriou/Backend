import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'santeAfrikDb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSLMODE === 'require' || process.env.DB_SSLMODE === 'verify-full',
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
});

export default pool;
