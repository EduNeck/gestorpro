const pool = require('../../config/db');

const rolModel = {
    // Obtener todos los roles
    obtenerTodos: async () => {
        try {
            const query = 'SELECT * FROM roles ORDER BY nombre';
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener rol por ID
    obtenerPorId: async (id) => {
        try {
            const query = 'SELECT * FROM roles WHERE id = $1';
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Obtener rol por nombre
    obtenerPorNombre: async (nombre) => {
        try {
            const query = 'SELECT * FROM roles WHERE nombre = $1';
            const result = await pool.query(query, [nombre]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Crear nuevo rol
    crear: async (datosRol) => {
        const { nombre } = datosRol;
        
        try {
            // Verificar si el rol ya existe
            const rolExistente = await rolModel.obtenerPorNombre(nombre);
            if (rolExistente) {
                throw new Error('Ya existe un rol con ese nombre');
            }

            const query = `
                INSERT INTO roles (nombre) 
                VALUES ($1) 
                RETURNING *
            `;
            const result = await pool.query(query, [nombre]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Actualizar rol
    actualizar: async (id, datosRol) => {
        const { nombre } = datosRol;
        
        try {
            // Verificar si existe otro rol con el mismo nombre
            const rolExistente = await pool.query(
                'SELECT * FROM roles WHERE nombre = $1 AND id != $2', 
                [nombre, id]
            );
            
            if (rolExistente.rows.length > 0) {
                throw new Error('Ya existe otro rol con ese nombre');
            }

            const query = `
                UPDATE roles 
                SET nombre = $1
                WHERE id = $2 
                RETURNING *
            `;
            const result = await pool.query(query, [nombre, id]);
            
            if (result.rows.length === 0) {
                throw new Error('Rol no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Eliminar rol
    eliminar: async (id) => {
        try {
            // Verificar si hay usuarios asignados a este rol
            const usuariosConRol = await pool.query(
                'SELECT COUNT(*) as count FROM usuarios WHERE id_rol = $1', 
                [id]
            );
            
            if (parseInt(usuariosConRol.rows[0].count) > 0) {
                throw new Error('No se puede eliminar el rol porque tiene usuarios asignados');
            }

            const query = 'DELETE FROM roles WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                throw new Error('Rol no encontrado');
            }
            
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Contar usuarios por rol
    contarUsuarios: async (id) => {
        try {
            const query = 'SELECT COUNT(*) as count FROM usuarios WHERE id_rol = $1';
            const result = await pool.query(query, [id]);
            return parseInt(result.rows[0].count);
        } catch (error) {
            throw error;
        }
    },

    // Obtener usuarios por rol
    obtenerUsuarios: async (id) => {
        try {
            const query = `
                SELECT u.id, u.nombre, u.correo, u.estado, u.fecha_creacion
                FROM usuarios u
                WHERE u.id_rol = $1
                ORDER BY u.nombre
            `;
            const result = await pool.query(query, [id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    },

    // Validar que el rol existe
    existe: async (id) => {
        try {
            const query = 'SELECT 1 FROM roles WHERE id = $1';
            const result = await pool.query(query, [id]);
            return result.rows.length > 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = rolModel;
