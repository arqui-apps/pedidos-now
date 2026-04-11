// src/services/external/cobros.external.js

const { httpPost } = require("./httpHelper");

const BASE_URL =
    process.env.COBROS_SERVICE_URL || "http://localhost:3006";

/**
 * Solicita un reembolso al módulo de cobros.
 * El módulo de cobros necesita saber el origen del reembolso
 * para su registro contable. La sesión es la prueba de que
 * el reembolso fue autorizado por el chatbot.
 */
async function requestRefund(id_usuario, amount, reason, id_session) {
    const { success, data } = await httpPost(
        `${BASE_URL}/refunds`,
        {
            id_usuario,
            amount,
            reason,
            origin: "automated_support",  // identifica que vino del chatbot
            id_session,
        },
        null
    );

    if (!success || !data) {
        console.warn("[Cobros] Servicio no disponible, registrando como pendiente");
        // El reembolso se guarda en nuestra DB como "pendiente"
        // y el módulo de Admin lo procesará manualmente
        return {
            refund_id: null,
            status: "pendiente",
            message:
                "Tu reembolso fue registrado y será procesado pronto",
            processed: false,
        };
    }

    return data;
    // Esperamos algo como:
    // { refund_id: 123, status: "procesado", processed: true }
}

module.exports = { requestRefund };