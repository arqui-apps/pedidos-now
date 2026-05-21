const { IncidenciaEntrega, Entrega } = require('../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

// Crear incidencia
exports.crearIncidencia = async (req, res) => {
    try {
        const {
            entrega_id,
            repartidor_id,
            tipo_incidencia,
            descripcion
        } = req.body;

        // Verificar que la entrega existe
        const entrega = await Entrega.findByPk(entrega_id);
        
        if (!entrega) {
            return res.status(404).json({
                success: false,
                message: 'Entrega no encontrada'
            });
        }

        const tiposValidos = [
            'direccion_incorrecta',
            'cliente_ausente',
            'paquete_danado',
            'rechazo_cliente',
            'accidente',
            'otro'
        ];

        if (!tiposValidos.includes(tipo_incidencia)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de incidencia no válido'
            });
        }

        const incidencia = await IncidenciaEntrega.create({
            entrega_id,
            repartidor_id,
            tipo_incidencia,
            descripcion,
            resuelta: false
        });

        res.status(201).json({
            success: true,
            message: 'Incidencia registrada exitosamente',
            data: incidencia
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear incidencia',
            error: error.message
        });
    }
};

// Obtener todas las incidencias con filtros
exports.obtenerIncidencias = async (req, res) => {
    try {
        const { 
            entrega_id,
            repartidor_id,
            tipo_incidencia,
            resuelta,
            page = 1,
            limit = 50
        } = req.query;

        const where = {};
        
        if (entrega_id) where.entrega_id = entrega_id;
        if (repartidor_id) where.repartidor_id = repartidor_id;
        if (tipo_incidencia) where.tipo_incidencia = tipo_incidencia;
        if (resuelta !== undefined) where.resuelta = resuelta === 'true';

        const offset = (page - 1) * limit;

        const { count, rows } = await IncidenciaEntrega.findAndCountAll({
            where,
            include: [{
                model: Entrega,
                as: 'entrega',
                attributes: ['id_entrega', 'tipo_origen', 'origen_id', 'estado_entrega', 'direccion_entrega']
            }],
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
            message: 'Error al obtener incidencias',
            error: error.message
        });
    }
};

// Obtener incidencia por ID
exports.obtenerIncidenciaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const incidencia = await IncidenciaEntrega.findByPk(id, {
            include: [{
                model: Entrega,
                as: 'entrega'
            }]
        });

        if (!incidencia) {
            return res.status(404).json({
                success: false,
                message: 'Incidencia no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: incidencia
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener incidencia',
            error: error.message
        });
    }
};

// Obtener incidencias de una entrega
exports.obtenerIncidenciasPorEntrega = async (req, res) => {
    try {
        const { id } = req.params; // ID de la entrega

        const incidencias = await IncidenciaEntrega.findAll({
            where: { entrega_id: id },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: incidencias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener incidencias',
            error: error.message
        });
    }
};

// Obtener incidencias de un repartidor
exports.obtenerIncidenciasPorRepartidor = async (req, res) => {
    try {
        const { repartidor_id } = req.params;
        const { resuelta } = req.query;

        const where = { repartidor_id };
        
        if (resuelta !== undefined) {
            where.resuelta = resuelta === 'true';
        }

        const incidencias = await IncidenciaEntrega.findAll({
            where,
            include: [{
                model: Entrega,
                as: 'entrega',
                attributes: ['id_entrega', 'tipo_origen', 'origen_id', 'estado_entrega']
            }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: incidencias
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener incidencias del repartidor',
            error: error.message
        });
    }
};

// Actualizar incidencia
exports.actualizarIncidencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, tipo_incidencia } = req.body;

        const incidencia = await IncidenciaEntrega.findByPk(id);

        if (!incidencia) {
            return res.status(404).json({
                success: false,
                message: 'Incidencia no encontrada'
            });
        }

        await incidencia.update({
            descripcion: descripcion || incidencia.descripcion,
            tipo_incidencia: tipo_incidencia || incidencia.tipo_incidencia
        });

        res.status(200).json({
            success: true,
            message: 'Incidencia actualizada exitosamente',
            data: incidencia
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar incidencia',
            error: error.message
        });
    }
};

// Marcar incidencia como resuelta
exports.resolverIncidencia = async (req, res) => {
    try {
        const { id } = req.params;

        const incidencia = await IncidenciaEntrega.findByPk(id);

        if (!incidencia) {
            return res.status(404).json({
                success: false,
                message: 'Incidencia no encontrada'
            });
        }

        await incidencia.update({ resuelta: true });

        res.status(200).json({
            success: true,
            message: 'Incidencia marcada como resuelta',
            data: incidencia
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al resolver incidencia',
            error: error.message
        });
    }
};

// Reabrir incidencia
exports.reabrirIncidencia = async (req, res) => {
    try {
        const { id } = req.params;

        const incidencia = await IncidenciaEntrega.findByPk(id);

        if (!incidencia) {
            return res.status(404).json({
                success: false,
                message: 'Incidencia no encontrada'
            });
        }

        await incidencia.update({ resuelta: false });

        res.status(200).json({
            success: true,
            message: 'Incidencia reabierta',
            data: incidencia
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al reabrir incidencia',
            error: error.message
        });
    }
};

// Obtener estadísticas de incidencias
exports.obtenerEstadisticasIncidencias = async (req, res) => {
    try {
        const { empresa_id, fecha_inicio, fecha_fin } = req.query;

        const whereIncidencia = {};
        const whereEntrega = {};

        if (empresa_id) whereEntrega.empresa_id = empresa_id;
        
        if (fecha_inicio && fecha_fin) {
            whereIncidencia.created_at = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        }

        // Total de incidencias
        const total = await IncidenciaEntrega.count({
            where: whereIncidencia,
            include: empresa_id ? [{
                model: Entrega,
                as: 'entrega',
                where: whereEntrega,
                attributes: []
            }] : []
        });

        // Incidencias por tipo
        const porTipo = await IncidenciaEntrega.findAll({
            where: whereIncidencia,
            attributes: [
                'tipo_incidencia',
                [sequelize.fn('COUNT', sequelize.col('id_incidencia')), 'cantidad']
            ],
            include: empresa_id ? [{
                model: Entrega,
                as: 'entrega',
                where: whereEntrega,
                attributes: []
            }] : [],
            group: ['tipo_incidencia']
        });

        // Incidencias resueltas vs no resueltas
        const resueltas = await IncidenciaEntrega.count({
            where: { ...whereIncidencia, resuelta: true },
            include: empresa_id ? [{
                model: Entrega,
                as: 'entrega',
                where: whereEntrega,
                attributes: []
            }] : []
        });

        const noResueltas = await IncidenciaEntrega.count({
            where: { ...whereIncidencia, resuelta: false },
            include: empresa_id ? [{
                model: Entrega,
                as: 'entrega',
                where: whereEntrega,
                attributes: []
            }] : []
        });

        res.status(200).json({
            success: true,
            data: {
                total,
                resueltas,
                noResueltas,
                porTipo
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};
