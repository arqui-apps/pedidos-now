// src/models/ChatSession.js
module.exports = (sequelize, DataTypes) => {
    const ChatSession = sequelize.define(
        "ChatSession",  // nombre del modelo en JS
        {
            // ── IDENTIFICACIÓN ──────────────────────────────────
            id_session: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                // Por qué: clave primaria auto-incremental,
                // es el ID que el frontend usará en cada petición
            },
            id_usuario: {
                type: DataTypes.INTEGER,
                allowNull: false,
                // Por qué: viene del microservicio de Auth.
                // No es FK porque está en otra base de datos.
                // Solo guardamos el número para saber de quién es la sesión.
            },
            user_type: {
                type: DataTypes.ENUM("cliente", "repartidor", "negocio"),
                allowNull: false,
                // Por qué: determina qué menú principal mostrar
                // y qué opciones tendrá disponibles el usuario
            },

            // ── ESTADO DE LA CONVERSACIÓN ────────────────────────
            current_state: {
                type: DataTypes.STRING(50),
                // Por qué: guarda el estado actual de XState como string.
                // Ejemplo: "PROBLEMA_PEDIDO", "FAQ_CLIENTE".
                // Con esto sabemos en qué punto del flujo está el usuario
                // SIN necesitar levantar la máquina completa.
            },
            previous_state: {
                type: DataTypes.STRING(50),
                // Por qué: útil para debugging y para implementar
                // un botón de "volver" si fuera necesario.
            },
            chat_context: {
                type: DataTypes.JSON,
                // Por qué: ESTE ES EL MÁS IMPORTANTE.
                // Guarda el snapshot completo de XState (toda la memoria
                // de la máquina: context, estado, historial).
                // Con esto podemos RESTAURAR exactamente donde estaba
                // el usuario, incluso si el servidor se reinicia.
                //
                // Ejemplo de lo que guarda:
                // {
                //   "value": "PROBLEMA_PEDIDO",
                //   "context": {
                //     "id_usuario": 5,
                //     "user_type": "cliente",
                //     "order_code": null
                //   }
                // }
            },

            // ── CONTROL DE SESIÓN ────────────────────────────────
            session_status: {
                type: DataTypes.ENUM("active", "inactive", "expired"),
                defaultValue: "active",
                // Por qué: evita que el usuario envíe mensajes a una
                // sesión ya cerrada o resuelta.
            },
            resolution: {
                type: DataTypes.ENUM(
                    "resuelto",
                    "resuelto_con_cupon",
                    "resuelto_con_reembolso",
                    "escalado_a_agente",
                    "cerrado_sin_resolver"
                ),
                // Por qué: dato valioso para el módulo de Administración.
                // Pueden ver qué porcentaje de casos se resuelven
                // automáticamente vs. cuántos necesitan agente humano.
            },
            start_time: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            end_time: {
                type: DataTypes.DATE,
                // Por qué: para calcular tiempo promedio de resolución.
            },
            is_active: {
                type: DataTypes.TINYINT,
                defaultValue: 1,
                // Por qué: soft delete. En lugar de borrar el registro
                // (y perder el historial), lo marcamos como inactivo.
            },
        },
        {
            tableName: "chat_session", // nombre EXACTO de la tabla en MySQL
            timestamps: false, // usamos nuestras propias columnas de fecha
        }
    );

    return ChatSession;
};