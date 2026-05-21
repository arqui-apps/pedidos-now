const { Repartidor, HistorialUbicacionRepartidor } = require('../../models');

exports.obtenerPerfil = async (req, res) => {
    try {
        const repartidor = await Repartidor.findByPk(req.user.id, {
            attributes: ['id_repartidor', 'estado', 'ultima_lat', 'ultima_lng', 'ultima_ubicacion_at', 'ws_estado', 'total_entregas', 'total_cancelaciones', 'calificacion_promedio']
        });
        if (!repartidor) return res.status(404).json({ error: 'Repartidor no encontrado' });
        res.json(repartidor);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
};

exports.actualizarUbicacion = async (req, res) => {
    try {
        const { lat, lng, heading, entrega_id } = req.body;
        if (!lat || !lng) return res.status(400).json({ error: 'Coordenadas requeridas' });
        
        await Repartidor.update({ ultima_lat: lat, ultima_lng: lng, ultima_ubicacion_at: new Date(), ws_estado: 'conectado', ws_conectado_at: new Date() }, { where: { id_repartidor: req.user.id } });
        await HistorialUbicacionRepartidor.create({ repartidor_id: req.user.id, entrega_id: entrega_id || null, lat, lng, heading: heading || null });
        
        res.json({ message: 'Ubicación actualizada' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar ubicación' });
    }
};

exports.cambiarEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        if (!['disponible', 'inactivo'].includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
        
        await Repartidor.update({ estado, ws_estado: estado === 'inactivo' ? 'desconectado' : 'conectado', ws_desconectado_at: estado === 'inactivo' ? new Date() : null }, { where: { id_repartidor: req.user.id } });
        res.json({ message: `Estado cambiado a: ${estado}` });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al cambiar estado' });
    }
};

exports.obtenerMetricas = async (req, res) => {
    try {
        const repartidor = await Repartidor.findByPk(req.user.id, { attributes: ['total_entregas', 'total_cancelaciones', 'calificacion_promedio'] });
        if (!repartidor) return res.status(404).json({ error: 'Repartidor no encontrado' });
        
        const tasaExito = repartidor.total_entregas > 0 ? ((repartidor.total_entregas / (repartidor.total_entregas + repartidor.total_cancelaciones)) * 100).toFixed(2) : 100;
        res.json({ total_entregas: repartidor.total_entregas, total_cancelaciones: repartidor.total_cancelaciones, calificacion_promedio: parseFloat(repartidor.calificacion_promedio || 0), tasa_exito: parseFloat(tasaExito) });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener métricas' });
    }
};

exports.listarDisponibles = async (req, res) => {
    try {
        const repartidores = await Repartidor.findAll({
            where: { estado: 'disponible', ws_estado: 'conectado' },
            attributes: ['id_repartidor', 'estado', 'ultima_lat', 'ultima_lng', 'ultima_ubicacion_at', 'total_entregas', 'calificacion_promedio'],
            order: [['ultima_ubicacion_at', 'DESC']]
        });
        res.json({ total: repartidores.length, repartidores });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al listar repartidores' });
    }
};

module.exports = exports;
