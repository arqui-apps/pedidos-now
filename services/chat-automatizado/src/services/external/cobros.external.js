import { httpPost } from "./httpHelper.js";

const BASE_URL = process.env.COBROS_SERVICE_URL || "http://localhost:3006";

async function requestRefund(id_usuario, amount, reason, id_session) {
    const { success, data } = await httpPost(
        `${BASE_URL}/refunds`,
        {
            id_usuario,
            amount,
            reason,
            origin: "automated_support",
            id_session,
        },
        null
    );

    if (!success || !data) {
        console.warn(
            "[Cobros] Servicio no disponible, registrando como pendiente"
        );
        return {
            refund_id: null,
            status: "pendiente",
            message: "Tu reembolso fue registrado y será procesado pronto",
            processed: false,
        };
    }
    return data;
}

export { requestRefund };