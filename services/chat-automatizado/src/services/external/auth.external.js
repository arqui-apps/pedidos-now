const { httpGet } = require("./httpHelper");

const BASE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001";


async function getUserById(id_usuario) {
    const { success, data } = await httpGet(
        `${BASE_URL}/users/${id_usuario}`,
        // Mock: si Auth no está disponible, asumimos que el usuario existe
        // para no bloquear el desarrollo. En producción esto NO debería pasar.
        {
            id_usuario,
            nombre: "Usuario",
            email: "sin-email@mock.com",
            user_type: null,
            is_active: true,
        }
    );

    if (!success) {
        console.warn(
            `[Auth] Usando mock para usuario ${id_usuario}`
        );
    }

    return data;
}

/**
 * Verifica si un repartidor existe y está activo.
 * Se usa en SOPORTE_CARRETERA antes de crear el support_request.
 */
async function getDeliveryById(id_repartidor) {
    const { success, data } = await httpGet(
        `${BASE_URL}/users/delivery/${id_repartidor}`,
        {
            id_usuario: id_repartidor,
            nombre: "Repartidor",
            is_active: true,
        }
    );

    if (!success) {
        console.warn(
            `[Auth] Usando mock para repartidor ${id_repartidor}`
        );
    }

    return data;
}

/**
 * Verifica si un negocio existe.
 * Se usa cuando un negocio quiere cancelar un pedido.
 */
async function getBusinessById(id_negocio) {
    const { success, data } = await httpGet(
        `${BASE_URL}/users/business/${id_negocio}`,
        {
            id_usuario: id_negocio,
            nombre: "Negocio",
            business_type: "restaurante",
            is_active: true,
        }
    );

    if (!success) {
        console.warn(
            `[Auth] Usando mock para negocio ${id_negocio}`
        );
    }

    return data;
}

module.exports = { getUserById, getDeliveryById, getBusinessById };