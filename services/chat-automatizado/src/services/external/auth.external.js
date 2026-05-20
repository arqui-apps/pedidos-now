import { httpGet } from "./httpHelper.js";
import logger from "../../config/logger.js";

const BASE_URL =
    process.env.AUTH_SERVICE_URL ||
    "https://broker-services-production.up.railway.app";

// Normaliza la respuesta del Broker al formato que espera el bot
function normalizeUser(data, fallback) {
    if (!data) return fallback;
    return {
        id_usuario:  data.idUser      || data.id_usuario  || fallback.id_usuario,
        nombre:      data.name        || data.nombre      || fallback.nombre,
        email:       data.email       || fallback.email,
        user_type:   data.user_type   || data.type        || fallback.user_type,
        is_active:   data.status      ?? data.is_active   ?? fallback.is_active,
    };
}

async function getUserById(id_usuario) {
    const { success, data } = await httpGet(
        `${BASE_URL}/api/paqueteria/users/${id_usuario}`,
        null
    );

    if (success && data) {
        logger.info({ id_usuario, nombre: data.name || data.nombre }, "[Auth] Usuario real obtenido del Broker");
        return normalizeUser(data, {
            id_usuario,
            nombre: "Usuario",
            email: "sin-email@mock.com",
            user_type: null,
            is_active: true,
        });
    }

    logger.warn({ id_usuario }, "[Auth] Usando mock para usuario");
    return {
        id_usuario,
        nombre: "Usuario",
        email: "sin-email@mock.com",
        user_type: null,
        is_active: true,
    };
}

async function getDeliveryById(id_repartidor) {
    const { success, data } = await httpGet(
        `${BASE_URL}/api/paqueteria/couriers/${id_repartidor}`,
        null
    );

    if (success && data) {
        logger.info({ id_repartidor, nombre: data.name || data.nombre }, "[Auth] Repartidor real obtenido del Broker");
        return normalizeUser(data, {
            id_usuario: id_repartidor,
            nombre: "Repartidor",
            is_active: true,
        });
    }

    logger.warn({ id_repartidor }, "[Auth] Usando mock para repartidor");
    return { id_usuario: id_repartidor, nombre: "Repartidor", is_active: true };
}

async function getBusinessById(id_negocio) {
    const { success, data } = await httpGet(
        `${BASE_URL}/api/restaurantes/${id_negocio}`,
        null
    );

    if (success && data) {
        logger.info({ id_negocio, nombre: data.name || data.nombre }, "[Auth] Negocio real obtenido del Broker");
        return normalizeUser(data, {
            id_usuario: id_negocio,
            nombre: "Negocio",
            business_type: "restaurante",
            is_active: true,
        });
    }

    logger.warn({ id_negocio }, "[Auth] Usando mock para negocio");
    return {
        id_usuario: id_negocio,
        nombre: "Negocio",
        business_type: "restaurante",
        is_active: true,
    };
}

export { getUserById, getDeliveryById, getBusinessById };