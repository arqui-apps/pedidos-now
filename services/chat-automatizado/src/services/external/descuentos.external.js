const { httpGet, httpPost } = require("./httpHelper");

const BASE_URL =
    process.env.DESCUENTOS_SERVICE_URL || "http://localhost:3005";

/**
 * Crea un cupón de compensación.
 *
 * Por qué el monto está hardcodeado en 25:
 * El enunciado dice "compensaciones y reembolsos PEQUEÑOS".
 * Definimos Q25.00 como compensación estándar por problema de pedido.
 */
async function createCompensationCoupon(id_usuario, amount, reason) {
    const { success, data } = await httpPost(
        `${BASE_URL}/coupons/compensation`,
        {
            id_usuario,
            amount,
            reason,
            expiration_days: 30,   // el cupón vence en 30 días
            coupon_type: "compensation",
        },
        null
    );

    if (!success || !data) {
        console.warn("[Descuentos] Generando cupón mock");
        // Mock: generamos un código local si el servicio no está disponible
        const mockCode = `COMP-${Date.now()}-${id_usuario}`;
        return {
            success: true,
            cupon_code: mockCode,
            amount,
            expiration_date: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
            ),
            is_mock: true,
        };
    }

    return data;
}

/**
 * Valida si un cupón aún está vigente y no ha sido usado.
 */
async function validateCoupon(cupon_code) {
    const { success, data } = await httpGet(
        `${BASE_URL}/coupons/validate/${cupon_code}`,
        null
    );

    if (!success || !data) {
        // Si no podemos validar, asumimos inválido por seguridad
        return {
            valid: false,
            message: "No se pudo validar el cupón en este momento",
        };
    }

    return data;
    // Esperamos que devuelva algo como:
    // { valid: true, amount: 25, expiration_date: "...", status: "pendiente" }
    // { valid: false, message: "Cupón expirado" }
}

module.exports = { createCompensationCoupon, validateCoupon };