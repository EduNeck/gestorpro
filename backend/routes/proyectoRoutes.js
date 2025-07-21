const express = require('express');
const router = express.Router();
const ProyectoController = require('../controllers/proyectoController');
const verificarToken = require('../middleware/authMiddleware');

router.use(verificarToken); // proteger todas las rutas

router.post('/', ProyectoController.crear);
router.get('/', ProyectoController.listar);
router.get('/:id', ProyectoController.obtenerPorId);
router.put('/:id', ProyectoController.actualizar);
router.delete('/:id', ProyectoController.eliminar);

module.exports = router;
