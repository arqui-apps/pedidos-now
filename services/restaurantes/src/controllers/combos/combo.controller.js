const { Combo, TipoCombo, Restaurante, ComboProducto, Producto } = require('../../models');

// Obtener todos los combos con filtros opcionales
exports.getAll = async (req, res, next) => {
  try {
    const { activo, restaurante_id, tipo_combo_id } = req.query;
    
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (restaurante_id) where.restaurante_id = restaurante_id;
    if (tipo_combo_id) where.tipo_combo_id = tipo_combo_id;

    const combos = await Combo.findAll({
      where,
      include: [
        {
          model: Restaurante,
          as: 'restaurante',
          attributes: ['id', 'nombre']
        },
        {
          model: TipoCombo,
          as: 'tipo',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: combos,
      count: combos.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un combo por ID
exports.getById = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;

    const combo = await Combo.findOne({
      where: { id, restaurante_id },
      include: [
        {
          model: Restaurante,
          as: 'restaurante',
          attributes: ['id', 'nombre', 'activo']
        },
        {
          model: TipoCombo,
          as: 'tipo',
          attributes: ['id', 'nombre', 'descripcion']
        },
        {
          model: Producto,
          as: 'productos',
          through: {
            attributes: ['cantidad']
          },
          attributes: ['id', 'nombre', 'descripcion', 'precio']
        }
      ]
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo no encontrado en este restaurante'
      });
    }

    res.json({
      success: true,
      data: combo
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo combo
exports.create = async (req, res, next) => {
  try {
    const { restaurante_id } = req.params;
    const {
      tipo_combo_id,
      nombre,
      descripcion,
      precio,
      productos
    } = req.body;

    // Verificar que el restaurante existe
    const restaurante = await Restaurante.findByPk(restaurante_id);
    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    const combo = await Combo.create({
      restaurante_id,
      tipo_combo_id,
      nombre,
      descripcion,
      precio,
      activo: true,
      fecha_creacion: new Date()
    });

    // Si se especifican productos, agregarlos al combo
    if (productos && Array.isArray(productos)) {
      const comboProductos = productos.map(p => ({
        combo_id: combo.id,
        producto_id: p.producto_id,
        cantidad: p.cantidad || 1
      }));
      await ComboProducto.bulkCreate(comboProductos);
    }

    res.status(201).json({
      success: true,
      message: 'Combo creado exitosamente',
      data: combo
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un combo existente
exports.update = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;
    const {
      tipo_combo_id,
      nombre,
      descripcion,
      precio
    } = req.body;

    const combo = await Combo.findOne({
      where: { id, restaurante_id }
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo no encontrado en este restaurante'
      });
    }

    await combo.update({
      tipo_combo_id: tipo_combo_id || combo.tipo_combo_id,
      nombre: nombre || combo.nombre,
      descripcion: descripcion !== undefined ? descripcion : combo.descripcion,
      precio: precio !== undefined ? precio : combo.precio,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: 'Combo actualizado exitosamente',
      data: combo
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar (inactivar) un combo
exports.delete = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;

    const combo = await Combo.findOne({
      where: { id, restaurante_id }
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo no encontrado en este restaurante'
      });
    }

    await combo.update({
      activo: false,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: 'Combo inactivado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Activar/desactivar un combo
exports.toggleActivo = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;
    const { activo } = req.body;

    const combo = await Combo.findOne({
      where: { id, restaurante_id }
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo no encontrado en este restaurante'
      });
    }

    await combo.update({
      activo: activo !== undefined ? activo : !combo.activo,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: `Combo ${combo.activo ? 'activado' : 'desactivado'}`,
      data: { activo: combo.activo }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener combos por restaurante
exports.getByRestaurante = async (req, res, next) => {
  try {
    const { restaurante_id } = req.params;
    const { activo } = req.query;

    const where = { restaurante_id };
    if (activo !== undefined) where.activo = activo === 'true';

    const combos = await Combo.findAll({
      where,
      include: [
        {
          model: TipoCombo,
          as: 'tipo',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: combos,
      count: combos.length
    });
  } catch (error) {
    next(error);
  }
};

// Agregar productos a un combo
exports.addProductos = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;
    const { productos } = req.body;

    const combo = await Combo.findOne({
      where: { id, restaurante_id }
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo no encontrado en este restaurante'
      });
    }

    if (!productos || !Array.isArray(productos)) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un array de productos'
      });
    }

    const comboProductos = productos.map(p => ({
      combo_id: combo.id,
      producto_id: p.producto_id,
      cantidad: p.cantidad || 1
    }));

    await ComboProducto.bulkCreate(comboProductos);

    res.json({
      success: true,
      message: 'Productos agregados al combo exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Remover productos de un combo
exports.removeProducto = async (req, res, next) => {
  try {
    const { restaurante_id, id, producto_id } = req.params;

    // Verificar que el combo pertenece al restaurante
    const combo = await Combo.findOne({
      where: { id, restaurante_id }
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Combo no encontrado en este restaurante'
      });
    }

    const comboProducto = await ComboProducto.findOne({
      where: {
        combo_id: id,
        producto_id: producto_id
      }
    });

    if (!comboProducto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el combo'
      });
    }

    await comboProducto.destroy();

    res.json({
      success: true,
      message: 'Producto removido del combo exitosamente'
    });
  } catch (error) {
    next(error);
  }
};
