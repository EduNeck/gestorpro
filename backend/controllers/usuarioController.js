const pool = require('../config/db');

const UsuarioController = {
  async obtenerPerfil(req, res) {
    try {
      const result = await pool.query(
        'SELECT id, nombre, correo, id_rol FROM usuarios WHERE id = $1',
        [req.usuario.id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al obtener perfil', error: err.message });
    }
  },

  async listarUsuarios(req, res) {
    if (req.usuario.rol !== 1) {
      return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
    }

    try {
      const result = await pool.query(
        'SELECT id, nombre, correo, id_rol, estado FROM usuarios ORDER BY id ASC'
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al listar usuarios', error: err.message });
    }
  },

  async actualizarUsuario(req, res) {
    const { id } = req.params;
    const { nombre, correo } = req.body;

    try {
      const result = await pool.query(
        'UPDATE usuarios SET nombre = $1, correo = $2 WHERE id = $3 RETURNING *',
        [nombre, correo, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al actualizar usuario', error: err.message });
    }
  },

  async eliminarUsuario(req, res) {
    const { id } = req.params;

    try {
      await pool.query('UPDATE usuarios SET estado = false WHERE id = $1', [id]);
      res.json({ mensaje: 'Usuario desactivado correctamente' });
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al eliminar usuario', error: err.message });
    }
  }
};

module.exports = UsuarioController;
