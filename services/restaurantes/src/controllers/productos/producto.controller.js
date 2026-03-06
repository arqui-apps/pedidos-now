const { Producto, TipoProducto, Restaurante } = require('../../models');

// Obtener todos los productos con filtros opcionales
exports.getAll = async (req, res, next) => {
  try {
    const { activo, restaurante_id, tipo_producto_id } = req.query;
    
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (restaurante_id) where.restaurante_id = restaurante_id;
    if (tipo_producto_id) where.tipo_producto_id = tipo_producto_id;

    const productos = await Producto.findAll({
      where,
      include: [
        {
          model: Restaurante,
          as: 'restaurante',
          attributes: ['id', 'nombre']
        },
        {
          model: TipoProducto,
          as: 'tipo',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: productos,
      count: productos.length
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un producto por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id, {
      include: [
        {
          model: Restaurante,
          as: 'restaurante',
          attributes: ['id', 'nombre', 'disponible', 'activo']
        },
        {
          model: TipoProducto,
          as: 'tipo',
          attributes: ['id', 'nombre', 'descripcion']
        }
      ]
    });

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo producto
exports.create = async (req, res, next) => {
  try {
    const {
      restaurante_id,
      tipo_producto_id,
      nombre,
      descripcion,
      imagen_url,
      precio
    } = req.body;

    const producto = await Producto.create({
      restaurante_id,
      tipo_producto_id,
      nombre,
      descripcion,
      imagen_url,
      precio,
      activo: true,
      fecha_creacion: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un producto existente
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      tipo_producto_id,
      nombre,
      descripcion,
      imagen_url,
      precio
    } = req.body;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await producto.update({
      tipo_producto_id: tipo_producto_id || producto.tipo_producto_id,
      nombre: nombre || producto.nombre,
      descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
      imagen_url: imagen_url !== undefined ? imagen_url : producto.imagen_url,
      precio: precio !== undefined ? precio : producto.precio,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar (inactivar) un producto
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await producto.update({
      activo: false,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: 'Producto inactivado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Activar/desactivar un producto
exports.toggleActivo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await producto.update({
      activo: activo !== undefined ? activo : !producto.activo,
      fecha_actualizacion: new Date()
    });

    res.json({
      success: true,
      message: `Producto ${producto.activo ? 'activado' : 'desactivado'}`,
      data: { activo: producto.activo }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos por restaurante
exports.getByRestaurante = async (req, res, next) => {
  try {
    const { restaurante_id } = req.params;
    const { activo } = req.query;

    const where = { restaurante_id };
    if (activo !== undefined) where.activo = activo === 'true';

    const productos = await Producto.findAll({
      where,
      include: [
        {
          model: TipoProducto,
          as: 'tipo',
          attributes: ['id', 'nombre']
        }
      ],
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: productos,
      count: productos.length
    });
  } catch (error) {
    next(error);
  }
};
