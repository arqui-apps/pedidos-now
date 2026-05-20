const { sequelize } = require('../config/db');

const getPagosPorFecha = async (inicio, fin) => {
    const pagos = await sequelize.query(
        `SELECT 
            DATE(fecha_pago) as fecha,
            SUM(salario) as total
        FROM pagos_agentes
        WHERE fecha_pago BETWEEN :inicio AND :fin
        GROUP BY DATE(fecha_pago)`,
        {
            replacements: { inicio, fin },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return pagos;
};

const getVentas = async (inicio, fin) => {
    let query = `
        SELECT COALESCE(SUM(total), 0) AS total_ventas
        FROM pedido_contabilidad
        WHERE estado = 'completado'
    `;

    const replacements = {};

    if (inicio && fin) {
        query += " AND DATE(fecha) BETWEEN :inicio AND :fin";
        replacements.inicio = inicio;
        replacements.fin = fin;
    }

    const ventas = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    return ventas[0];
};

const getPedidos = async (inicio, fin) => {
    let query = `
        SELECT COUNT(*) AS total_pedidos
        FROM pedido_contabilidad
        WHERE 1=1
    `;

    const replacements = {};

    if (inicio && fin) {
        query += " AND DATE(fecha) BETWEEN :inicio AND :fin";
        replacements.inicio = inicio;
        replacements.fin = fin;
    }

    const pedidos = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    return pedidos[0];
};

const getPropinas = async (inicio, fin) => {
    let query = `
        SELECT COALESCE(SUM(propina), 0) AS total_propinas
        FROM cobro
        WHERE estado = 'completado'
    `;

    const replacements = {};

    if (inicio && fin) {
        query += " AND DATE(fecha_cobro) BETWEEN :inicio AND :fin";
        replacements.inicio = inicio;
        replacements.fin = fin;
    }

    const propinas = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    return propinas[0];
};

const getCostos = async (inicio, fin) => {
    let query = `
        SELECT COALESCE(SUM(monto), 0) AS total_costos
        FROM movimiento_financiero
        WHERE tipo = 'egreso'
    `;

    const replacements = {};

    if (inicio && fin) {
        query += " AND DATE(fecha) BETWEEN :inicio AND :fin";
        replacements.inicio = inicio;
        replacements.fin = fin;
    }

    const costos = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    return costos[0];
};

const getVentasPorDia = async (inicio, fin) => {
    const ventasPorDia = await sequelize.query(
        `SELECT DATE(fecha) as fecha, SUM(total) as total
        FROM pedido_contabilidad
        WHERE estado = 'completado'
        AND DATE(fecha) BETWEEN :inicio AND :fin
        GROUP BY DATE(fecha)`,
        {
            replacements: { inicio, fin },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return ventasPorDia;
};

const getCrecimientoVentas = async () => {
    const crecimiento = await sequelize.query(
        `SELECT
            (SELECT COALESCE(SUM(total), 0) 
            FROM pedido_contabilidad 
            WHERE DATE(fecha) = CURRENT_DATE) as hoy,
            (SELECT COALESCE(SUM(total), 0) 
            FROM pedido_contabilidad 
            WHERE DATE(fecha) = CURRENT_DATE - INTERVAL '1 day') as ayer`,
        {
            type: sequelize.QueryTypes.SELECT
        }
    );
    return crecimiento[0];
};

const getEstadisticasPorEntidad = async (inicio, fin) => {
    const estadisticas = await sequelize.query(
        `SELECT ec.id, ec.nombre_comercial,
        COUNT(DISTINCT pc.id) AS total_pedidos,
        COALESCE(SUM(pc.descuento), 0) AS total_descuentos
        FROM entidad_comercial ec
        LEFT JOIN pedido_contabilidad pc
        ON ec.id = pc.entidad_comercial_id
        WHERE (:inicio IS NULL OR DATE(pc.fecha) BETWEEN :inicio AND :fin)
        GROUP BY ec.id, ec.nombre_comercial`,
        {
            replacements: { inicio: inicio || null, fin },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return estadisticas;
};

const getReembolsosYCompensaciones = async (inicio, fin) => {
    const reembolsos = await sequelize.query(
        `SELECT 'reembolso' as tipo,
        COUNT(*) as total,
        COALESCE(SUM(monto), 0) as monto_total
        FROM reembolso_cliente
        WHERE (:inicio IS NULL OR DATE(fecha_solicitud) BETWEEN :inicio AND :fin)
        UNION ALL
        SELECT 'compensacion' as tipo,
        COUNT(*) as total,
        COALESCE(SUM(monto), 0) as monto_total
        FROM compensacion_entidad
        WHERE (:inicio IS NULL OR DATE(fecha_generacion) BETWEEN :inicio AND :fin)`,
        {
            replacements: { inicio: inicio || null, fin },
            type: sequelize.QueryTypes.SELECT
        }
    );
    return reembolsos;
};

module.exports = {
    getPagosPorFecha,
    getVentas,
    getPedidos,
    getPropinas,
    getCostos,
    getVentasPorDia,
    getCrecimientoVentas,
    getEstadisticasPorEntidad,
    getReembolsosYCompensaciones
};