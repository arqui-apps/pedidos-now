const { sequelize, CategoriaOrden, Entrega, AsignacionEntrega, HistorialEstadoEntrega, Repartidor } = require('../../models');
const notificacionesService = require('../../services/notificaciones.service');
const administracionService = require('../../services/administracion.service');

exports.obtenerFeedDisponibles = async (req, res) => {
    try {
        const entregas = await Entrega.findAll({
            where: { estado_entrega: 'pendiente', activa: true },
            attributes: [
                'id_entrega', 'monto_cobrar', 'tarifa_ofrecida', 'metodo_pago',
                'distancia_estimada_km', 'negocio_nombre', 'created_at'
            ],
            include: [{ model: CategoriaOrden, as: 'categoria', attributes: ['id_categoria', 'codigo', 'nombre', 'icono', 'color_hex'] }],
            order: [['created_at', 'ASC']],
            limit: parseInt(req.query.limit || 50, 10)
        });

        return res.json({ success: true, total: entregas.length, data: entregas });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener feed', error: error.message });
    }
};

exports.obtenerPreviewPedido = async (req, res) => {
    try {
        const entrega = await Entrega.findByPk(req.params.id, {
            attributes: [
                'id_entrega', 'monto_cobrar', 'tarifa_ofrecida', 'metodo_pago', 'distancia_estimada_km',
                'negocio_nombre', 'negocio_direccion', 'origen_lat', 'origen_lng', 'cliente_nombre',
                'direccion_entrega', 'destino_lat', 'destino_lng', 'estado_entrega'
            ],
            include: [{ model: CategoriaOrden, as: 'categoria', attributes: ['id_categoria', 'codigo', 'nombre', 'icono', 'color_hex'] }]
        });

        if (!entrega) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
        return res.json({ success: true, data: entrega });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener preview', error: error.message });
    }
};

exports.aceptarPedido = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const repartidorId = req.body.repartidor_id || req.user?.id;
        if (!repartidorId) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'repartidor_id requerido' });
        }

        const entrega = await Entrega.findByPk(req.params.id, { transaction });
        if (!entrega) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
        }
        if (entrega.estado_entrega !== 'pendiente') {
            await transaction.rollback();
            return res.status(409).json({ success: false, message: 'La entrega ya no esta disponible' });
        }

        const repartidorAdministracion = await administracionService.obtenerPorId(repartidorId);
        if (!administracionService.estaDisponible(repartidorAdministracion)) {
            await transaction.rollback();
            return res.status(409).json({ success: false, message: 'Repartidor no disponible en Administracion' });
        }

        const [repartidor] = await Repartidor.findOrCreate({
            where: { id_repartidor: repartidorId },
            defaults: { estado: 'disponible', ws_estado: 'conectado' },
            transaction
        });

        await AsignacionEntrega.create({
            entrega_id: entrega.id_entrega,
            repartidor_id: repartidorId,
            asignado_por_usuario_id: req.user?.id || repartidorId,
            activa: true
        }, { transaction });
        await entrega.update({ estado_entrega: 'asignada', cancelacion_auto_at: null }, { transaction });
        await repartidor.update({ estado: 'ocupado' }, { transaction });
        await administracionService.marcarOcupado(repartidorId, entrega.id_entrega);
        await HistorialEstadoEntrega.create({
            entrega_id: entrega.id_entrega,
            estado_anterior: 'pendiente',
            estado_nuevo: 'asignada',
            cambiado_por_usuario_id: req.user?.id || repartidorId,
            repartidor_id: repartidorId,
            comentario: req.body.comentario || 'Pedido aceptado por repartidor',
            origen_cambio: 'repartidor'
        }, { transaction });

        await transaction.commit();

        await notificacionesService.notificarCambioEstado({
            entrega,
            estadoNuevo: 'asignada',
            repartidorId,
            comentario: req.body.comentario || 'Pedido aceptado por repartidor'
        });

        return res.json({ success: true, message: 'Pedido aceptado', data: entrega });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, message: 'Error al aceptar pedido', error: error.message });
    }
};
