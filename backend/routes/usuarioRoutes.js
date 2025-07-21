const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middleware/authMiddleware');

// Rutas protegidas
router.get('/perfil', verificarToken, UsuarioController.obtenerPerfil);
router.get('/', verificarToken, UsuarioController.listarUsuarios); // solo admin
router.put('/:id', verificarToken, UsuarioController.actualizarUsuario);
router.delete('/:id', verificarToken, UsuarioController.eliminarUsuario);

module.exports = router;
