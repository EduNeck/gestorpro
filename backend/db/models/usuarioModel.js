const pool = require('../../config/db');

const UsuarioModel = {
  // Crear usuario
  async crearUsuario({ nombre, correo, contrasenaHasheada, idRol = 2 }) {
    const query = `
      INSERT INTO usuarios (nombre, correo, contrasena, id_rol, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, correo, id_rol, estado, fecha_creacion;
    `;
    const values = [nombre, correo, contrasenaHasheada, idRol, true];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Buscar usuario por correo
  async buscarPorCorreo(correo) {
    const query = `
      SELECT u.*, r.nombre as rol_nombre 
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id
      WHERE u.correo = $1
    `;
    const result = await pool.query(query, [correo]);
    return result.rows[0];
  },

  // Obtener todos los usuarios con información de rol
  async obtenerTodos() {
    try {
      const query = `
        SELECT 
          u.id, 
          u.nombre, 
          u.correo, 
          u.id_rol, 
          u.estado, 
          u.fecha_creacion,
          r.nombre as rol_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.id_rol = r.id
        ORDER BY u.nombre
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario por ID
  async obtenerPorId(id) {
    try {
      const query = `
        SELECT 
          u.id, 
          u.nombre, 
          u.correo, 
          u.id_rol, 
          u.estado, 
          u.fecha_creacion,
          r.nombre as rol_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.id_rol = r.id
        WHERE u.id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Crear usuario completo
  async crear(datosUsuario) {
    const { nombre, correo, contrasena, id_rol, estado = true } = datosUsuario;
    
    try {
      // Verificar si el correo ya existe
      const usuarioExistente = await this.buscarPorCorreo(correo);
      if (usuarioExistente) {
        throw new Error('Ya existe un usuario con ese correo');
      }

      const query = `
        INSERT INTO usuarios (nombre, correo, contrasena, id_rol, estado) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, nombre, correo, id_rol, estado, fecha_creacion
      `;
      const result = await pool.query(query, [nombre, correo, contrasena, id_rol, estado]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Actualizar usuario
  async actualizar(id, datosUsuario) {
    const { nombre, correo, id_rol, estado } = datosUsuario;
    
    try {
      // Verificar si existe otro usuario con el mismo correo
      const usuarioExistente = await pool.query(
        'SELECT * FROM usuarios WHERE correo = $1 AND id != $2', 
        [correo, id]
      );
      
      if (usuarioExistente.rows.length > 0) {
        throw new Error('Ya existe otro usuario con ese correo');
      }

      const query = `
        UPDATE usuarios 
        SET nombre = $1, correo = $2, id_rol = $3, estado = $4
        WHERE id = $5 
        RETURNING id, nombre, correo, id_rol, estado, fecha_creacion
      `;
      const result = await pool.query(query, [nombre, correo, id_rol, estado, id]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Actualizar contraseña
  async actualizarContrasena(id, nuevaContrasena) {
    try {
      const query = `
        UPDATE usuarios 
        SET contrasena = $1
        WHERE id = $2 
        RETURNING id, nombre, correo
      `;
      const result = await pool.query(query, [nuevaContrasena, id]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Cambiar estado del usuario
  async cambiarEstado(id, estado) {
    try {
      const query = `
        UPDATE usuarios 
        SET estado = $1
        WHERE id = $2 
        RETURNING id, nombre, correo, estado
      `;
      const result = await pool.query(query, [estado, id]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Eliminar usuario
  async eliminar(id) {
    try {
      const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Validar que el usuario existe
  async existe(id) {
    try {
      const query = 'SELECT 1 FROM usuarios WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw error;
    }
  },

  // Validar propiedad del usuario (para seguridad)
  async validarPropiedad(usuarioId, propietarioId) {
    try {
      // Si es el mismo usuario, tiene permisos
      if (usuarioId.toString() === propietarioId.toString()) {
        return true;
      }
      
      // Aquí podrías agregar lógica adicional para admins
      return false;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = UsuarioModel;
