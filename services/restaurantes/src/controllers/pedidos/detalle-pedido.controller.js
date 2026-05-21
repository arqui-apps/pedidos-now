const { sequelize, DetallePedido, Pedido } = require('../../models');

exports.getByPedido = async (req, res, next) => {
  try {
    const { restaurante_id, pedido_id } = req.params;

    const pedido = await Pedido.findOne({
      where: { id: pedido_id, restaurante_id }
    });

    if (!pedido)
      return res.status(404).json({ success: false, message: 'Pedido no encontrado en este restaurante' });

    const detalles = await DetallePedido.findAll({
      where: { pedido_id },
      order: [['id', 'ASC']]
    });

    res.json({ success: true, data: detalles, count: detalles.length });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { restaurante_id, pedido_id, id } = req.params;

    const pedido = await Pedido.findOne({
      where: { id: pedido_id, restaurante_id }
    });

    if (!pedido)
      return res.status(404).json({ success: false, message: 'Pedido no encontrado en este restaurante' });

    const detalle = await DetallePedido.findOne({ where: { id, pedido_id } });
    if (!detalle)
      return res.status(404).json({ success: false, message: 'Detalle no encontrado' });

    res.json({ success: true, data: detalle });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { restaurante_id, pedido_id } = req.params;
    const { producto_id, combo_id, cantidad, descuento } = req.body;

    if (!cantidad || cantidad <= 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'La cantidad debe ser mayor a 0' });
    }
    if (!producto_id && !combo_id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Debe indicar producto_id o combo_id' });
    }

    const pedido = await Pedido.findOne({
      where: { id: pedido_id, restaurante_id },
      transaction: t
    });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Pedido no encontrado en este restaurante' });
    }

    if ([6, 7].includes(pedido.estado_id)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'No se pueden agregar ítems a un pedido entregado o cancelado' });
    }

    let precio_unitario = 0;

    if (producto_id) {
      const [rows] = await sequelize.query(
        'SELECT precio, activo, nombre FROM productos WHERE id = :id AND restaurante_id = :rid',
        { replacements: { id: producto_id, rid: restaurante_id }, transaction: t }
      );
      if (rows.length === 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Producto no encontrado en este restaurante' });
      }
      if (!rows[0].activo) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `El producto "${rows[0].nombre}" está inactivo` });
      }
      precio_unitario = parseFloat(rows[0].precio);
    } else {
      const [rows] = await sequelize.query(
        'SELECT precio, activo, nombre FROM combos WHERE id = :id AND restaurante_id = :rid',
        { replacements: { id: combo_id, rid: restaurante_id }, transaction: t }
      );
      if (rows.length === 0) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Combo no encontrado en este restaurante' });
      }
      if (!rows[0].activo) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `El combo "${rows[0].nombre}" está inactivo` });
      }
      precio_unitario = parseFloat(rows[0].precio);
    }

    const desc = parseFloat(descuento || 0);
    const subtotal = parseFloat(((precio_unitario - desc) * cantidad).toFixed(2));

    const detalle = await DetallePedido.create({
      pedido_id, producto_id: producto_id || null, combo_id: combo_id || null,
      cantidad, precio_unitario, descuento: desc, subtotal
    }, { transaction: t });

    await sequelize.query(`
      UPDATE pedidos
      SET subtotal = (SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id = :pid),
          total = (SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id = :pid) - descuento_aplicado,
          fecha_actualizacion = NOW()
      WHERE id = :pid
    `, { replacements: { pid: pedido_id }, transaction: t });

    await t.commit();
    res.status(201).json({ success: true, message: 'Ítem agregado al pedido', data: detalle });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.update = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { restaurante_id, pedido_id, id } = req.params;
    const { cantidad, descuento } = req.body;

    if (!cantidad || cantidad <= 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'La cantidad debe ser mayor a 0' });
    }

    const pedido = await Pedido.findOne({
      where: { id: pedido_id, restaurante_id },
      transaction: t
    });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Pedido no encontrado en este restaurante' });
    }

    const detalle = await DetallePedido.findOne({ where: { id, pedido_id }, transaction: t });
    if (!detalle) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Detalle no encontrado' });
    }

    const desc = parseFloat(descuento !== undefined ? descuento : detalle.descuento);
    const subtotal = parseFloat(((parseFloat(detalle.precio_unitario) - desc) * cantidad).toFixed(2));

    await detalle.update({ cantidad, descuento: desc, subtotal }, { transaction: t });

    await sequelize.query(`
      UPDATE pedidos
      SET subtotal = (SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id = :pid),
          total = (SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id = :pid) - descuento_aplicado,
          fecha_actualizacion = NOW()
      WHERE id = :pid
    `, { replacements: { pid: pedido_id }, transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Detalle actualizado exitosamente', data: detalle });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { restaurante_id, pedido_id, id } = req.params;

    const pedido = await Pedido.findOne({
      where: { id: pedido_id, restaurante_id },
      transaction: t
    });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Pedido no encontrado en este restaurante' });
    }

    const detalle = await DetallePedido.findOne({ where: { id, pedido_id }, transaction: t });
    if (!detalle) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Detalle no encontrado' });
    }

    await detalle.destroy({ transaction: t });

    await sequelize.query(`
      UPDATE pedidos
      SET subtotal = COALESCE((SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id = :pid), 0),
          total = COALESCE((SELECT SUM(subtotal) FROM detalle_pedido WHERE pedido_id = :pid), 0) - descuento_aplicado,
          fecha_actualizacion = NOW()
      WHERE id = :pid
    `, { replacements: { pid: pedido_id }, transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Ítem eliminado del pedido' });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
