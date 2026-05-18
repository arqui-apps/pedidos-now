import { httpGet, httpPost } from "./httpHelper.js";
import logger from "../../config/logger.js";

const BASE_URL =
    process.env.DESCUENTOS_SERVICE_URL || "http://157.245.138.186:3001";

function extractOrderId(order_code) {
    if (!order_code) return null;
    const match = String(order_code).match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
}

async function createCompensationCoupon(id_usuario, amount, reason, order_code = null) {
    const { success, data } = await httpPost(
        `${BASE_URL}/api/cupones`,
        {
            tipo:                        "COMPENSACION",
            cliente_id:                  id_usuario,
            tipo_descuento:              "MONTO_FIJO",
            valor_descuento:             amount,
            monto_minimo_pedido:         null,
            origen_solicitud:            "BOT_AUTOMATIZADO",
            solicitado_por:              "bot_servicio_cliente",
            pedido_afectado_id:          extractOrderId(order_code),
            motivo_compensacion:         reason || "Compensación por problema con pedido",
            confirmacion_pedido_fallido: true,
        },
        null
    );

    if (!success || !data) {
        logger.warn({ id_usuario, amount }, "[Descuentos] Servicio no disponible, generando cupón mock");
        const mockCode = `COMP-${id_usuario}-${Date.now()}`;
        return {
            success:         true,
            cupon_code:      mockCode,
            amount,
            expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            is_mock:         true,
        };
    }

    const cupon = data?.data || data;
    logger.info({ id_usuario, cupon_code: cupon.codigo }, "[Descuentos] Cupón generado exitosamente");
    return {
        success:         true,
        cupon_code:      cupon.codigo || cupon.code || cupon.cupon_code,
        amount:          cupon.valor_descuento || amount,
        expiration_date: cupon.fecha_expiracion || cupon.expiration_date ||
                         new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        id_cupon:        cupon.id,
        is_mock:         false,
    };
}

async function validateCoupon(codigo, monto_pedido = 0) {
    const { success, data } = await httpPost(
        `${BASE_URL}/api/cupones/validar`,
        { codigo, monto_pedido },
        null
    );

    if (!success || !data) {
        logger.warn({ codigo }, "[Descuentos] No se pudo validar el cupón");
        return { valid: false, message: "No se pudo validar el cupón en este momento" };
    }

    const result = data?.data || data;
    return {
        valid:   result.valido ?? result.valid ?? false,
        message: result.mensaje || result.message || "Cupón validado",
        data:    result,
    };
}

async function getClientCoupons(id_usuario) {
    const { success, data } = await httpGet(
        `${BASE_URL}/api/cupones/cliente/${id_usuario}/disponibles`,
        []
    );

    if (!success) {
        logger.warn({ id_usuario }, "[Descuentos] No se pudieron obtener cupones del cliente");
        return [];
    }

    return data?.data || data || [];
}

export { createCompensationCoupon, validateCoupon, getClientCoupons };