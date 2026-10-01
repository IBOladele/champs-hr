import { Pool, types } from 'pg';

// Return DATE columns as plain "YYYY-MM-DD" strings rather than JavaScript Date
// objects. The default parser applies new Date(text) which shifts the date in
// non-UTC timezones (e.g. BST converts "2026-06-21" → "2026-06-20T23:00:00Z").
types.setTypeParser(1082, (val: string) => val);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: process.env.NODE_ENV === 'production' ? 2000 : 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export default pool;
