/**
 * Por qué este archivo:
 * Es la fachada (patrón Facade) de todos los servicios externos
 *
 * Beneficio: si mañana el equipo de Auth cambia su endpoint,
 */

const auth       = require("./external/auth.external");
const pedidos    = require("./external/pedidos.external");
const descuentos = require("./external/descuentos.external");
const cobros     = require("./external/cobros.external");

module.exports = {
    // ── AUTH ────────────────────────────────────────────
    getUserById:      auth.getUserById,
    getDeliveryById:  auth.getDeliveryById,
    getBusinessById:  auth.getBusinessById,

    // ── PEDIDOS ─────────────────────────────────────────
    getOrderByCode:              pedidos.getOrderByCode,
    getPendingOrdersByDelivery:  pedidos.getPendingOrdersByDelivery,
    cancelOrder:                 pedidos.cancelOrder,

    // ── DESCUENTOS ──────────────────────────────────────
    createCompensationCoupon: descuentos.createCompensationCoupon,
    validateCoupon:           descuentos.validateCoupon,

    // ── COBROS ───────────────────────────────────────────
    requestRefund: cobros.requestRefund,
};