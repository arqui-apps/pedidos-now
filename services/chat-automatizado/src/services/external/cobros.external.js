import { httpGet, httpPost } from "./httpHelper.js";
import logger from "../../config/logger.js";

const BASE_URL =
    process.env.COBROS_SERVICE_URL || "https://cobros-api.fly.dev";

function extractOrderId(order_code) {
    if (!order_code) return null;
    const match = String(order_code).match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
}

async function findPaymentByOrder(order_code) {
    if (!order_code) return null;

    const order_id = extractOrderId(order_code);
    const orderId  = `ORD-${order_id}`;

    const { success, data } = await httpGet(
        `${BASE_URL}/api/payments?reservationId=${orderId}`,
        null
    );

    if (!success || !data) {
        logger.warn({ order_code }, "[Cobros] No se encontró pago para el pedido");
        return null;
    }

    const payments = data?.result || data?.data || data;
    if (Array.isArray(payments) && payments.length > 0) return payments[0];
    if (payments?.payment_id) return payments;
    return null;
}

async function requestRefund(id_usuario, amount, reason, id_session, order_code = null) {
    let payment_id = null;

    if (order_code) {
        const payment = await findPaymentByOrder(order_code);
        if (payment?.payment_id) {
            payment_id = payment.payment_id;
            logger.info({ payment_id, order_code }, "[Cobros] Pago encontrado");
        }
    }

    if (!payment_id) {
        logger.warn({ id_usuario, order_code }, "[Cobros] No se encontró payment_id, registrando como pendiente");
        return {
            refund_id:  null,
            status:     "pendiente",
            message:    "Tu reembolso fue registrado y será procesado pronto",
            processed:  false,
            order_code,
            id_usuario,
            amount,
            reason,
            id_session,
        };
    }

    const { success, data } = await httpPost(
        `${BASE_URL}/api/payments/${payment_id}/refund`,
        {
            amount,
            reason: reason || "Reembolso solicitado por el cliente a través del chat",
        },
        null
    );

    if (!success || !data) {
        logger.warn({ payment_id }, "[Cobros] Error al procesar reembolso, registrando como pendiente");
        return {
            refund_id:  null,
            status:     "pendiente",
            message:    "Tu reembolso fue registrado y será procesado pronto",
            processed:  false,
        };
    }

    const result = data?.result || data?.data || data;
    logger.info({ payment_id, amount }, "[Cobros] Reembolso procesado exitosamente");

    return {
        refund_id:  result?.refund_id || result?.id || payment_id,
        status:     result?.status || "procesado",
        message:    "Tu reembolso fue procesado exitosamente",
        processed:  true,
        amount,
        payment_id,
    };
}

async function getCourierWallet(courier_id) {
    const { success, data } = await httpGet(
        `${BASE_URL}/api/wallet/summary?courierId=${courier_id}`,
        null
    );

    if (!success || !data) {
        logger.warn({ courier_id }, "[Cobros] No se pudo obtener wallet del repartidor");
        return null;
    }

    return data?.result || data?.data || data;
}

async function cancelPayment(payment_id, reason) {
    const { success, data } = await httpPost(
        `${BASE_URL}/api/payments/${payment_id}/cancel`,
        { reason: reason || "Cancelado por el cliente" },
        null
    );

    if (!success || !data) {
        logger.warn({ payment_id }, "[Cobros] No se pudo cancelar el pago");
        return { cancelled: false, message: "No se pudo cancelar el pago" };
    }

    return { cancelled: true, message: "Pago cancelado exitosamente", data: data?.result || data };
}

export { requestRefund, findPaymentByOrder, getCourierWallet, cancelPayment };