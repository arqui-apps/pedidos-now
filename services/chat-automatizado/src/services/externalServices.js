import {
    getUserById,
    getDeliveryById,
    getBusinessById,
} from "./external/auth.external.js";

import {
    getOrderByCode,
    getPendingOrdersByDelivery,
    cancelOrder,
    createIncidencia,
} from "./external/pedidos.external.js";

import {
    createCompensationCoupon,
    validateCoupon,
    getClientCoupons,
} from "./external/descuentos.external.js";

import {
    requestRefund,
    findPaymentByOrder,
    getCourierWallet,
    cancelPayment,
} from "./external/cobros.external.js";

import {
    getBanks,
    getBankById,
    getAccountByUserId,
    processRefund,
    validateUserAccount,
} from "./external/bancario.external.js";

export {
    // Auth
    getUserById,
    getDeliveryById,
    getBusinessById,
    // Pedidos / Logística
    getOrderByCode,
    getPendingOrdersByDelivery,
    cancelOrder,
    createIncidencia,
    // Descuentos
    createCompensationCoupon,
    validateCoupon,
    getClientCoupons,
    // Cobros
    requestRefund,
    findPaymentByOrder,
    getCourierWallet,
    cancelPayment,
    // Bancario
    getBanks,
    getBankById,
    getAccountByUserId,
    processRefund,
    validateUserAccount,
};