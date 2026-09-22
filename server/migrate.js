const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('PostgreSQL schema is ready.');
}

migrate().catch(error => {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
