import { httpGet, httpPost } from "./httpHelper.js";

const BASE_URL =
    process.env.DESCUENTOS_SERVICE_URL || "http://localhost:3005";

async function createCompensationCoupon(id_usuario, amount, reason) {
    const { success, data } = await httpPost(
        `${BASE_URL}/coupons/compensation`,
        {
            id_usuario,
            amount,
            reason,
            expiration_days: 30,
            coupon_type: "compensation",
        },
        null
    );

    if (!success || !data) {
        console.warn("[Descuentos] Generando cupón mock");
        const mockCode = `COMP-${Date.now()}-${id_usuario}`;
        return {
            success: true,
            cupon_code: mockCode,
            amount,
            expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            is_mock: true,
        };
    }
    return data;
}

async function validateCoupon(cupon_code) {
    const { success, data } = await httpGet(
        `${BASE_URL}/coupons/validate/${cupon_code}`,
        null
    );
    if (!success || !data) {
        return {
            valid: false,
            message: "No se pudo validar el cupón en este momento",
        };
    }
    return data;
}

export { createCompensationCoupon, validateCoupon };