const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware para todas las rutas (requiere autenticación)
router.use(authMiddleware);

// Rutas existentes
router.get('/perfil', usuarioController.obtenerPerfil);
router.get('/listar', usuarioController.listarUsuarios); // solo admin

// Nuevas rutas CRUD
// GET /api/usuarios - Obtener todos los usuarios
router.get('/', usuarioController.obtenerTodos);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', usuarioController.obtenerPorId);

// POST /api/usuarios - Crear nuevo usuario
router.post('/', usuarioController.crear);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', usuarioController.actualizar);

// PUT /api/usuarios/:id/resetear-contrasena - Resetear contraseña
router.put('/:id/resetear-contrasena', usuarioController.resetearContrasena);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', usuarioController.eliminar);

module.exports = router;
