const axios = require("axios");
const routeMap = require("../config/routeMap");
const { getServiceUrl } = require("../services/serviceResolver");

const normalizePath = (path) => {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }

  return path;
};

const parseRequestPath = (path, query = {}) => {
  const normalizedPath = normalizePath(path);
  const [pathname, rawQuery = ""] = normalizedPath.split("?");
  const queryFromPath = Object.fromEntries(new URLSearchParams(rawQuery));

  return {
    pathname,
    query: {
      ...queryFromPath,
      ...query,
    },
  };
};

const pathToRegex = (routePath) => {
  const escapedPath = routePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parameterizedPath = escapedPath.replace(/:([^/]+)/g, "(?<$1>[^/]+)");

  return new RegExp(`^${parameterizedPath}$`);
};

const matchRoute = (method, path) => {
  for (const route of routeMap) {
    const routeRegex = pathToRegex(route.path);
    const match = routeRegex.exec(path);

    if (route.method === method.toUpperCase() && match) {
      return {
        ...route,
        params: match.groups || {},
      };
    }
  }

  return null;
};

const buildTargetUrl = (baseUrl, path) => {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const buildTargetPath = (targetPath, params = {}) => {
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(`:${key}`, encodeURIComponent(value));
  }, targetPath);
};

const getForwardHeaders = (headers = {}) => {
  const blockedHeaders = ["host", "content-length"];

  return Object.entries(headers).reduce((result, [key, value]) => {
    if (!blockedHeaders.includes(key.toLowerCase())) {
      result[key] = value;
    }

    return result;
  }, {});
};

const handleBrokerRequest = async (req, res) => {
  const { method, path, body = {}, query = {}, headers = {} } = req.body;

  if (!method || !path || typeof method !== "string" || typeof path !== "string") {
    return res.status(400).json({
      success: false,
      error: "Solicitud invalida",
      message: "Los campos 'method' y 'path' son obligatorios",
    });
  }

  const normalizedMethod = method.toUpperCase();
  const { pathname: normalizedPath, query: forwardedQuery } = parseRequestPath(path, query);
  const matchedRoute = matchRoute(normalizedMethod, normalizedPath);

  if (!matchedRoute) {
    return res.status(404).json({
      success: false,
      error: "Ruta no encontrada",
      message: `No existe una ruta registrada para ${normalizedMethod} ${normalizedPath}`,
    });
  }

  const serviceUrl = getServiceUrl(matchedRoute.service);

  if (!serviceUrl) {
    return res.status(503).json({
      success: false,
      error: "Servicio no configurado",
      message: `No existe una URL configurada para el servicio ${matchedRoute.service}`,
    });
  }

  const targetPath = buildTargetPath(matchedRoute.targetPath || normalizedPath, matchedRoute.params);
  const targetUrl = buildTargetUrl(serviceUrl, targetPath);

  try {
    const response = await axios({
      method: normalizedMethod,
      url: targetUrl,
      data: body,
      params: forwardedQuery,
      headers: {
        "Content-Type": "application/json",
        ...getForwardHeaders(headers),
      },
      timeout: 15000,
    });

    if (response.headers["content-type"]) {
      res.set("Content-Type", response.headers["content-type"]);
    }

    return res.status(response.status).send(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: "Error devuelto por business-service",
        status: error.response.status,
        data: error.response.data,
      });
    }

    if (error.code === "ECONNABORTED" || error.code === "ECONNREFUSED" || error.code === "ENOTFOUND" || error.code === "EAI_AGAIN") {
      return res.status(503).json({
        success: false,
        error: "business-service no disponible",
        message: "No fue posible conectar con el microservicio de negocios",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Error interno del broker",
      message: error.message,
    });
  }
};

module.exports = { handleBrokerRequest };
