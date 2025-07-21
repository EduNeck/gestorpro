const bcrypt = require('bcrypt');
const UsuarioModel = require('../db/models/usuarioModel');
const rolModel = require('../db/models/rolModel');
const pool = require('../config/db');

const usuarioController = {
    // Obtener perfil del usuario actual
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

    // Obtener todos los usuarios
    async obtenerTodos(req, res) {
        try {
            const usuarios = await UsuarioModel.obtenerTodos();
            res.json(usuarios);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Listar usuarios (para admins)
    async listarUsuarios(req, res) {
        if (req.usuario.rol !== 1) {
            return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
        }

        try {
            const usuarios = await UsuarioModel.obtenerTodos();
            res.json(usuarios);
        } catch (error) {
            console.error('Error al listar usuarios:', error);
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Obtener usuario por ID
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await UsuarioModel.obtenerPorId(id);
            
            if (!usuario) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }
            
            // Eliminar la contraseña de la respuesta
            delete usuario.contrasena;
            
            res.json(usuario);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Crear nuevo usuario
    async crear(req, res) {
        try {
            const { nombre, correo, contrasena, id_rol, estado = true } = req.body;
            
            // Validaciones básicas
            if (!nombre || !correo || !contrasena) {
                return res.status(400).json({ 
                    mensaje: 'Nombre, correo y contraseña son requeridos' 
                });
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                return res.status(400).json({ 
                    mensaje: 'Formato de correo inválido' 
                });
            }

            // Validar contraseña
            if (contrasena.length < 6) {
                return res.status(400).json({ 
                    mensaje: 'La contraseña debe tener al menos 6 caracteres' 
                });
            }

            // Validar rol si se proporciona
            if (id_rol) {
                const rolExiste = await rolModel.existe(id_rol);
                if (!rolExiste) {
                    return res.status(400).json({ mensaje: 'El rol especificado no existe' });
                }
            }

            // Hashear la contraseña
            const contrasenaHasheada = await bcrypt.hash(contrasena, 10);

            const nuevoUsuario = await UsuarioModel.crear({
                nombre,
                correo,
                contrasena: contrasenaHasheada,
                id_rol,
                estado
            });
            
            // Eliminar la contraseña de la respuesta
            delete nuevoUsuario.contrasena;
            
            res.status(201).json({
                mensaje: 'Usuario creado exitosamente',
                usuario: nuevoUsuario
            });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            
            if (error.message.includes('Ya existe')) {
                return res.status(409).json({ mensaje: error.message });
            }
            
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Actualizar usuario
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre, correo, id_rol, estado } = req.body;
            
            // Validaciones básicas
            if (!nombre || !correo) {
                return res.status(400).json({ 
                    mensaje: 'Nombre y correo son requeridos' 
                });
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                return res.status(400).json({ 
                    mensaje: 'Formato de correo inválido' 
                });
            }

            // Validar rol si se proporciona
            if (id_rol) {
                const rolExiste = await rolModel.existe(id_rol);
                if (!rolExiste) {
                    return res.status(400).json({ mensaje: 'El rol especificado no existe' });
                }
            }

            const usuarioActualizado = await UsuarioModel.actualizar(id, {
                nombre,
                correo,
                id_rol,
                estado
            });
            
            // Eliminar la contraseña de la respuesta
            delete usuarioActualizado.contrasena;
            
            res.json({
                mensaje: 'Usuario actualizado exitosamente',
                usuario: usuarioActualizado
            });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            
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

    // Resetear contraseña
    async resetearContrasena(req, res) {
        try {
            const { id } = req.params;
            const { contrasena } = req.body;
            
            // Validaciones básicas
            if (!contrasena) {
                return res.status(400).json({ 
                    mensaje: 'La nueva contraseña es requerida' 
                });
            }

            // Validar contraseña
            if (contrasena.length < 6) {
                return res.status(400).json({ 
                    mensaje: 'La contraseña debe tener al menos 6 caracteres' 
                });
            }

            // Hashear la nueva contraseña
            const contrasenaHasheada = await bcrypt.hash(contrasena, 10);

            await UsuarioModel.actualizarContrasena(id, contrasenaHasheada);
            
            res.json({
                mensaje: 'Contraseña actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error al resetear contraseña:', error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ mensaje: error.message });
            }
            
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    },

    // Eliminar usuario
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            const usuarioEliminado = await UsuarioModel.eliminar(id);
            
            res.json({
                mensaje: 'Usuario eliminado exitosamente',
                usuario: usuarioEliminado
            });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            
            if (error.message.includes('no encontrado')) {
                return res.status(404).json({ mensaje: error.message });
            }
            
            res.status(500).json({ 
                mensaje: 'Error interno del servidor',
                error: error.message 
            });
        }
    }
};

module.exports = usuarioController;
