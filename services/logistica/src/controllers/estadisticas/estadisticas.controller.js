const { Entrega, AsignacionEntrega, IncidenciaEntrega, HistorialEstadoEntrega } = require('../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

// Obtener estadísticas generales del dashboard
exports.obtenerEstadisticasGenerales = async (req, res) => {
    try {
        const { empresa_id, fecha_inicio, fecha_fin } = req.query;

        const whereEntrega = {};
        const whereHistorial = {};

        if (empresa_id) whereEntrega.empresa_id = empresa_id;
        
        if (fecha_inicio && fecha_fin) {
            whereEntrega.created_at = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        }

        // Total de entregas
        const totalEntregas = await Entrega.count({ where: whereEntrega });

        // Entregas por estado
        const entregasPorEstado = await Entrega.findAll({
            where: whereEntrega,
            attributes: [
                'estado_entrega',
                [sequelize.fn('COUNT', sequelize.col('id_entrega')), 'cantidad']
            ],
            group: ['estado_entrega']
        });

        // Entregas activas
        const entregasActivas = await Entrega.count({
            where: { ...whereEntrega, activa: true }
        });

        // Entregas entregadas hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const entregasHoy = await Entrega.count({
            where: {
                ...whereEntrega,
                fecha_entrega_real: {
                    [Op.between]: [hoy, manana]
                }
            }
        });

        // Total de incidencias
        const totalIncidencias = await IncidenciaEntrega.count({
            include: empresa_id ? [{
                model: Entrega,
                as: 'entrega',
                where: { empresa_id },
                attributes: []
            }] : []
        });

        // Incidencias no resueltas
        const incidenciasNoResueltas = await IncidenciaEntrega.count({
            where: { resuelta: false },
            include: empresa_id ? [{
                model: Entrega,
                as: 'entrega',
                where: { empresa_id },
                attributes: []
            }] : []
        });

        // Asignaciones activas
        const asignacionesActivas = await AsignacionEntrega.count({
            where: { activa: true },
            include: empresa_id ? [{
                model: Entrega,
                as: 'entrega',
                where: { empresa_id },
                attributes: []
            }] : []
        });

        res.status(200).json({
            success: true,
            data: {
                totalEntregas,
                entregasActivas,
                entregasHoy,
                entregasPorEstado,
                totalIncidencias,
                incidenciasNoResueltas,
                asignacionesActivas
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas generales',
            error: error.message
        });
    }
};

// Obtener resumen de entregas por periodo
exports.obtenerResumenPorPeriodo = async (req, res) => {
    try {
        const { empresa_id, fecha_inicio, fecha_fin } = req.query;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren fecha_inicio y fecha_fin'
            });
        }

        const whereEntrega = {
            created_at: {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            }
        };

        if (empresa_id) whereEntrega.empresa_id = empresa_id;

        // Entregas creadas por día
        const entregasPorDia = await Entrega.findAll({
            where: whereEntrega,
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'fecha'],
                [sequelize.fn('COUNT', sequelize.col('id_entrega')), 'cantidad']
            ],
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
        });

        // Entregas completadas por día
        const entregasCompletadasPorDia = await Entrega.findAll({
            where: {
                ...whereEntrega,
                estado_entrega: 'entregada'
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('fecha_entrega_real')), 'fecha'],
                [sequelize.fn('COUNT', sequelize.col('id_entrega')), 'cantidad']
            ],
            group: [sequelize.fn('DATE', sequelize.col('fecha_entrega_real'))],
            order: [[sequelize.fn('DATE', sequelize.col('fecha_entrega_real')), 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: {
                entregasPorDia,
                entregasCompletadasPorDia
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener resumen por periodo',
            error: error.message
        });
    }
};

// Obtener rendimiento de repartidores
exports.obtenerRendimientoRepartidores = async (req, res) => {
    try {
        const { empresa_id, fecha_inicio, fecha_fin } = req.query;

        const whereAsignacion = {};
        const whereEntrega = {};

        if (empresa_id) whereEntrega.empresa_id = empresa_id;
        
        if (fecha_inicio && fecha_fin) {
            whereAsignacion.created_at = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        }

        // Entregas por repartidor
        const entregasPorRepartidor = await AsignacionEntrega.findAll({
            where: whereAsignacion,
            attributes: [
                'repartidor_id',
                [sequelize.fn('COUNT', sequelize.col('id_asignacion')), 'total_asignaciones']
            ],
            include: empresa_id ? [{
                model: Entrega,
                as: 'entrega',
                where: whereEntrega,
                attributes: []
            }] : [],
            group: ['repartidor_id']
        });

        // Incidencias por repartidor
        const incidenciasPorRepartidor = await IncidenciaEntrega.findAll({
            attributes: [
                'repartidor_id',
                [sequelize.fn('COUNT', sequelize.col('id_incidencia')), 'total_incidencias']
            ],
            include: empresa_id ? [{
                model: Entrega,
                as: 'entrega',
                where: whereEntrega,
                attributes: []
            }] : [],
            group: ['repartidor_id']
        });

        res.status(200).json({
            success: true,
            data: {
                entregasPorRepartidor,
                incidenciasPorRepartidor
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener rendimiento de repartidores',
            error: error.message
        });
    }
};
