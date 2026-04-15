// src/models/SupportRequest.js
export default (sequelize, DataTypes) => {
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
            },
            id_pedido: {
                type: DataTypes.INTEGER,
            },
            id_session: { type: DataTypes.INTEGER },
            id_problem: {
                type: DataTypes.INTEGER,
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
            },
            is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
        },
        { tableName: "support_request", timestamps: false }
    );

    return SupportRequest;
};