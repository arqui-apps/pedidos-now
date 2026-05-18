const { sequelize, CategoriaOrden, Entrega, AsignacionEntrega, HistorialEstadoEntrega, IncidenciaEntrega, Repartidor } = require('../../models');
const restaurantesService = require('../../services/restaurantes.service');
const notificacionesService = require('../../services/notificaciones.service');
const administracionService = require('../../services/administracion.service');

const ESTADOS_VALIDOS = ['pendiente', 'asignada', 'en_ruta', 'entregada', 'fallida', 'cancelada'];

const TRANSICIONES_VALIDAS = {
    pendiente: ['asignada', 'cancelada', 'fallida'],
    asignada: ['en_ruta', 'cancelada', 'fallida'],
    en_ruta: ['entregada', 'fallida', 'cancelada'],
    entregada: [],
    fallida: [],
    cancelada: []
};

const getUserId = (req) => req.user?.id || req.usuario?.id || 1;

const registrarHistorial = (entrega, estadoAnterior, estadoNuevo, req, comentario, transaction) => {
    return HistorialEstadoEntrega.create({
        entrega_id: entrega.id_entrega,
        estado_anterior: estadoAnterior,
        estado_nuevo: estadoNuevo,
        cambiado_por_usuario_id: getUserId(req),
        comentario,
        origen_cambio: req.user?.source || 'manual'
    }, { transaction });
};

exports.crearEntrega = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const categoria = await CategoriaOrden.findOne({
            where: req.body.categoria_id
                ? { id_categoria: req.body.categoria_id, activa: true }
                : { codigo: req.body.categoria_codigo || 'PACKAGE', activa: true },
            transaction
        });

        if (!categoria) {
            await transaction.rollback();
            return res.status(422).json({ success: false, message: 'Categoria no encontrada o inactiva' });
        }

        const entrega = await Entrega.create({
            tipo_origen: req.body.tipo_origen || 'manual',
            origen_id: req.body.origen_id || req.body.orden_id || Date.now(),
            empresa_id: req.body.empresa_id,
            sucursal_id: req.body.sucursal_id || null,
            cliente_id: req.body.cliente_id,
            categoria_id: categoria.id_categoria,
            metodo_pago: req.body.metodo_pago || 'CASH',
            tarifa_ofrecida: req.body.tarifa_ofrecida || 0,
            monto_cobrar: req.body.monto_cobrar || 0,
            distancia_estimada_km: req.body.distancia_estimada_km || null,
            negocio_nombre: req.body.negocio_nombre,
            negocio_telefono: req.body.negocio_telefono || null,
            negocio_direccion: req.body.negocio_direccion,
            origen_lat: req.body.origen_lat || req.body.origen_coordenadas?.lat,
            origen_lng: req.body.origen_lng || req.body.origen_coordenadas?.lng,
            cliente_nombre: req.body.cliente_nombre,
            cliente_telefono: req.body.cliente_telefono || null,
            direccion_entrega: req.body.direccion_entrega,
            referencia_direccion: req.body.referencia_direccion || null,
            instrucciones_entrega: req.body.instrucciones_entrega || null,
            destino_lat: req.body.destino_lat || req.body.destino_coordenadas?.lat,
            destino_lng: req.body.destino_lng || req.body.destino_coordenadas?.lng,
            detalles_orden: req.body.detalles_orden || null,
            cancelacion_auto_at: req.body.cancelacion_auto_at || new Date(Date.now() + 5 * 60 * 1000),
            fecha_entrega_estimada: req.body.fecha_entrega_estimada || null,
            estado_entrega: 'pendiente',
            activa: true
        }, { transaction });

        await registrarHistorial(entrega, null, 'pendiente', req, 'Entrega creada', transaction);
        await transaction.commit();

        return res.status(201).json({ success: true, message: 'Entrega creada exitosamente', data: entrega });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, message: 'Error al crear entrega', error: error.message });
    }
};

exports.crearEntregaDesdeRestaurante = async (req, res) => {
    try {
        const { restaurante_id, pedido_id } = req.params;
        const payload = await restaurantesService.obtenerPayloadLogistico(restaurante_id, pedido_id, req.body || {});

        req.body = payload;
        return exports.crearEntrega(req, res);
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: 'Error al preparar entrega desde restaurante',
            error: error.message,
            detalle: error.data || null
        });
    }
};

