// src/models/Compensation.js
module.exports = (sequelize, DataTypes) => {
    const Compensation = sequelize.define(
        "Compensation",
        {
            id_compensacion: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_usuario: {
                type: DataTypes.INTEGER,
            },
            id_session: {
                type: DataTypes.INTEGER,
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
            },
            cupon_code: {
                type: DataTypes.STRING(100),
                defaultValue: null,
            },
            expiration_date: {
                type: DataTypes.DATE,
                defaultValue: null,
            },
            reason: {
                type: DataTypes.TEXT,
            },
            compensation_type: {
                type: DataTypes.ENUM("cupon", "reembolso"),
            },
            compensation_status: {
                type: DataTypes.ENUM(
                    "pendiente",
                    "procesado",
                    "usado",
                    "expirado",
                    "rechazado"
                ),
            },
            is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
        },
        { tableName: "compensation", timestamps: false }
    );

    return Compensation;
};