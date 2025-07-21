const pool = require('../../config/db');

const UsuarioModel = {
  async crearUsuario({ nombre, correo, contrasenaHasheada, idRol = 2 }) {
    const query = `
      INSERT INTO usuarios (nombre, correo, contrasena, id_rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, correo, id_rol;
    `;
    const values = [nombre, correo, contrasenaHasheada, idRol];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async buscarPorCorreo(correo) {
    const result = await pool.query(
      `SELECT * FROM usuarios WHERE correo = $1`,
      [correo]
    );
    return result.rows[0];
  }
};

module.exports = UsuarioModel;
