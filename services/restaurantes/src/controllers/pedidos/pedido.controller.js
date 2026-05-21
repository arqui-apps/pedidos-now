//analisis
const { sequelize } = require('../../config/database');
const Pedido = require('../../models/pedidos/pedido.model');
const EstadoPedido = require('../../models/pedidos/estado-pedido.model');
const HistorialEstadosPedido = require('../../models/pedidos/historial-estados-pedido.model');
const DetallePedido = require('../../models/pedidos/detalle-pedido.model');

// 1=pendiente, 2=confirmado, 3=en_preparacion, 4=listo, 5=en_camino, 6=entregado, 7=cancelado
const ESTADO = {
  PENDIENTE:      1,
  CONFIRMADO:     2,
  EN_PREPARACION: 3,
  LISTO:          4,
  EN_CAMINO:      5,
  ENTREGADO:      6,
  CANCELADO:      7
};

// GET /api/pedidos
exports.getAll = async (req, res, next) => {
  try {
    const { restaurante_id } = req.params;
    const { cliente_id, estado_id } = req.query;
    
    const where = { restaurante_id };
    if (cliente_id) where.cliente_id = cliente_id;
    if (estado_id) where.estado_id = estado_id;

    const pedidos = await Pedido.findAll({
      where,
      include: [{ model: EstadoPedido, as: 'estado' }],
      order: [['fecha_pedido', 'DESC']]
    });

    res.json({ success: true, data: pedidos, count: pedidos.length });
  } catch (error) {
    next(error);
  }
};

// GET /api/pedidos/:id
exports.getById = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;

    const pedido = await Pedido.findOne({
      where: { id, restaurante_id },
      include: [
        { model: EstadoPedido, as: 'estado' },
        { model: DetallePedido, as: 'detalles' },
        {
          model: HistorialEstadosPedido,
          as: 'historial_estados',
          include: [{ model: EstadoPedido, as: 'estado' }]
        }
      ]
    });

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado en este restaurante' });
    }

    res.json({ success: true, data: pedido });
  } catch (error) {
    next(error);
  }
};

