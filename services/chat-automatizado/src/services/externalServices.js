import {
    getUserById,
    getDeliveryById,
    getBusinessById,
} from "./external/auth.external.js";

import {
    getOrderByCode,
    getPendingOrdersByDelivery,
    cancelOrder,
} from "./external/pedidos.external.js";

import {
    createCompensationCoupon,
    validateCoupon,
} from "./external/descuentos.external.js";

import { requestRefund } from "./external/cobros.external.js";

export {
    // Auth
    getUserById,
    getDeliveryById,
    getBusinessById,
    // Pedidos
    getOrderByCode,
    getPendingOrdersByDelivery,
    cancelOrder,
    // Descuentos
    createCompensationCoupon,
    validateCoupon,
    // Cobros
    requestRefund,
};