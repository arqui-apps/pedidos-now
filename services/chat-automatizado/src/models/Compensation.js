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
                // Por qué: guardamos el ID del usuario que recibió
                // la compensación. Lo necesita el módulo bancario
                // para saber a quién acreditar el reembolso.
            },
            id_session: {
                type: DataTypes.INTEGER,
                // Por qué: rastreabilidad. Puedes saber exactamente
                // en qué conversación se generó esta compensación.
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                // Por qué: DECIMAL para dinero, nunca FLOAT.
                // FLOAT tiene errores de precisión (ej: 10.1 + 0.2 = 10.299999...)
            },
            cupon_code: {
                type: DataTypes.STRING(100),
                defaultValue: null,
                // Por qué: solo se llena si compensation_type = 'cupon'.
                // El código lo genera el microservicio de Descuentos,
                // nosotros solo lo almacenamos para referencia.
            },
            expiration_date: {
                type: DataTypes.DATE,
                defaultValue: null,
                // Por qué: para validar vigencia de cupones sin
                // tener que consultar al microservicio de Descuentos.
            },
            reason: {
                type: DataTypes.TEXT,
                // Por qué: descripción legible de por qué se generó.
                // Útil para el módulo de Administración y contabilidad.
            },
            compensation_type: {
                type: DataTypes.ENUM("cupon", "reembolso"),
                // Por qué: determina el flujo de procesamiento.
                // cupon   → va al microservicio de Descuentos
                // reembolso → va al microservicio de Cobros/Bancario
            },
            compensation_status: {
                type: DataTypes.ENUM(
                    "pendiente",
                    "procesado",
                    "usado",
                    "expirado",
                    "rechazado"
                ),
                // Por qué: lifecycle del cupón/reembolso.
                // pendiente → aún no procesado por el banco
                // procesado → banco lo acreditó
                // usado     → el cliente ya lo usó (cupón)
                // expirado  → ya venció
                // rechazado → el banco lo rechazó
            },
            is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
        },
        { tableName: "compensation", timestamps: false }
    );

    return Compensation;
};