// POST /api/pedidos
exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { restaurante_id } = req.params;
    const { cliente_id, direccion_entrega, notas, descuento_aplicado, items } = req.body;

    if (!cliente_id || !direccion_entrega || !items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Faltan campos: cliente_id, direccion_entrega, items'
      });
    }

    // Verificar que el restaurante existe
    const [restauranteRows] = await sequelize.query(
      'SELECT id, nombre, activo, disponible FROM restaurantes WHERE id = :id',
      { replacements: { id: restaurante_id }, transaction: t }
    );

    if (restauranteRows.length === 0) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
    }

    if (!restauranteRows[0].activo) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'El restaurante está inactivo' });
    }

    if (!restauranteRows[0].disponible) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'El restaurante no está disponible en este momento' });
    }

    let subtotal = 0;
    const itemsValidados = [];

    for (const item of items) {
      if (!item.cantidad || item.cantidad <= 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'La cantidad debe ser mayor a 0 ' });
      }
      if (!item.producto_id && !item.combo_id) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Cada ítem necesita producto_id o combo_id ' });
      }

      let precio_unitario = 0;

      if (item.producto_id) {
        const [rows] = await sequelize.query(
          'SELECT precio, activo, nombre FROM productos WHERE id = :id AND restaurante_id = :rid',
          { replacements: { id: item.producto_id, rid: restaurante_id }, transaction: t }
        );
        if (rows.length === 0) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `Producto ID ${item.producto_id} no encontrado ` });
        }
        if (!rows[0].activo) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `El producto "${rows[0].nombre}" está inactivo` });
        }
        precio_unitario = parseFloat(rows[0].precio);
      } else {
        const [rows] = await sequelize.query(
          'SELECT precio, activo, nombre FROM combos WHERE id = :id AND restaurante_id = :rid',
          { replacements: { id: item.combo_id, rid: restaurante_id }, transaction: t }
        );
        if (rows.length === 0) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `Combo ID ${item.combo_id} no encontrado` });
        }
        if (!rows[0].activo) {
          await t.rollback();
          return res.status(400).json({ success: false, message: `El combo "${rows[0].nombre}" está inactivo` });
        }
        precio_unitario = parseFloat(rows[0].precio);
      }

      const desc = parseFloat(item.descuento || 0);
      const itemSubtotal = parseFloat(((precio_unitario - desc) * item.cantidad).toFixed(2));
      subtotal += itemSubtotal;

      itemsValidados.push({
        producto_id:    item.producto_id || null,
        combo_id:       item.combo_id    || null,
        cantidad:       item.cantidad,
        precio_unitario,
        descuento:      desc,
        subtotal:       itemSubtotal
      });
    }

    const desc_aplicado = parseFloat(descuento_aplicado || 0);
    const total = parseFloat((subtotal - desc_aplicado).toFixed(2));

    const pedido = await Pedido.create({
      restaurante_id,
      cliente_id,
      estado_id:          ESTADO.PENDIENTE,
      subtotal,
      descuento_aplicado: desc_aplicado,
      total,
      direccion_entrega,
      notas:              notas || null,
      fecha_pedido:       new Date()
    }, { transaction: t });

    for (const item of itemsValidados) {
      await DetallePedido.create({ pedido_id: pedido.id, ...item }, { transaction: t });
    }

    await HistorialEstadosPedido.create({
      pedido_id:    pedido.id,
      estado_id:    ESTADO.PENDIENTE,
      fecha_cambio: new Date(),
      motivo:       'Pedido creado'
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: { pedido_id: pedido.id, restaurante_id, subtotal, descuento_aplicado: desc_aplicado, total, cantidad_items: itemsValidados.length }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// PUT /api/pedidos/:id
exports.update = async (req, res, next) => {
  try {
    const { restaurante_id, id } = req.params;
    const { direccion_entrega, notas, repartidor_id, cobro_id } = req.body;

    const pedido = await Pedido.findOne({
      where: { id, restaurante_id }
    });

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado en este restaurante' });
    }

    await pedido.update({
      direccion_entrega:   direccion_entrega  !== undefined ? direccion_entrega  : pedido.direccion_entrega,
      notas:               notas              !== undefined ? notas              : pedido.notas,
      repartidor_id:       repartidor_id      !== undefined ? repartidor_id      : pedido.repartidor_id,
      cobro_id:            cobro_id           !== undefined ? cobro_id           : pedido.cobro_id,
      fecha_actualizacion: new Date()
    });

    res.json({ success: true, message: 'Pedido actualizado exitosamente', data: pedido });
  } catch (error) {
    next(error);
  }
};

// PUT /api/pedidos/:id/estado
exports.cambiarEstado = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { restaurante_id, id } = req.params;
    const { estado_id, motivo } = req.body;

    if (!estado_id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'estado_id es requerido' });
    }

    const pedido = await Pedido.findOne({
      where: { id, restaurante_id },
      transaction: t
    });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Pedido no encontrado en este restaurante' });
    }

    if (pedido.estado_id === ESTADO.CANCELADO) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'No se puede cambiar estado de un pedido cancelado' });
    }

    const estado = await EstadoPedido.findByPk(estado_id, { transaction: t });
    if (!estado) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'El estado no existe' });
    }

    await pedido.update({ estado_id, fecha_actualizacion: new Date() }, { transaction: t });

    await HistorialEstadosPedido.create({
      pedido_id:    pedido.id,
      estado_id,
      fecha_cambio: new Date(),
      motivo:       motivo || null
    }, { transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: `Estado actualizado a "${estado.nombre}"`,
      data: { pedido_id: pedido.id, estado_id, estado_nombre: estado.nombre }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
