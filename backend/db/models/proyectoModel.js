const pool = require('../../config/db');

const ProyectoModel = {
  async crear({ id_usuario, nombre, descripcion, fecha_inicio, fecha_fin }) {
    const result = await pool.query(`
      INSERT INTO proyectos (id_usuario, nombre, descripcion, fecha_inicio, fecha_fin, fecha_creacion)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *;
    `, [id_usuario, nombre, descripcion, fecha_inicio, fecha_fin]);

    return result.rows[0];
  },

  async listarPorUsuario(id_usuario) {
    const result = await pool.query(`
      SELECT * FROM proyectos
      WHERE id_usuario = $1
      ORDER BY id DESC;
    `, [id_usuario]);

    return result.rows;
  },

  async obtenerPorId(id, id_usuario) {
    const result = await pool.query(`
      SELECT * FROM proyectos
      WHERE id = $1 AND id_usuario = $2;
    `, [id, id_usuario]);

    return result.rows[0];
  },

  async actualizar(id, data) {
    const { nombre, descripcion, fecha_inicio, fecha_fin, estado } = data;
    const result = await pool.query(`
      UPDATE proyectos
      SET nombre = $1, descripcion = $2, fecha_inicio = $3, fecha_fin = $4, estado = $5
      WHERE id = $6
      RETURNING *;
    `, [nombre, descripcion, fecha_inicio, fecha_fin, estado, id]);

    return result.rows[0];
  },

  async eliminar(id) {
    await pool.query('DELETE FROM proyectos WHERE id = $1', [id]);
    return { mensaje: 'Proyecto eliminado' };
  }
};

module.exports = ProyectoModel;
