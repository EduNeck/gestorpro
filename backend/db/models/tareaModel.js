const pool = require('../../config/db');

const TareaModel = {
  async crear(data) {
    const { id_proyecto, titulo, descripcion, fecha_vencimiento, prioridad } = data;
    const result = await pool.query(`
      INSERT INTO tareas (id_proyecto, titulo, descripcion, fecha_vencimiento, prioridad)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [id_proyecto, titulo, descripcion, fecha_vencimiento, prioridad]);

    return result.rows[0];
  },

  async listarPorProyecto(id_proyecto) {
    const result = await pool.query(`
      SELECT * FROM tareas
      WHERE id_proyecto = $1
      ORDER BY fecha_vencimiento ASC;
    `, [id_proyecto]);

    return result.rows;
  },

  async obtenerPorId(id) {
    const result = await pool.query(`
      SELECT * FROM tareas
      WHERE id = $1;
    `, [id]);

    return result.rows[0];
  },

  async actualizar(id, data) {
    const { titulo, descripcion, fecha_vencimiento, prioridad, estado } = data;
    const result = await pool.query(`
      UPDATE tareas
      SET titulo = $1, descripcion = $2, fecha_vencimiento = $3, prioridad = $4, estado = $5
      WHERE id = $6
      RETURNING *;
    `, [titulo, descripcion, fecha_vencimiento, prioridad, estado, id]);

    return result.rows[0];
  },

  async eliminar(id) {
    await pool.query('DELETE FROM tareas WHERE id = $1', [id]);
    return { mensaje: 'Tarea eliminada correctamente' };
  }
};

module.exports = TareaModel;
