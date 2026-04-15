// src/models/ChatSession.js
export default (sequelize, DataTypes) => {
    const ChatSession = sequelize.define(
        "ChatSession",  // nombre del modelo en JS
        {
            // ── IDENTIFICACIÓN ──────────────────────────────────
            id_session: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_usuario: {
                type: DataTypes.INTEGER,
                allowNull: false,

            },
            user_type: {
                type: DataTypes.ENUM("cliente", "repartidor", "negocio"),
                allowNull: false,
            },

            // ── ESTADO DE LA CONVERSACIÓN ────────────────────────
            current_state: {
                type: DataTypes.STRING(50),
            },
            previous_state: {
                type: DataTypes.STRING(50),
            },
            chat_context: {
                type: DataTypes.JSON,
            },

            // ── CONTROL DE SESIÓN ────────────────────────────────
            session_status: {
                type: DataTypes.ENUM("active", "inactive", "expired"),
                defaultValue: "active",
            },
            resolution: {
                type: DataTypes.ENUM(
                    "resuelto",
                    "resuelto_con_cupon",
                    "resuelto_con_reembolso",
                    "escalado_a_agente",
                    "cerrado_sin_resolver"
                ),
            },
            start_time: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            end_time: {
                type: DataTypes.DATE,
            
            },
            is_active: {
                type: DataTypes.TINYINT,
                defaultValue: 1,
            },
        },
        {
            tableName: "chat_session", 
            timestamps: false,
        }
    );

    return ChatSession;
};