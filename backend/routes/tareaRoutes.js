const express = require('express');
const router = express.Router();
const TareaController = require('../controllers/tareaController');
const verificarToken = require('../middleware/authMiddleware');

router.use(verificarToken);

router.post('/', TareaController.crear);
router.get('/proyecto/:id_proyecto', TareaController.listar); // Nueva ruta específica
router.get('/:id_proyecto', TareaController.listar); // Mantener compatibilidad
router.put('/:id', TareaController.actualizar);
router.delete('/:id', TareaController.eliminar);

module.exports = router;
