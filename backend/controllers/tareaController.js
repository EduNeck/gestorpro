const TareaModel = require('../db/models/tareaModel');

const TareaController = {
  async crear(req, res) {
    const id_usuario = req.usuario.id; // Obtener del token JWT
    
    try {
      const { id_proyecto } = req.body;
      
      // Verificar que el proyecto pertenece al usuario
      const ProyectoModel = require('../db/models/proyectoModel');
      const proyecto = await ProyectoModel.obtenerPorId(id_proyecto, id_usuario);
      
      if (!proyecto) {
        return res.status(404).json({ mensaje: 'Proyecto no encontrado o no autorizado' });
      }
      
      const tarea = await TareaModel.crear(req.body);
      res.status(201).json(tarea);
    } catch (error) {
      console.error('Error al crear tarea:', error);
      res.status(500).json({ mensaje: 'Error al crear tarea', error: error.message });
    }
  },

  async listar(req, res) {
    const { id_proyecto } = req.params;
    const id_usuario = req.usuario.id; // Obtener del token JWT
    
    try {
      // Primero verificar que el proyecto pertenece al usuario
      const ProyectoModel = require('../db/models/proyectoModel');
      const proyecto = await ProyectoModel.obtenerPorId(id_proyecto, id_usuario);
      
      if (!proyecto) {
        return res.status(404).json({ mensaje: 'Proyecto no encontrado o no autorizado' });
      }
      
      const tareas = await TareaModel.listarPorProyecto(id_proyecto);
      res.json(tareas);
    } catch (error) {
      console.error('Error al listar tareas:', error);
      res.status(500).json({ mensaje: 'Error al listar tareas', error: error.message });
    }
  },

  async actualizar(req, res) {
    const { id } = req.params;
    const id_usuario = req.usuario.id;
    
    try {
      // Verificar que la tarea pertenece a un proyecto del usuario
      const tareaExistente = await TareaModel.obtenerPorId(id);
      if (!tareaExistente) {
        return res.status(404).json({ mensaje: 'Tarea no encontrada' });
      }
      
      const ProyectoModel = require('../db/models/proyectoModel');
      const proyecto = await ProyectoModel.obtenerPorId(tareaExistente.id_proyecto, id_usuario);
      
      if (!proyecto) {
        return res.status(403).json({ mensaje: 'No autorizado para modificar esta tarea' });
      }
      
      const tarea = await TareaModel.actualizar(id, req.body);
      res.json(tarea);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      res.status(500).json({ mensaje: 'Error al actualizar tarea', error: error.message });
    }
  },

  async eliminar(req, res) {
    const { id } = req.params;
    const id_usuario = req.usuario.id;
    
    try {
      // Verificar que la tarea pertenece a un proyecto del usuario
      const tareaExistente = await TareaModel.obtenerPorId(id);
      if (!tareaExistente) {
        return res.status(404).json({ mensaje: 'Tarea no encontrada' });
      }
      
      const ProyectoModel = require('../db/models/proyectoModel');
      const proyecto = await ProyectoModel.obtenerPorId(tareaExistente.id_proyecto, id_usuario);
      
      if (!proyecto) {
        return res.status(403).json({ mensaje: 'No autorizado para eliminar esta tarea' });
      }
      
      const resultado = await TareaModel.eliminar(id);
      res.json(resultado);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      res.status(500).json({ mensaje: 'Error al eliminar tarea', error: error.message });
    }
  }
};

module.exports = TareaController;
