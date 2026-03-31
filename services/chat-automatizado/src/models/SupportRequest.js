// src/models/SupportRequest.js
module.exports = (sequelize, DataTypes) => {
    const SupportRequest = sequelize.define(
        "SupportRequest",
        {
            id_support_request: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_delivery: {
                type: DataTypes.INTEGER,
                // Por qué: ID del repartidor que solicita ayuda.
                // No es FK porque viene del microservicio de Auth.
            },
            id_pedido: {
                type: DataTypes.INTEGER,
                // Por qué: pedido involucrado en el problema.
                // Viene del microservicio de Pedidos.
            },
            id_session: { type: DataTypes.INTEGER },
            id_problem: {
                type: DataTypes.INTEGER,
                // Por qué: FK al catálogo de problemas.
                // Permite categorizar el tipo de soporte solicitado.
            },
            request_status: {
                type: DataTypes.ENUM(
                    "pendiente",
                    "en_proceso",
                    "resuelto",
                    "cancelado"
                ),
                defaultValue: "pendiente",
            },
            problem_details: {
                type: DataTypes.TEXT,
                // Por qué: texto libre donde el repartidor describe
                // su problema específico en carretera.
            },
            is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
        },
        { tableName: "support_request", timestamps: false }
    );

    return SupportRequest;
};