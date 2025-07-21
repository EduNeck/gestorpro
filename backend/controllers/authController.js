const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../db/models/usuarioModel');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const AuthController = {
  async registrar(req, res) {
    const { nombre, correo, contrasena } = req.body;

    try {
      const existente = await UsuarioModel.buscarPorCorreo(correo);
      if (existente) return res.status(409).json({ mensaje: 'Correo ya registrado' });

      const contrasenaHasheada = await bcrypt.hash(contrasena, 10);
      const nuevoUsuario = await UsuarioModel.crearUsuario({ nombre, correo, contrasenaHasheada });

      res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario });
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al registrar', error: err.message });
    }
  },

  async login(req, res) {
    const { correo, contrasena } = req.body;

    try {
      const usuario = await UsuarioModel.buscarPorCorreo(correo);
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

      console.log('🔐 Contraseña enviada:', contrasena);
      console.log('🔐 Hash guardado en DB:', usuario.contrasena);

      const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!coincide) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo, rol: usuario.id_rol },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({ mensaje: 'Login exitoso', token });
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al iniciar sesión', error: err.message });
    }
  },
  
};

module.exports = AuthController;
