const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware para todas las rutas (requiere autenticación)
router.use(authMiddleware);

// GET /api/roles - Obtener todos los roles
router.get('/', rolController.obtenerTodos);

// GET /api/roles/:id - Obtener rol por ID
router.get('/:id', rolController.obtenerPorId);

// POST /api/roles - Crear nuevo rol
router.post('/', rolController.crear);

// PUT /api/roles/:id - Actualizar rol
router.put('/:id', rolController.actualizar);

// DELETE /api/roles/:id - Eliminar rol
router.delete('/:id', rolController.eliminar);

// GET /api/roles/:id/usuarios - Obtener usuarios de un rol
router.get('/:id/usuarios', rolController.obtenerUsuarios);

// GET /api/roles/:id/estadisticas - Obtener estadísticas del rol
router.get('/:id/estadisticas', rolController.obtenerEstadisticas);

module.exports = router;
