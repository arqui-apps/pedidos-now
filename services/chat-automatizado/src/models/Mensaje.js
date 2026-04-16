// src/models/Mensaje.js
export default (sequelize, DataTypes) => {
    const Mensaje = sequelize.define(
        "Mensaje",  // nombre del modelo en JS
        {
            id_mensaje: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_session: {
                type: DataTypes.INTEGER,
                allowNull: false,
                // Foreign key reference to ChatSession
            },
            message_sender: {
                type: DataTypes.ENUM("bot", "cliente", "repartidor", "negocio"),
                allowNull: false,
            },
            message_content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            is_active: {
                type: DataTypes.TINYINT,
                defaultValue: 1,
            },
        },
        {
            tableName: "mensaje",  // ← Different table name
            timestamps: false,
        }
    );

    return Mensaje;
};