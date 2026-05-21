const { sequelize, CancelacionPedido, Pedido, EstadoPedido, HistorialEstadosPedido } = require('../../models');

const MULTA_RESTAURANTE = [2, 3, 4, 5];
const MULTA_CLIENTE     = [3, 4, 5];
const ESTADO_CANCELADO  = 7;

exports.getAll = async (req, res, next) => {
  try {
    const cancelaciones = await CancelacionPedido.findAll({
      include: [{ model: Pedido, as: 'pedido' }],
      order: [['fecha_cancelacion', 'DESC']]
    });
    res.json({ success: true, data: cancelaciones, count: cancelaciones.length });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const cancelacion = await CancelacionPedido.findByPk(req.params.id, {
      include: [{ model: Pedido, as: 'pedido' }]
    });
    if (!cancelacion)
      return res.status(404).json({ success: false, message: 'Cancelación no encontrada' });

    res.json({ success: true, data: cancelacion });
  } catch (error) {
    next(error);
  }
};

exports.getByPedido = async (req, res, next) => {
  try {
    const cancelacion = await CancelacionPedido.findOne({ where: { pedido_id: req.params.pedido_id } });
    if (!cancelacion)
      return res.status(404).json({ success: false, message: 'Este pedido no tiene cancelación registrada' });

    res.json({ success: true, data: cancelacion });
  } catch (error) {
    next(error);
  }
};

exports.cancelar = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { restaurante_id, pedido_id } = req.params;
    const { cancelado_por, motivo } = req.body;

    const validos = ['cliente', 'restaurante', 'repartidor', 'sistema'];
    if (!cancelado_por || !validos.includes(cancelado_por)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: `cancelado_por debe ser: ${validos.join(', ')}` });
    }
    if (!motivo) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'El motivo es requerido' });
    }

    const pedido = await Pedido.findOne({
      where: { id: pedido_id, restaurante_id },
      include: [{ model: EstadoPedido, as: 'estado' }],
      transaction: t
    });

    if (!pedido) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Pedido no encontrado en este restaurante' });
    }
    if (pedido.estado_id === ESTADO_CANCELADO) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'El pedido ya fue cancelado' });
    }
    if (pedido.estado_id === 6) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'No se puede cancelar un pedido entregado' });
    }

    const yaCancel = await CancelacionPedido.findOne({ where: { pedido_id }, transaction: t });
    if (yaCancel) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Este pedido ya tiene una cancelación registrada' });
    }

    let aplica_multa = false;
    let monto_multa  = 0;

    if (cancelado_por === 'restaurante' && MULTA_RESTAURANTE.includes(pedido.estado_id)) {
      aplica_multa = true;
      monto_multa  = parseFloat((parseFloat(pedido.total) * 0.10).toFixed(2));
    } else if (cancelado_por === 'cliente' && MULTA_CLIENTE.includes(pedido.estado_id)) {
      aplica_multa = true;
      monto_multa  = parseFloat((parseFloat(pedido.total) * 0.05).toFixed(2));
    }

    
    const cancelacion = await CancelacionPedido.create({
      pedido_id,
      cancelado_por,
      motivo,
      estado_al_cancelar: pedido.estado.nombre,
      aplica_multa,
      monto_multa,
      fecha_cancelacion: new Date()
    }, { transaction: t });

    await pedido.update({ estado_id: ESTADO_CANCELADO, fecha_actualizacion: new Date() }, { transaction: t });

    await HistorialEstadosPedido.create({
      pedido_id,
      estado_id:    ESTADO_CANCELADO,
      fecha_cambio: new Date(),
      motivo:       `Cancelado por ${cancelado_por}: ${motivo}`
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Pedido cancelado exitosamente',
      data: { cancelacion_id: cancelacion.id, pedido_id, cancelado_por, estado_al_cancelar: pedido.estado.nombre, aplica_multa, monto_multa }
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};