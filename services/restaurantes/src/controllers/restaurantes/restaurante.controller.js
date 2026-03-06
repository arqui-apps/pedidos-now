const { Restaurante, HorarioRestaurante } = require('../models');

// Obtener todos los restaurantes con filtros opcionales
exports.getAll = async (req, res, next) => {
  try {
    const { activo, disponible } = req.query;
    
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (disponible !== undefined) where.disponible = disponible === 'true';

    const restaurantes = await Restaurante.findAll({
      where,
      include: [
        {
          model: HorarioRestaurante,
          as: 'horarios',
          where: { activo: true },
          required: false
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: restaurantes,
      count: restaurantes.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un restaurante por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurante = await Restaurante.findByPk(id, {
      include: [
        {
          model: HorarioRestaurante,
          as: 'horarios',
          where: { activo: true },
          required: false
        }
      ]
    });

    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    res.json({
      success: true,
      data: restaurante
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo restaurante
exports.create = async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      direccion,
      telefono,
      correo,
      logo_url,
      disponible
    } = req.body;

    const restaurante = await Restaurante.create({
      nombre,
      descripcion,
      direccion,
      telefono,
      correo,
      logo_url,
      disponible: disponible || false,
      activo: true,
      fecha_registro: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Restaurante creado exitosamente',
      data: restaurante
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un restaurante existente
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      direccion,
      telefono,
      correo,
      logo_url,
      disponible
    } = req.body;

    const restaurante = await Restaurante.findByPk(id);

    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    await restaurante.update({
      nombre: nombre || restaurante.nombre,
      descripcion: descripcion !== undefined ? descripcion : restaurante.descripcion,
      direccion: direccion || restaurante.direccion,
      telefono: telefono !== undefined ? telefono : restaurante.telefono,
      correo: correo !== undefined ? correo : restaurante.correo,
      logo_url: logo_url !== undefined ? logo_url : restaurante.logo_url,
      disponible: disponible !== undefined ? disponible : restaurante.disponible,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: 'Restaurante actualizado exitosamente',
      data: restaurante
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar (inactivar) un restaurante
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const restaurante = await Restaurante.findByPk(id);

    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    await restaurante.update({
      activo: false,
      disponible: false,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: 'Restaurante inactivado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar disponibilidad de un restaurante
exports.toggleDisponibilidad = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body;

    const restaurante = await Restaurante.findByPk(id);

    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    if (!restaurante.activo) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cambiar disponibilidad de un restaurante inactivo'
      });
    }

    await restaurante.update({
      disponible: disponible !== undefined ? disponible : !restaurante.disponible,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: `Restaurante ${restaurante.disponible ? 'disponible' : 'no disponible'}`,
      data: { disponible: restaurante.disponible }
    });
  } catch (error) {
    next(error);
  }
};