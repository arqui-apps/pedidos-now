const { HorarioRestaurante, Restaurante } = require('../../models');

// Obtener todos los horarios con filtros opcionales
exports.getAll = async (req, res, next) => {
  try {
    const { restaurante_id, dia_semana, activo } = req.query;
    
    const where = {};
    if (restaurante_id) where.restaurante_id = restaurante_id;
    if (dia_semana !== undefined) where.dia_semana = dia_semana;
    if (activo !== undefined) where.activo = activo === 'true';

    const horarios = await HorarioRestaurante.findAll({
      where,
      include: [
        {
          model: Restaurante,
          as: 'restaurante',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['restaurante_id', 'ASC'], ['dia_semana', 'ASC']]
    });

    res.json({
      success: true,
      data: horarios,
      count: horarios.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un horario por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const horario = await HorarioRestaurante.findByPk(id, {
      include: [
        {
          model: Restaurante,
          as: 'restaurante',
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (!horario) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado'
      });
    }

    res.json({
      success: true,
      data: horario
    });
  } catch (error) {
    next(error);
  }
};

// Obtener horarios por restaurante
exports.getByRestaurante = async (req, res, next) => {
  try {
    const { restaurante_id } = req.params;
    const { activo } = req.query;

    // Verificar que el restaurante existe
    const restaurante = await Restaurante.findByPk(restaurante_id);
    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    const where = { restaurante_id };
    if (activo !== undefined) where.activo = activo === 'true';

    const horarios = await HorarioRestaurante.findAll({
      where,
      order: [['dia_semana', 'ASC']]
    });

    res.json({
      success: true,
      data: horarios,
      count: horarios.length
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo horario
exports.create = async (req, res, next) => {
  try {
    const { restaurante_id } = req.params;
    const {
      dia_semana,
      hora_apertura,
      hora_cierre
    } = req.body;

    // Validar que el restaurante existe
    const restaurante = await Restaurante.findByPk(restaurante_id);
    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    // Validar día de la semana (0-6)
    if (dia_semana < 0 || dia_semana > 6) {
      return res.status(400).json({
        success: false,
        message: 'Día de semana inválido. Debe estar entre 0 (Lunes) y 6 (Domingo)'
      });
    }

    // Validar formato de hora (HH:MM:SS o HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
    if (!timeRegex.test(hora_apertura) || !timeRegex.test(hora_cierre)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora inválido. Use HH:MM:SS o HH:MM'
      });
    }

    const horario = await HorarioRestaurante.create({
      restaurante_id,
      dia_semana,
      hora_apertura,
      hora_cierre,
      activo: true
    });

    res.status(201).json({
      success: true,
      message: 'Horario creado exitosamente',
      data: horario
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un horario existente
exports.update = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;
    const {
      dia_semana,
      hora_apertura,
      hora_cierre,
      activo
    } = req.body;

    const horario = await HorarioRestaurante.findOne({
      where: { id, restaurante_id }
    });

    if (!horario) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado en este restaurante'
      });
    }

    // Validar día de la semana si se proporciona
    if (dia_semana !== undefined && (dia_semana < 0 || dia_semana > 6)) {
      return res.status(400).json({
        success: false,
        message: 'Día de semana inválido. Debe estar entre 0 (Lunes) y 6 (Domingo)'
      });
    }

    // Validar formato de hora si se proporciona
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
    if (hora_apertura && !timeRegex.test(hora_apertura)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora de apertura inválido. Use HH:MM:SS o HH:MM'
      });
    }
    if (hora_cierre && !timeRegex.test(hora_cierre)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora de cierre inválido. Use HH:MM:SS o HH:MM'
      });
    }

    await horario.update({
      dia_semana: dia_semana !== undefined ? dia_semana : horario.dia_semana,
      hora_apertura: hora_apertura || horario.hora_apertura,
      hora_cierre: hora_cierre || horario.hora_cierre,
      activo: activo !== undefined ? activo : horario.activo
    });

    res.json({
      success: true,
      message: 'Horario actualizado exitosamente',
      data: horario
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar (inactivar) un horario
exports.delete = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;

    const horario = await HorarioRestaurante.findOne({
      where: { id, restaurante_id }
    });

    if (!horario) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado en este restaurante'
      });
    }

    await horario.update({
      activo: false
    });

    res.json({
      success: true,
      message: 'Horario inactivado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Activar/Desactivar un horario
exports.toggleActivo = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;
    const { activo } = req.body;

    const horario = await HorarioRestaurante.findOne({
      where: { id, restaurante_id }
    });

    if (!horario) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado en este restaurante'
      });
    }

    await horario.update({
      activo: activo !== undefined ? activo : !horario.activo
    });

    res.json({
      success: true,
      message: `Horario ${horario.activo ? 'activado' : 'desactivado'}`,
      data: { activo: horario.activo }
    });
  } catch (error) {
    next(error);
  }
};
