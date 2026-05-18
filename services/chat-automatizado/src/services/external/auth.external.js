import { httpGet } from "./httpHelper.js";
import logger from "../../config/logger.js";

const BASE_URL =
    process.env.AUTH_SERVICE_URL ||
    "https://broker-services-production.up.railway.app";

async function getUserById(id_usuario) {
    const { success, data } = await httpGet(
        `${BASE_URL}/api/paqueteria/users/${id_usuario}`,
        {
            id_usuario,
            nombre: "Usuario",
            email: "sin-email@mock.com",
            user_type: null,
            is_active: true,
        }
    );
    if (success) {
        logger.info({ id_usuario }, "[Auth] Usuario real obtenido del Broker");
    } else {
        logger.warn({ id_usuario }, "[Auth] Usando mock para usuario");
    }
    return data;
}

async function getDeliveryById(id_repartidor) {
    const { success, data } = await httpGet(
        `${BASE_URL}/api/paqueteria/couriers/${id_repartidor}`,
        { id_usuario: id_repartidor, nombre: "Repartidor", is_active: true }
    );
    if (success) {
        logger.info({ id_repartidor }, "[Auth] Repartidor real obtenido del Broker");
    } else {
        logger.warn({ id_repartidor }, "[Auth] Usando mock para repartidor");
    }
    return data;
}

async function getBusinessById(id_negocio) {
    const { success, data } = await httpGet(
        `${BASE_URL}/api/restaurantes/${id_negocio}`,
        {
            id_usuario: id_negocio,
            nombre: "Negocio",
            business_type: "restaurante",
            is_active: true,
        }
    );
    if (success) {
        logger.info({ id_negocio }, "[Auth] Negocio real obtenido del Broker");
    } else {
        logger.warn({ id_negocio }, "[Auth] Usando mock para negocio");
    }
    return data;
}

export { getUserById, getDeliveryById, getBusinessById };