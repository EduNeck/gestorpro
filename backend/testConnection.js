// backend/testConnection.js
const pool = require('./config/db');

async function probarConexion() {
  try {
    const resultado = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('🕒 Fecha y hora actual en la base:', resultado.rows[0].now);
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  } finally {
    await pool.end(); // cerramos la conexión
  }
}

probarConexion();
