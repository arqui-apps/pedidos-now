import { httpGet, httpPost } from "./httpHelper.js";

const BASE_URL =
    process.env.COBROS_SERVICE_URL || "https://cobros-api.fly.dev";

// ─── Helper ───────────────────────────────────────────────────────────────────

function extractOrderId(order_code) {
    if (!order_code) return null;
    const match = String(order_code).match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
}

// ─── Buscar pago por order_id ─────────────────────────────────────────────────

/**
 * Busca el pago asociado a un pedido.
 * GET /api/payments?reservationId=ORD-XXX
 * Necesitamos el payment_id para poder hacer el reembolso.
 */
async function findPaymentByOrder(order_code) {
    if (!order_code) return null;

    const order_id = extractOrderId(order_code);
    const orderId  = `ORD-${order_id}`;

    const { success, data } = await httpGet(
        `${BASE_URL}/api/payments?reservationId=${orderId}`,
        null
    );

    if (!success || !data) {
        console.warn(`[Cobros] No se encontró pago para el pedido ${order_code}`);
        return null;
    }

    // La API devuelve { result: [...] } o { result: { ... } }
    const payments = data?.result || data?.data || data;
    if (Array.isArray(payments) && payments.length > 0) {
        return payments[0]; // Retorna el pago más reciente
    }
    if (payments?.payment_id) {
        return payments;
    }
    return null;
}

// ─── Procesar reembolso ───────────────────────────────────────────────────────

/**
 * Procesa un reembolso para un usuario.
 * Flujo:
 *   1. Buscar el pago por order_code → obtener payment_id
 *   2. POST /api/payments/:payment_id/refund
 * Si no encuentra el pago, registra como pendiente (mock).
 */
async function requestRefund(id_usuario, amount, reason, id_session, order_code = null) {
    // 1. Buscar el payment_id si tenemos order_code
    let payment_id = null;

    if (order_code) {
        const payment = await findPaymentByOrder(order_code);
        if (payment?.payment_id) {
            payment_id = payment.payment_id;
            console.log(`[Cobros] Pago encontrado: ${payment_id} para ${order_code}`);
        }
    }

    // 2. Si no encontramos el pago, registrar como pendiente
    if (!payment_id) {
        console.warn("[Cobros] No se encontró payment_id, registrando reembolso como pendiente");
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

    // 3. Procesar el reembolso real
    const { success, data } = await httpPost(
        `${BASE_URL}/api/payments/${payment_id}/refund`,
        {
            amount: amount,
            reason: reason || "Reembolso solicitado por el cliente a través del chat",
        },
        null
    );

    if (!success || !data) {
        console.warn("[Cobros] Error al procesar reembolso, registrando como pendiente");
        return {
            refund_id:  null,
            status:     "pendiente",
            message:    "Tu reembolso fue registrado y será procesado pronto",
            processed:  false,
        };
    }

    const result = data?.result || data?.data || data;
    console.log(`[Cobros] Reembolso procesado exitosamente para payment ${payment_id}`);

    return {
        refund_id:  result?.refund_id || result?.id || payment_id,
        status:     result?.status || "procesado",
        message:    "Tu reembolso fue procesado exitosamente",
        processed:  true,
        amount,
        payment_id,
    };
}

// ─── Consultar wallet de repartidor ──────────────────────────────────────────

/**
 * Obtiene el resumen del wallet de un repartidor.
 * GET /api/wallet/summary?courierId=XXX
 * Útil para el flujo de repartidor con problema de pago.
 */
async function getCourierWallet(courier_id) {
    const { success, data } = await httpGet(
        `${BASE_URL}/api/wallet/summary?courierId=${courier_id}`,
        null
    );

    if (!success || !data) {
        console.warn(`[Cobros] No se pudo obtener wallet del repartidor ${courier_id}`);
        return null;
    }

    return data?.result || data?.data || data;
}

// ─── Cancelar pago ────────────────────────────────────────────────────────────

/**
 * Cancela un pago existente.
 * PATCH /api/payments/:payment_id/cancel
 */
async function cancelPayment(payment_id, reason) {
    const { success, data } = await httpPost(
        `${BASE_URL}/api/payments/${payment_id}/cancel`,
        { reason: reason || "Cancelado por el cliente" },
        null
    );

    if (!success || !data) {
        console.warn(`[Cobros] No se pudo cancelar el pago ${payment_id}`);
        return { cancelled: false, message: "No se pudo cancelar el pago" };
    }

    return {
        cancelled: true,
        message:   "Pago cancelado exitosamente",
        data:      data?.result || data,
    };
}

export { requestRefund, findPaymentByOrder, getCourierWallet, cancelPayment };