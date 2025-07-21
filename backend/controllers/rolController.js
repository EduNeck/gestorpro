const rolModel = require('../db/models/rolModel');

const rolController = {
    // Obtener todos los roles
    obtenerTodos: async (req, res) => {
        try {
            const roles = await rolModel.obtenerTodos();
            res.json(roles);
        } catch (error) {
            console.error('Error al obtener roles:', error);
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Obtener rol por ID
    obtenerPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const rol = await rolModel.obtenerPorId(id);
            
            if (!rol) {
                return res.status(404).json({ mensaje: 'Rol no encontrado' });
            }
            
            res.json(rol);
        } catch (error) {
            console.error('Error al obtener rol:', error);
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Crear nuevo rol
    crear: async (req, res) => {
        try {
            const { nombre } = req.body;
            
            // Validaciones básicas
            if (!nombre) {
                return res.status(400).json({ 
                    mensaje: 'El nombre del rol es requerido' 
                });
            }

            if (nombre.length < 2 || nombre.length > 50) {
                return res.status(400).json({ 
                    mensaje: 'El nombre debe tener entre 2 y 50 caracteres' 
                });
            }

            // Validar formato (sin espacios)
            if (/\s/.test(nombre)) {
                return res.status(400).json({ 
                    mensaje: 'El nombre del rol no debe contener espacios' 
                });
            }

            const nuevoRol = await rolModel.crear({ nombre });
            
            res.status(201).json({
                mensaje: 'Rol creado exitosamente',
                rol: nuevoRol
            });
        } catch (error) {
            console.error('Error al crear rol:', error);
            
            if (error.message.includes('Ya existe')) {
                return res.status(409).json({ mensaje: error.message });
            }
            
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Actualizar rol
    actualizar: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre } = req.body;
            
            // Validaciones básicas
            if (!nombre) {
                return res.status(400).json({ 
                    mensaje: 'El nombre del rol es requerido' 
                });
            }

            if (nombre.length < 2 || nombre.length > 50) {
                return res.status(400).json({ 
                    mensaje: 'El nombre debe tener entre 2 y 50 caracteres' 
                });
            }

            // Validar formato (sin espacios)
            if (/\s/.test(nombre)) {
                return res.status(400).json({ 
                    mensaje: 'El nombre del rol no debe contener espacios' 
                });
            }

            const rolActualizado = await rolModel.actualizar(id, { nombre });
            
            res.json({
                mensaje: 'Rol actualizado exitosamente',
                rol: rolActualizado
            });
        } catch (error) {
            console.error('Error al actualizar rol:', error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ mensaje: error.message });
            }
            
            if (error.message.includes('Ya existe')) {
                return res.status(409).json({ mensaje: error.message });
            }
            
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Eliminar rol
    eliminar: async (req, res) => {
        try {
            const { id } = req.params;
            
            const rolEliminado = await rolModel.eliminar(id);
            
            res.json({
                mensaje: 'Rol eliminado exitosamente',
                rol: rolEliminado
            });
        } catch (error) {
            console.error('Error al eliminar rol:', error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ mensaje: error.message });
            }
            
            if (error.message.includes('usuarios asignados')) {
                return res.status(409).json({ mensaje: error.message });
            }
            
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Obtener usuarios de un rol
    obtenerUsuarios: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar que el rol existe
            const rolExiste = await rolModel.existe(id);
            if (!rolExiste) {
                return res.status(404).json({ mensaje: 'Rol no encontrado' });
            }
            
            const usuarios = await rolModel.obtenerUsuarios(id);
            res.json(usuarios);
        } catch (error) {
            console.error('Error al obtener usuarios del rol:', error);
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Obtener estadísticas del rol
    obtenerEstadisticas: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar que el rol existe
            const rol = await rolModel.obtenerPorId(id);
            if (!rol) {
                return res.status(404).json({ mensaje: 'Rol no encontrado' });
            }
            
            const conteoUsuarios = await rolModel.contarUsuarios(id);
            
            res.json({
                rol: rol,
                usuariosAsignados: conteoUsuarios
            });
        } catch (error) {
            console.error('Error al obtener estadísticas del rol:', error);
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    }
};

module.exports = rolController;
