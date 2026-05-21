const { Entrega, AsignacionEntrega, HistorialEstadoEntrega, IncidenciaEntrega } = require('../../models');

// Crear nueva entrega
exports.crearEntrega = async (req, res) => {
    try {
        const {
            tipo_origen,
            origen_id,
            empresa_id,
            sucursal_id,
            cliente_id,
            direccion_entrega,
            referencia_direccion,
            instrucciones_entrega,
            monto_cobrar,
            fecha_entrega_estimada
        } = req.body;

        const entrega = await Entrega.create({
            tipo_origen,
            origen_id,
            empresa_id,
            sucursal_id,
            cliente_id,
            direccion_entrega,
            referencia_direccion,
            instrucciones_entrega,
            monto_cobrar: monto_cobrar || 0.00,
            fecha_entrega_estimada,
            estado_entrega: 'pendiente',
            activa: true
        });

        // Registrar en historial el estado inicial
        await HistorialEstadoEntrega.create({
            entrega_id: entrega.id_entrega,
            estado_anterior: null,
            estado_nuevo: 'pendiente',
            cambiado_por_usuario_id: req.usuario?.id || 1,
            comentario: 'Entrega creada'
        });

        res.status(201).json({
            success: true,
            message: 'Entrega creada exitosamente',
            data: entrega
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear entrega',
            error: error.message
        });
    }
};

// Obtener todas las entregas con filtros
exports.obtenerEntregas = async (req, res) => {
    try {
        const { 
            estado_entrega, 
            empresa_id, 
            sucursal_id, 
            cliente_id,
            activa,
            page = 1, 
            limit = 50 
        } = req.query;

        const where = {};
        
        if (estado_entrega) where.estado_entrega = estado_entrega;
        if (empresa_id) where.empresa_id = empresa_id;
        if (sucursal_id) where.sucursal_id = sucursal_id;
        if (cliente_id) where.cliente_id = cliente_id;
        if (activa !== undefined) where.activa = activa === 'true';

        const offset = (page - 1) * limit;

        const { count, rows } = await Entrega.findAndCountAll({
            where,
            include: [
                {
                    model: AsignacionEntrega,
                    as: 'asignaciones',
                    where: { activa: true },
                    required: false
                },
                {
                    model: IncidenciaEntrega,
                    as: 'incidencias',
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener entregas',
            error: error.message
        });
    }
};

// Obtener entrega por ID
exports.obtenerEntregaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const entrega = await Entrega.findByPk(id, {
            include: [
                {
                    model: AsignacionEntrega,
                    as: 'asignaciones'
                },
                {
                    model: HistorialEstadoEntrega,
                    as: 'historial',
                    order: [['created_at', 'DESC']]
                },
                {
                    model: IncidenciaEntrega,
                    as: 'incidencias'
                }
            ]
        });

        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: entrega
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener entrega',
            error: error.message
        });
    }
};

// Actualizar entrega
exports.actualizarEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            direccion_entrega,
            referencia_direccion,
            instrucciones_entrega,
            monto_cobrar,
            fecha_entrega_estimada
        } = req.body;

        const entrega = await Entrega.findByPk(id);

        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }

        await entrega.update({
            direccion_entrega,
            referencia_direccion,
            instrucciones_entrega,
            monto_cobrar,
            fecha_entrega_estimada
        });

        res.status(200).json({
            success: true,
            message: 'Entrega actualizada exitosamente',
            data: entrega
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar entrega',
            error: error.message
        });
    }
};

// Cambiar estado de entrega
exports.cambiarEstadoEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_nuevo, comentario } = req.body;

        const estadosValidos = ['pendiente', 'asignada', 'en_ruta', 'entregada', 'fallida', 'cancelada'];
        
        if (!estadosValidos.includes(estado_nuevo)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        const entrega = await Entrega.findByPk(id);

        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }

        const estado_anterior = entrega.estado_entrega;

        // Actualizar estado
        await entrega.update({ 
            estado_entrega: estado_nuevo,
            ...(estado_nuevo === 'entregada' && { fecha_entrega_real: new Date() })
        });

        // Registrar en historial
        await HistorialEstadoEntrega.create({
            entrega_id: entrega.id_entrega,
            estado_anterior,
            estado_nuevo,
            cambiado_por_usuario_id: req.usuario?.id || 1,
            comentario
        });

        res.status(200).json({
            success: true,
            message: 'Estado actualizado exitosamente',
            data: entrega
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado',
            error: error.message
        });
    }
};

// Cancelar entrega
exports.cancelarEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const { comentario } = req.body;

        const entrega = await Entrega.findByPk(id);

        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }

        if (entrega.estado_entrega === 'entregada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar una entrega ya entregada'
            });
        }

        const estado_anterior = entrega.estado_entrega;

        await entrega.update({ 
            estado_entrega: 'cancelada',
            activa: false
        });

        // Registrar en historial
        await HistorialEstadoEntrega.create({
            entrega_id: entrega.id_entrega,
            estado_anterior,
            estado_nuevo: 'cancelada',
            cambiado_por_usuario_id: req.usuario?.id || 1,
            comentario: comentario || 'Entrega cancelada'
        });

        res.status(200).json({
            success: true,
            message: 'Entrega cancelada exitosamente',
            data: entrega
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cancelar entrega',
            error: error.message
        });
    }
};

// Obtener historial de una entrega
exports.obtenerHistorialEntrega = async (req, res) => {
    try {
        const { id } = req.params;

        const historial = await HistorialEstadoEntrega.findAll({
            where: { entrega_id: id },
            order: [['created_at', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: historial
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial',
            error: error.message
        });
    }
};
