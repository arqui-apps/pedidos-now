const { HistorialPreciosProducto, Producto } = require('../../models');
const { Op } = require('sequelize');

// Obtener historial de precios de un producto
exports.getHistorialByProducto = async (req, res, next) => {
  try {
    const { restaurante_id, producto_id } = req.params;

    // Verificar que el producto pertenece al restaurante
    const producto = await Producto.findOne({
      where: { id: producto_id, restaurante_id }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en este restaurante'
      });
    }

    const historial = await HistorialPreciosProducto.findAll({
      where: { producto_id },
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha_cambio', 'DESC']]
    });

    res.json({
      success: true,
      data: historial,
      count: historial.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener precio actual de un producto
exports.getPrecioActual = async (req, res, next) => {
  try {
    const { restaurante_id, producto_id } = req.params;

    const producto = await Producto.findOne({
      where: { id: producto_id, restaurante_id },
      attributes: ['id', 'nombre', 'precio']
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en este restaurante'
      });
    }

    res.json({
      success: true,
      data: {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_actual: producto.precio
      }
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar precio de un producto y registrar en historial
exports.actualizarPrecio = async (req, res, next) => {
  try {
    const { restaurante_id, producto_id } = req.params;
    const { precio_nuevo, motivo } = req.body;

    if (!precio_nuevo || precio_nuevo <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser mayor a 0'
      });
    }

    const producto = await Producto.findOne({
      where: { id: producto_id, restaurante_id }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en este restaurante'
      });
    }

    const precio_anterior = producto.precio;

    // Registrar en historial
    await HistorialPreciosProducto.create({
      producto_id,
      precio_anterior,
      precio_nuevo,
      motivo: motivo || 'Actualización de precio',
      fecha_cambio: new Date()
    });

    // Actualizar precio del producto
    await producto.update({
      precio: precio_nuevo,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: 'Precio actualizado exitosamente',
      data: {
        producto_id,
        precio_anterior,
        precio_nuevo,
        fecha_cambio: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los cambios de precio en un rango de fechas
exports.getHistorialByFecha = async (req, res, next) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    const where = {};
    
    if (fecha_inicio || fecha_fin) {
      where.fecha_cambio = {};
      if (fecha_inicio) where.fecha_cambio[Op.gte] = new Date(fecha_inicio);
      if (fecha_fin) where.fecha_cambio[Op.lte] = new Date(fecha_fin);
    }

    const historial = await HistorialPreciosProducto.findAll({
      where,
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha_cambio', 'DESC']]
    });

    res.json({
      success: true,
      data: historial,
      count: historial.length
    });
  } catch (error) {
    next(error);
  }
};

// Comparar precios entre dos fechas
exports.compararPrecios = async (req, res, next) => {
  try {
    const { restaurante_id, producto_id } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fecha_inicio y fecha_fin'
      });
    }

    // Verificar que el producto pertenece al restaurante
    const producto = await Producto.findOne({
      where: { id: producto_id, restaurante_id }
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en este restaurante'
      });
    }

    const cambios = await HistorialPreciosProducto.findAll({
      where: {
        producto_id,
        fecha_cambio: {
          [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
        }
      },
      order: [['fecha_cambio', 'ASC']]
    });

    if (cambios.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron cambios de precio en el rango especificado'
      });
    }

    const precio_inicial = cambios[0].precio_anterior;
    const precio_final = cambios[cambios.length - 1].precio_nuevo;
    const diferencia = precio_final - precio_inicial;
    const porcentaje_cambio = ((diferencia / precio_inicial) * 100).toFixed(2);

    res.json({
      success: true,
      data: {
        producto_id,
        fecha_inicio,
        fecha_fin,
        precio_inicial,
        precio_final,
        diferencia,
        porcentaje_cambio: `${porcentaje_cambio}%`,
        total_cambios: cambios.length,
        historial: cambios
      }
    });
  } catch (error) {
    next(error);
  }
};
