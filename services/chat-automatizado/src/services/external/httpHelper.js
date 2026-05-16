import axios from "axios";
import logger from "../../config/logger.js";

const DEFAULT_TIMEOUT = 5000;

function logHttpError(method, url, error) {
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        logger.warn({ method, url }, "Servicio no disponible");
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
        logger.warn({ method, url }, "Timeout al conectar");
    } else if (error.response) {
        logger.warn({ method, url, status: error.response.status }, `Error HTTP ${error.response.status}`);
    } else {
        logger.error({ method, url, err: error.message }, "Error desconocido");
    }
}

async function httpGet(url, fallback = null, headers = {}) {
    try {
        const { data } = await axios.get(url, { timeout: DEFAULT_TIMEOUT, headers });
        return { success: true, data };
    } catch (error) {
        logHttpError("GET", url, error);
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
        logHttpError("POST", url, error);
        return { success: false, data: fallback };
    }
}

async function httpPatch(url, body, fallback = null, headers = {}) {
    try {
        const { data } = await axios.patch(url, body, {
            timeout: DEFAULT_TIMEOUT,
            headers: { "Content-Type": "application/json", ...headers },
        });
        return { success: true, data };
    } catch (error) {
        logHttpError("PATCH", url, error);
        return { success: false, data: fallback };
    }
}

async function httpDelete(url, fallback = null, headers = {}) {
    try {
        const { data } = await axios.delete(url, { timeout: DEFAULT_TIMEOUT, headers });
        return { success: true, data };
    } catch (error) {
        logHttpError("DELETE", url, error);
        return { success: false, data: fallback };
    }
}

export { httpGet, httpPost, httpPatch, httpDelete };