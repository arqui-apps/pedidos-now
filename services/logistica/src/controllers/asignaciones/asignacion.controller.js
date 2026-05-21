const { AsignacionEntrega, Entrega, HistorialEstadoEntrega } = require('../../models');

// Asignar repartidor a entrega
exports.asignarRepartidor = async (req, res) => {
    try {
        const { entrega_id, repartidor_id } = req.body;

        // Verificar que la entrega existe
        const entrega = await Entrega.findByPk(entrega_id);
        
        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }

        // Desactivar asignación anterior si existe
        await AsignacionEntrega.update(
            { activa: false },
            { where: { entrega_id, activa: true } }
        );

        // Crear nueva asignación
        const asignacion = await AsignacionEntrega.create({
            entrega_id,
            repartidor_id,
            asignado_por_usuario_id: req.usuario?.id || 1,
            activa: true
        });

        // Actualizar estado de entrega a 'asignada' si está en 'pendiente'
        if (entrega.estado_entrega === 'pendiente') {
            const estado_anterior = entrega.estado_entrega;
            
            await entrega.update({ estado_entrega: 'asignada' });

            await HistorialEstadoEntrega.create({
                entrega_id,
                estado_anterior,
                estado_nuevo: 'asignada',
                cambiado_por_usuario_id: req.usuario?.id || 1,
                origen_cambio: 'manual'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Repartidor asignado exitosamente',
            data: asignacion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al asignar repartidor',
            error: error.message
        });
    }
};

// Reasignar repartidor a entrega
exports.reasignarRepartidor = async (req, res) => {
    try {
        const { id } = req.params; // ID de la entrega
        const { repartidor_id, comentario } = req.body;

        const entrega = await Entrega.findByPk(id);
        
        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }

        if (['entregada', 'cancelada'].includes(entrega.estado_entrega)) {
            return res.status(400).json({
                success: false,
                message: 'No se puede reasignar una entrega finalizada'
            });
        }

        // Desactivar asignación actual
        await AsignacionEntrega.update(
            { activa: false },
            { where: { entrega_id: id, activa: true } }
        );

        // Crear nueva asignación
        const asignacion = await AsignacionEntrega.create({
            entrega_id: id,
            repartidor_id,
            asignado_por_usuario_id: req.usuario?.id || 1,
            activa: true
        });

        // Registrar en historial
        await HistorialEstadoEntrega.create({
            entrega_id: id,
            estado_anterior: entrega.estado_entrega,
            estado_nuevo: entrega.estado_entrega,
            repartidor_id,
            cambiado_por_usuario_id: req.usuario?.id || 1,
            origen_cambio: 'manual'
        });

        res.status(200).json({
            success: true,
            message: 'Repartidor reasignado exitosamente',
            data: asignacion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al reasignar repartidor',
            error: error.message
        });
    }
};

// Obtener asignación activa de una entrega
exports.obtenerAsignacionActiva = async (req, res) => {
    try {
        const { id } = req.params; // ID de la entrega

        const asignacion = await AsignacionEntrega.findOne({
            where: { 
                entrega_id: id,
                activa: true 
            }
        });

        if (!asignacion) {
            return res.status(404).json({
                success: false,
                message: 'No hay asignación activa para esta entrega'
            });
        }

        res.status(200).json({
            success: true,
            data: asignacion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener asignación',
            error: error.message
        });
    }
};

// Obtener historial de asignaciones de una entrega
exports.obtenerHistorialAsignaciones = async (req, res) => {
    try {
        const { id } = req.params; // ID de la entrega

        const asignaciones = await AsignacionEntrega.findAll({
            where: { entrega_id: id },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: asignaciones
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial de asignaciones',
            error: error.message
        });
    }
};

// Obtener entregas asignadas a un repartidor
exports.obtenerEntregasPorRepartidor = async (req, res) => {
    try {
        const { repartidor_id } = req.params;
        const { activa = true } = req.query;

        const asignaciones = await AsignacionEntrega.findAll({
            where: { 
                repartidor_id,
                activa: activa === 'true'
            },
            include: [{
                model: Entrega,
                as: 'entrega'
            }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: asignaciones
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener entregas del repartidor',
            error: error.message
        });
    }
};

// Desasignar repartidor de entrega
exports.desasignarRepartidor = async (req, res) => {
    try {
        const { id } = req.params; // ID de la entrega
        const { comentario } = req.body;

        const asignacion = await AsignacionEntrega.findOne({
            where: { entrega_id: id, activa: true }
        });

        if (!asignacion) {
            return res.status(404).json({
                success: false,
                message: 'No hay asignación activa para esta entrega'
            });
        }

        await asignacion.update({ activa: false });

        // Actualizar estado de entrega a 'pendiente'
        const entrega = await Entrega.findByPk(id);
        const estado_anterior = entrega.estado_entrega;

        await entrega.update({ estado_entrega: 'pendiente' });

        await HistorialEstadoEntrega.create({
            entrega_id: id,
            estado_anterior,
            estado_nuevo: 'pendiente',
            cambiado_por_usuario_id: req.usuario?.id || 1,
            origen_cambio: 'manual'
        });

        res.status(200).json({
            success: true,
            message: 'Repartidor desasignado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al desasignar repartidor',
            error: error.message
        });
    }
};
