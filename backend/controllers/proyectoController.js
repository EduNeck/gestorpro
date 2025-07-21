// backend/controllers/proyectoController.js
const ProyectoModel = require('../db/models/proyectoModel');

const listar = async (req, res) => {
  try {
    // Obtener el id del usuario desde el token JWT (viene del middleware de autenticación)
    const id_usuario = req.usuario.id;
    const proyectos = await ProyectoModel.listarPorUsuario(id_usuario);
    res.json(proyectos);
  } catch (error) {
    console.error('Error al listar proyectos:', error);
    res.status(500).json({ mensaje: 'Error al obtener proyectos' });
  }
};

const crear = async (req, res) => {
  try {
    // Obtener el id del usuario desde el token JWT
    const id_usuario = req.usuario.id;
    const datosProyecto = {
      ...req.body,
      id_usuario
    };
    const nuevoProyecto = await ProyectoModel.crear(datosProyecto);
    res.status(201).json(nuevoProyecto);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ mensaje: 'Error al crear proyecto' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id;
    const proyecto = await ProyectoModel.obtenerPorId(id, id_usuario);
    
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }
    
    res.json(proyecto);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ mensaje: 'Error al obtener proyecto' });
  }
};

const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id;
    
    // Verificar que el proyecto pertenece al usuario
    const proyectoExistente = await ProyectoModel.obtenerPorId(id, id_usuario);
    if (!proyectoExistente) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }
    
    const proyectoActualizado = await ProyectoModel.actualizar(id, req.body);
    res.json(proyectoActualizado);
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ mensaje: 'Error al actualizar proyecto' });
  }
};

const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.usuario.id;
    
    // Verificar que el proyecto pertenece al usuario
    const proyectoExistente = await ProyectoModel.obtenerPorId(id, id_usuario);
    if (!proyectoExistente) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }
    
    await ProyectoModel.eliminar(id);
    res.json({ mensaje: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar proyecto' });
  }
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