exports.obtenerEntregas = async (req, res) => {
    try {
        const { estado_entrega, empresa_id, sucursal_id, cliente_id, origen_id, tipo_origen, activa, page = 1, limit = 50 } = req.query;
        const where = {};

        if (estado_entrega) where.estado_entrega = estado_entrega;
        if (empresa_id) where.empresa_id = empresa_id;
        if (sucursal_id) where.sucursal_id = sucursal_id;
        if (cliente_id) where.cliente_id = cliente_id;
        if (origen_id) where.origen_id = origen_id;
        if (tipo_origen) where.tipo_origen = tipo_origen;
        if (activa !== undefined) where.activa = activa === 'true';

        const parsedLimit = parseInt(limit, 10);
        const parsedPage = parseInt(page, 10);
        const { count, rows } = await Entrega.findAndCountAll({
            where,
            include: [
                { model: CategoriaOrden, as: 'categoria' },
                { model: AsignacionEntrega, as: 'asignaciones', where: { activa: true }, required: false }
            ],
            limit: parsedLimit,
            offset: (parsedPage - 1) * parsedLimit,
            order: [['created_at', 'DESC']]
        });

        return res.json({
            success: true,
            data: rows,
            pagination: { total: count, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(count / parsedLimit) }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener entregas', error: error.message });
    }
};

exports.obtenerEntregaPorId = async (req, res) => {
    try {
        const entrega = await Entrega.findByPk(req.params.id, {
            include: [
                { model: CategoriaOrden, as: 'categoria' },
                { model: AsignacionEntrega, as: 'asignaciones', include: [{ model: Repartidor, as: 'repartidor' }] },
                { model: HistorialEstadoEntrega, as: 'historial' },
                { model: IncidenciaEntrega, as: 'incidencias' }
            ],
            order: [[{ model: HistorialEstadoEntrega, as: 'historial' }, 'created_at', 'ASC']]
        });

        if (!entrega) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
        return res.json({ success: true, data: entrega });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener entrega', error: error.message });
    }
};

exports.actualizarEntrega = async (req, res) => {
    try {
        const entrega = await Entrega.findByPk(req.params.id);
        if (!entrega) return res.status(404).json({ success: false, message: 'Entrega no encontrada' });

        const camposPermitidos = [
            'tarifa_ofrecida', 'monto_cobrar', 'distancia_estimada_km', 'negocio_telefono',
            'negocio_direccion', 'origen_lat', 'origen_lng', 'cliente_telefono', 'direccion_entrega',
            'referencia_direccion', 'instrucciones_entrega', 'destino_lat', 'destino_lng',
            'detalles_orden', 'fecha_entrega_estimada'
        ];
        const cambios = {};

        camposPermitidos.forEach((campo) => {
            if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
        });

        await entrega.update(cambios);
        return res.json({ success: true, message: 'Entrega actualizada exitosamente', data: entrega });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al actualizar entrega', error: error.message });
    }
};

exports.cambiarEstadoEntrega = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const estadoNuevo = req.body.estado_nuevo || req.body.estado;
        if (!ESTADOS_VALIDOS.includes(estadoNuevo)) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Estado no valido' });
        }

        const entrega = await Entrega.findByPk(req.params.id, { transaction });
        if (!entrega) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Entrega no encontrada' });
        }

        const estadoAnterior = entrega.estado_entrega;
        if (!TRANSICIONES_VALIDAS[estadoAnterior].includes(estadoNuevo) && estadoAnterior !== estadoNuevo) {
            await transaction.rollback();
            return res.status(409).json({ success: false, message: `Transicion invalida: ${estadoAnterior} -> ${estadoNuevo}` });
        }

        const asignacionActiva = await AsignacionEntrega.findOne({
            where: { entrega_id: entrega.id_entrega, activa: true },
            transaction
        });

        await entrega.update({
            estado_entrega: estadoNuevo,
            activa: !['entregada', 'fallida', 'cancelada'].includes(estadoNuevo),
            cancelacion_auto_at: estadoNuevo === 'asignada' ? null : entrega.cancelacion_auto_at,
            fecha_entrega_real: estadoNuevo === 'entregada' ? new Date() : entrega.fecha_entrega_real
        }, { transaction });

        await registrarHistorial(entrega, estadoAnterior, estadoNuevo, req, req.body.comentario || null, transaction);

        if (['entregada', 'fallida', 'cancelada'].includes(estadoNuevo) && asignacionActiva) {
            await asignacionActiva.update({ activa: false, fecha_liberacion: new Date() }, { transaction });
            await Repartidor.update({ estado: 'disponible' }, { where: { id_repartidor: asignacionActiva.repartidor_id }, transaction });
            await administracionService.liberar(asignacionActiva.repartidor_id);
        }

        await transaction.commit();

        await notificacionesService.notificarCambioEstado({
            entrega,
            estadoNuevo,
            repartidorId: asignacionActiva?.repartidor_id || req.body.repartidor_id || null,
            comentario: req.body.comentario || null
        });

        return res.json({ success: true, message: 'Estado actualizado exitosamente', data: entrega });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ success: false, message: 'Error al cambiar estado', error: error.message });
    }
};

exports.cancelarEntrega = async (req, res) => {
    req.body.estado_nuevo = 'cancelada';
    return exports.cambiarEstadoEntrega(req, res);
};

exports.obtenerHistorialEntrega = async (req, res) => {
    try {
        const historial = await HistorialEstadoEntrega.findAll({
            where: { entrega_id: req.params.id },
            order: [['created_at', 'ASC']]
        });
        return res.json({ success: true, data: historial });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener historial', error: error.message });
    }
};

exports.aceptarEntrega = async (req, res) => {
    req.body.estado_nuevo = 'asignada';
    return exports.cambiarEstadoEntrega(req, res);
};

exports.marcarRecogida = async (req, res) => {
    req.body.estado_nuevo = 'en_ruta';
    return exports.cambiarEstadoEntrega(req, res);
};

exports.marcarEntregada = async (req, res) => {
    req.body.estado_nuevo = 'entregada';
    return exports.cambiarEstadoEntrega(req, res);
};

exports.obtenerEntregasPorOrigen = async (req, res) => {
    try {
        const { origen_id } = req.params;
        const { tipo_origen } = req.query;

        const where = { origen_id };
        if (tipo_origen) where.tipo_origen = tipo_origen;

        const entregas = await Entrega.findAll({
            where,
            include: [
                { model: CategoriaOrden, as: 'categoria' },
                { model: AsignacionEntrega, as: 'asignaciones', where: { activa: true }, required: false }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.json({ success: true, data: entregas });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener entregas por origen', error: error.message });
    }
};

exports.obtenerDetallesCompletos = exports.obtenerEntregaPorId;
