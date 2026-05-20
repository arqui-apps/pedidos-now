import { httpGet, httpPost } from "./httpHelper.js";
import logger from "../../config/logger.js";

const BROKER_URL =
    process.env.BROKER_URL || "https://broker-services-production.up.railway.app";
const LOGISTICA_URL =
    process.env.LOGISTICA_SERVICE_URL || "https://modulo-logistica.fly.dev";
const RESTAURANTS_URL =
    process.env.RESTAURANTS_SERVICE_URL || "https://restaurantes.fly.dev/api";
const NEGOCIOS_URL =
    process.env.NEGOCIOS_SERVICE_URL || "https://proyectoarqui.onrender.com";

// ─── Paso 1: Obtener cobro_id desde el módulo origen ─────────────────────────

/**
 * Obtiene el cobro_id (payment_id de Cobros) consultando el módulo origen.
 * Flujo:
 *   1. Consultar Logística para saber si el pedido es de restaurante o negocio
 *   2. Consultar el módulo origen para obtener el cobro_id
 */
async function getCobroIdByOrderCode(order_code) {
    const order_id = extractOrderId(order_code);
    if (!order_id) return null;

    // 1. Consultar Logística para saber el módulo origen
    const { success: logOk, data: logData } = await httpGet(
        `${LOGISTICA_URL}/api/logistica/entregas/origen/${order_id}?tipo_origen=pedido`,
        null
    );

    if (!logOk || !logData?.data) {
        logger.warn({ order_code }, "[Cobros] No se encontró entrega en Logística");
        return null;
    }

    const entregas = Array.isArray(logData.data) ? logData.data : [logData.data];
    const entrega = entregas.find(e => e.activa) || entregas[0];

    if (!entrega) return null;

    const tipo_origen = entrega.tipo_origen || "restaurante";
    logger.info({ order_id, tipo_origen }, "[Cobros] Módulo origen detectado");

    // 2a. Si es restaurante → buscar cobro_id en Restaurantes
    if (tipo_origen === "restaurante" || tipo_origen === "pedido") {
        // Buscar en qué restaurante está
        const { success: restListOk, data: restListData } = await httpGet(
            `${RESTAURANTS_URL}/restaurantes`,
            null
        );

        if (restListOk && restListData?.data?.length) {
            for (const restaurante of restListData.data.filter(r => r.activo !== false)) {
                const { success: ok, data: pedidoData } = await httpGet(
                    `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos/${order_id}`,
                    null
                );

                const pedido = pedidoData?.data?.data || pedidoData?.data || pedidoData;

                if (ok && pedido?.id) {
                    const cobro_id = pedido.cobro_id;
                    if (cobro_id) {
                        logger.info({ order_id, cobro_id }, "[Cobros] cobro_id encontrado en Restaurantes");
                        return cobro_id;
                    } else {
                        logger.warn({ order_id }, "[Cobros] Pedido encontrado en Restaurantes pero cobro_id es null");
                        return null;
                    }
                }
            }
        }
    }

    // 2b. Si es negocio → buscar externalPaymentCode en Negocios
    if (tipo_origen === "negocio") {
        const { success: ok, data: orderData } = await httpGet(
            `${NEGOCIOS_URL}/api/internal/business-orders/${order_code}`,
            null
        );

        const order = orderData?.data || orderData;

        if (ok && order?.externalPaymentCode) {
            logger.info({ order_id, payment_code: order.externalPaymentCode }, "[Cobros] externalPaymentCode encontrado en Negocios");
            return order.externalPaymentCode;
        } else {
            logger.warn({ order_id }, "[Cobros] Pedido encontrado en Negocios pero externalPaymentCode es null");
            return null;
        }
    }

    return null;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function extractOrderId(order_code) {
    if (!order_code) return null;
    const match = String(order_code).match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
}

// ─── Paso 2: Procesar reembolso ───────────────────────────────────────────────

/**
 * Flujo completo de reembolso:
 * 1. Obtener cobro_id desde Logística → Restaurantes/Negocios
 * 2. Hacer el reembolso en Cobros con ese cobro_id
 */
async function requestRefund(id_usuario, amount, reason, id_session, order_code = null) {
    let cobro_id = null;

    if (order_code) {
        cobro_id = await getCobroIdByOrderCode(order_code);
    }

    if (!cobro_id) {
        logger.warn({ id_usuario, order_code }, "[Cobros] No se encontró cobro_id, registrando reembolso como pendiente");
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

    // Hacer el reembolso real
    const { success, data } = await httpPost(
        `${BROKER_URL}/api/cobros/payments/${cobro_id}/refund`,
        {
            amount,
            reason: reason || "Reembolso solicitado por el cliente a través del chat automatizado",
        },
        null
    );

    if (!success || !data) {
        logger.warn({ cobro_id }, "[Cobros] Error al procesar reembolso");
        return {
            refund_id:  null,
            status:     "pendiente",
            message:    "Tu reembolso fue registrado y será procesado pronto",
            processed:  false,
        };
    }

    const result = data?.result || data;
    logger.info({ cobro_id, amount, status: result?.status }, "[Cobros] Reembolso procesado exitosamente");

    return {
        refund_id:  cobro_id,
        status:     result?.status || "procesado",
        message:    "Tu reembolso fue procesado exitosamente",
        processed:  true,
        amount,
        payment_id: cobro_id,
        total_refunded: result?.total_refunded,
        refundable_balance: result?.refundable_balance,
    };
}

// ─── Consultar wallet de repartidor ──────────────────────────────────────────

async function getCourierWallet(courier_id) {
    const { success, data } = await httpGet(
        `${BROKER_URL}/api/cobros/wallet/summary?courierId=${courier_id}`,
        null
    );

    if (!success || !data) {
        logger.warn({ courier_id }, "[Cobros] No se pudo obtener wallet del repartidor");
        return null;
    }

    return data?.result || data?.data || data;
}

// ─── Cancelar pago ────────────────────────────────────────────────────────────

async function cancelPayment(cobro_id, reason) {
    const { success, data } = await httpPost(
        `${BROKER_URL}/api/cobros/payments/${cobro_id}/cancel`,
        { reason: reason || "Cancelado por el cliente" },
        null
    );

    if (!success || !data) {
        logger.warn({ cobro_id }, "[Cobros] No se pudo cancelar el pago");
        return { cancelled: false, message: "No se pudo cancelar el pago" };
    }

    return { cancelled: true, message: "Pago cancelado exitosamente", data: data?.result || data };
}

// ─── Buscar pago por order_id (para uso directo) ──────────────────────────────

async function findPaymentByOrder(order_code) {
    const cobro_id = await getCobroIdByOrderCode(order_code);
    if (!cobro_id) return null;

    const { success, data } = await httpGet(
        `${BROKER_URL}/api/cobros/payments/${cobro_id}`,
        null
    );

    return success && data?.result ? data.result : null;
}

export { requestRefund, findPaymentByOrder, getCourierWallet, cancelPayment };