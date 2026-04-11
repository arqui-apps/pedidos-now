import { httpGet } from "./httpHelper.js";

const BASE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3001";

async function getUserById(id_usuario) {
    const { success, data } = await httpGet(
        `${BASE_URL}/users/${id_usuario}`,
        {
            id_usuario,
            nombre: "Usuario",
            email: "sin-email@mock.com",
            user_type: null,
            is_active: true,
        }
    );
    if (!success) console.warn(`[Auth] Usando mock para usuario ${id_usuario}`);
    return data;
}

async function getDeliveryById(id_repartidor) {
    const { success, data } = await httpGet(
        `${BASE_URL}/users/delivery/${id_repartidor}`,
        { id_usuario: id_repartidor, nombre: "Repartidor", is_active: true }
    );
    if (!success)
        console.warn(`[Auth] Usando mock para repartidor ${id_repartidor}`);
    return data;
}

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
    if (!success)
        console.warn(`[Auth] Usando mock para negocio ${id_negocio}`);
    return data;
}

export { getUserById, getDeliveryById, getBusinessById };