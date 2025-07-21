const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

let connection = null;

// Determinar qué tipo de base de datos usar
const DB_TYPE = process.env.DB_TYPE || 'postgresql';

if (DB_TYPE === 'mysql') {
  // Configuración para MySQL/MariaDB (XAMPP)
  const mysqlConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gestorpro_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  connection = mysql.createPool(mysqlConfig);

  console.log('🔗 Configuración MySQL activa');
} else {
  // Configuración para PostgreSQL (configuración original)
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'gestorpro_db',
    port: process.env.PGPORT || 5432
  });

  connection = pool;
  console.log('🔗 Configuración PostgreSQL activa');
}

// Funciones de utilidad para queries unificadas
const query = async (text, params = []) => {
  try {
    if (DB_TYPE === 'mysql') {
      const [rows] = await connection.execute(text, params);
      return { rows };
    } else {
      return await connection.query(text, params);
    }
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
};

// Función para cerrar la conexión
const close = async () => {
  if (connection) {
    if (DB_TYPE === 'mysql') {
      await connection.end();
    } else {
      await connection.end();
    }
  }
};

module.exports = {
  connection,
  query,
  close,
  DB_TYPE
};
