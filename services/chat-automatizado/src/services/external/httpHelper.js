import axios from "axios";

const DEFAULT_TIMEOUT = 5000;

function logHttpError(method, url, error) {
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        console.warn(`[HTTP] Servicio no disponible (${method}): ${url}`);
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
        console.warn(`[HTTP] Timeout (${method}): ${url}`);
    } else if (error.response) {
        console.warn(`[HTTP] Error ${error.response.status} (${method}): ${url}`);
    } else {
        console.warn(`[HTTP] Error desconocido (${method}): ${url} — ${error.message}`);
    }
}

async function httpGet(url, fallback = null, headers = {}) {
    try {
        const { data } = await axios.get(url, {
            timeout: DEFAULT_TIMEOUT,
            headers,
        });
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
        const { data } = await axios.delete(url, {
            timeout: DEFAULT_TIMEOUT,
            headers,
        });
        return { success: true, data };
    } catch (error) {
        logHttpError("DELETE", url, error);
        return { success: false, data: fallback };
    }
}

export { httpGet, httpPost, httpPatch, httpDelete };