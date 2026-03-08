const { Pool } = require('pg');
const dns = require('dns');

// Force IPv4 resolution (some networks don't support IPv6)
dns.setDefaultResultOrder('ipv4first');

const isLocalDb = (process.env.DATABASE_URL || '').includes('localhost') || (process.env.DATABASE_URL || '').includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
