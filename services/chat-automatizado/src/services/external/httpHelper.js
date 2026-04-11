import axios from "axios";

const DEFAULT_TIMEOUT = 5000;

async function httpGet(url, fallback = null, headers = {}) {
    try {
        const { data } = await axios.get(url, {
            timeout: DEFAULT_TIMEOUT,
            headers,
        });
        return { success: true, data };
    } catch (error) {
        if (error.code === "ECONNREFUSED") {
            console.warn(`[HTTP] Servicio no disponible: ${url}`);
        } else if (error.code === "ETIMEDOUT") {
            console.warn(`[HTTP] Timeout al conectar: ${url}`);
        } else if (error.response) {
            console.warn(`[HTTP] Error ${error.response.status} en: ${url}`);
        } else {
            console.warn(`[HTTP] Error desconocido: ${url}`, error.message);
        }
        return { success: false, data: fallback };
    }
}

async function httpPost(url, body, fallback = null, headers = {}) {
    try {
        const { data } = await axios.post(url, body, {
            timeout: DEFAULT_TIMEOUT,
            headers: { "Content-Type": "application/json", ...headers },
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

export { httpGet, httpPost };