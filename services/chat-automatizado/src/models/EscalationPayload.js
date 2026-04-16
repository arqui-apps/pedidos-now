export default (sequelize, DataTypes) => {
    const EscalationPayload = sequelize.define(
        "EscalationPayload",
        {
            id_escalation: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_session: { type: DataTypes.INTEGER, allowNull: false },
            id_usuario: { type: DataTypes.INTEGER, allowNull: false },
            user_type: {
                type: DataTypes.ENUM("cliente", "repartidor", "negocio"),
                allowNull: false,
            },
            problem_category: {
                type: DataTypes.ENUM(
                    "problema_pedido_desconocido",
                    "cargo_no_reconocido",
                    "cliente_no_responde",
                    "direccion_incorrecta",
                    "problema_cobro_negocio",
                    "problema_pedido_negocio",
                    "pago_repartidor",
                    "compensacion_fallida",
                    "otro"
                ),
                allowNull: false,
            },
            escalation_state: { type: DataTypes.STRING(50), allowNull: false },
            previous_state: { type: DataTypes.STRING(50) },
            summary: { type: DataTypes.TEXT, allowNull: false },
            conversation_history: { type: DataTypes.JSON, allowNull: false },
            context_data: { type: DataTypes.JSON },
            handoff_status: {
                type: DataTypes.ENUM("pendiente", "recibido", "en_atencion", "cerrado"),
                defaultValue: "pendiente",
            },
            is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
        },
        { tableName: "escalation_payload", timestamps: false }
    );

    return EscalationPayload;
};