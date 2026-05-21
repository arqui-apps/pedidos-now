const { NotificacionLogistica } = require('../../models');

exports.listarNotificaciones = async (req, res) => {
    try {
        const { entrega_id, exitosa, limit = 50, offset = 0 } = req.query;
        const where = {};
        if (entrega_id) where.entrega_id = entrega_id;
        if (exitosa !== undefined) where.exitosa = exitosa === 'true';
        
        const notificaciones = await NotificacionLogistica.findAndCountAll({ where, limit: parseInt(limit), offset: parseInt(offset), order: [['created_at', 'DESC']] });
        res.json({ total: notificaciones.count, notificaciones: notificaciones.rows, limit: parseInt(limit), offset: parseInt(offset) });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al listar notificaciones' });
    }
};

exports.obtenerNotificacion = async (req, res) => {
    try {
        const notificacion = await NotificacionLogistica.findByPk(req.params.id);
        if (!notificacion) return res.status(404).json({ error: 'Notificación no encontrada' });
        res.json(notificacion);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener notificación' });
    }
};

exports.reintentarNotificacion = async (req, res) => {
    try {
        const notificacion = await NotificacionLogistica.findByPk(req.params.id);
        if (!notificacion) return res.status(404).json({ error: 'Notificación no encontrada' });
        if (notificacion.exitosa) return res.status(400).json({ error: 'Notificación ya exitosa' });
        
        // TODO: Implementar lógica de reintento con axios
        res.json({ message: 'Reintento programado', notificacion_id: notificacion.id_notificacion });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al reintentar notificación' });
    }
};

module.exports = exports;
