// src/services/external/httpHelper.js

const axios = require("axios");
const DEFAULT_TIMEOUT = 5000;

/**
 * GET con fallback
 *
 * @param {string} url        - URL completa del endpoint
 * @param {*}      fallback   - valor a retornar si el servicio falla
 * @param {object} headers    - headers adicionales (ej: token de auth)
 */
async function httpGet(url, fallback = null, headers = {}) {
    try {
        const { data } = await axios.get(url, {
            timeout: DEFAULT_TIMEOUT,
            headers,
        });
        return { success: true, data };
    } catch (error) {
        // Distinguimos el tipo de error para mejor debugging
        if (error.code === "ECONNREFUSED") {
            console.warn(`[HTTP] Servicio no disponible: ${url}`);
        } else if (error.code === "ETIMEDOUT") {
            console.warn(`[HTTP] Timeout al conectar: ${url}`);
        } else if (error.response) {
            // El servicio respondió pero con error (404, 500, etc.)
            console.warn(
                `[HTTP] Error ${error.response.status} en: ${url}`
            );
        } else {
            console.warn(`[HTTP] Error desconocido: ${url}`, error.message);
        }

        return { success: false, data: fallback };
    }
}

/**
 * POST con fallback
 *
 * @param {string} url      - URL completa del endpoint
 * @param {object} body     - cuerpo de la petición
 * @param {*}      fallback - valor a retornar si el servicio falla
 * @param {object} headers  - headers adicionales
 */
async function httpPost(url, body, fallback = null, headers = {}) {
    try {
        const { data } = await axios.post(url, body, {
            timeout: DEFAULT_TIMEOUT,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });
        return { success: true, data };
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            console.warn(`[HTTP] Servicio no disponible: ${url}`);
        } else if (error.response) {
            console.warn(
                `[HTTP] Error ${error.response.status} en: ${url}`,
                error.response.data
            );
        } else {
            console.warn(`[HTTP] Error en POST: ${url}`, error.message);
        }

        return { success: false, data: fallback };
    }
}

module.exports = { httpGet, httpPost };