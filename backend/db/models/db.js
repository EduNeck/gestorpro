// backend/models/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'gestorpro',
  port: 5432
});

module.exports = pool;
