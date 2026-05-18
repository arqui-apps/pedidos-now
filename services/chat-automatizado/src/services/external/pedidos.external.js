import { httpGet, httpPost } from "./httpHelper.js";
import logger from "../../config/logger.js";

const RESTAURANTS_URL =
    process.env.RESTAURANTS_SERVICE_URL || "http://localhost:3002";
const NEGOCIOS_URL =
    process.env.NEGOCIOS_SERVICE_URL || "http://localhost:3003";
const PAQUETERIA_URL =
    process.env.PAQUETERIA_SERVICE_URL || "https://pedidos-now-backend.onrender.com";
const LOGISTICA_URL =
    process.env.LOGISTICA_SERVICE_URL || "https://modulo-logistica.fly.dev";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractOrderId(order_code) {
    if (!order_code) return null;
    const match = String(order_code).match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
}



// ─── Restaurantes ─────────────────────────────────────────────────────────────

async function getRestaurantList() {
    const { success, data: respuesta } = await httpGet(
        `${RESTAURANTS_URL}/restaurantes`,
        []
    );
    const restaurantes = Array.isArray(respuesta)
        ? respuesta
        : respuesta?.data || [];

    if (!success || !restaurantes.length) {
        logger.warn("[Pedidos] No se pudo obtener lista de restaurantes");
        return [];
    }
    return restaurantes.filter((r) => r.activo !== false);
}

function normalizeRestaurantOrder(pedido, restauranteName = "Restaurante") {
    const estadoMap = {
        1: "pendiente",
        2: "confirmado",
        3: "en_preparacion",
        4: "listo",
        5: "en_camino",
        6: "entregado",
        7: "cancelado",
    };

    const items = pedido.detalles?.map((d) => {
        const nombre = d.producto?.nombre || d.combo?.nombre || "Producto";
        return `${nombre} x${d.cantidad}`;
    }) || [];

    return {
        order_code:        `PED-${pedido.id}`,
        id:                pedido.id,
        restaurante_id:    pedido.restaurante_id,
        status:            estadoMap[pedido.estado_id] || "desconocido",
        business:          restauranteName,
        items,
        total:             parseFloat(pedido.total) || 0,
        direccion_entrega: pedido.direccion_entrega || "",
        notas:             pedido.notas || null,
        estimated_delivery: pedido.estado_id <= 4 ? "30 minutos" : null,
        source:            "restaurante",
    };
}

// Cache en memoria: { order_id -> restaurante_id }
const orderRestaurantCache = new Map();

async function findOrderInRestaurants(order_id) {
    const restaurantes = await getRestaurantList();
    if (!restaurantes.length) return null;

    // 1. Si ya sabemos en qué restaurante está, ir directo
    if (orderRestaurantCache.has(order_id)) {
        const cachedId = orderRestaurantCache.get(order_id);
        const restaurante = restaurantes.find(r => r.id === cachedId);

        if (restaurante) {
            const { success: ok, data: respuestaPedido } = await httpGet(
                `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos/${order_id}`,
                null
            );
            const pedido = respuestaPedido?.data?.data || respuestaPedido?.data || respuestaPedido;
            if (ok && pedido?.id) {
                return normalizeRestaurantOrder(pedido, restaurante.nombre);
            }
            // Si falla, limpiar caché y buscar en todos
            orderRestaurantCache.delete(order_id);
        }
    }

    // 2. Buscar en todos en paralelo
    const resultados = await Promise.all(
        restaurantes.map(async (restaurante) => {
            const { success: ok, data: respuestaPedido } = await httpGet(
                `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos/${order_id}`,
                null
            );
            const pedido = respuestaPedido?.data?.data || respuestaPedido?.data || respuestaPedido;
            if (ok && pedido?.id) {
                // Guardar en caché para la próxima búsqueda
                orderRestaurantCache.set(order_id, restaurante.id);
                logger.info({ order_id, restaurante_id: restaurante.id }, "[Pedidos] Pedido encontrado y cacheado");
                return normalizeRestaurantOrder(pedido, restaurante.nombre);
            }
            return null;
        })
    );

    return resultados.find((r) => r !== null) || null;
}

async function cancelOrderInRestaurants(order_id, reason) {
    const restaurantes = await getRestaurantList();
    if (!restaurantes.length) return null;

    for (const restaurante of restaurantes) {
        const { success: exists, data: respuestaPedido } = await httpGet(
            `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos/${order_id}`,
            null
        );

        const pedido =
            respuestaPedido?.data?.data ||
            respuestaPedido?.data ||
            respuestaPedido;

        if (!exists || !pedido?.id) continue;

        if (pedido.estado_id === 7) {
            return { cancelled: false, message: "El pedido ya fue cancelado" };
        }
        if (pedido.estado_id === 6) {
            return { cancelled: false, message: "No se puede cancelar un pedido ya entregado" };
        }

        const { success: ok, data: resultado } = await httpPost(
            `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos/${order_id}/cancelacion/cancelar`,
            {
                cancelado_por: "cliente",
                motivo: reason || "Cancelado por el cliente a través del chat automatizado",
            },
            null
        );

        if (ok && resultado) {
            const data = resultado?.data || resultado;
            const multa = data?.aplica_multa
                ? ` Se aplicó una multa de Q${data.monto_multa}.`
                : "";
            return {
                cancelled: true,
                message: `Pedido cancelado exitosamente.${multa}`,
                data,
            };
        }
    }
    return null;
}

async function getPendingFromRestaurants(id_repartidor) {
    const restaurantes = await getRestaurantList();
    if (!restaurantes.length) return [];

    const resultados = await Promise.all(
        restaurantes.map(async (restaurante) => {
            const { success, data: respuesta } = await httpGet(
                `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos?estado_id=5`,
                null
            );

            const pedidos = respuesta?.data || [];
            return pedidos
                .filter((p) => p.repartidor_id === id_repartidor)
                .map((p) => normalizeRestaurantOrder(p, restaurante.nombre));
        })
    );

    return resultados.flat();
}

// ─── Negocios ─────────────────────────────────────────────────────────────────

/**
 * Normaliza la respuesta de Negocios al formato que espera el bot.
 * Estados: pending_validation, confirmed, preparing, ready_for_pickup,
 *          delivered, cancelled, cancelled_by_business
 */
function normalizeBusinessOrder(order) {
    const estadoMap = {
        pending_validation:    "pendiente",
        confirmed:             "confirmado",
        preparing:             "en_preparacion",
        ready_for_pickup:      "listo",
        delivered:             "entregado",
        cancelled:             "cancelado",
        cancelled_by_business: "cancelado",
    };

    const items = order.details?.map((d) => {
        return `${d.productNameSnapshot} x${d.quantity}`;
    }) || [];

    return {
        order_code:        order.externalOrderCode || `PED-${order.businessOrderId}`,
        id:                order.businessOrderId,
        status:            estadoMap[order.orderStatus] || "desconocido",
        business:          `Negocio #${order.businessId}`,
        items,
        total:             parseFloat(order.totalPaidAmountSnapshot) || 0,
        direccion_entrega: "",
        notas:             order.cancellationReason || null,
        estimated_delivery: null,
        source:            "negocio",
    };
}

/**
 * Busca un pedido de negocio por código externo.
 * GET /api/internal/business-orders/{externalOrderCode}
 * El externalOrderCode puede ser el mismo order_code del usuario (ej: PED-7)
 */
async function findOrderInNegocios(order_code) {
    const { success, data } = await httpGet(
        `${NEGOCIOS_URL}/api/internal/business-orders/${order_code}`,
        null
    );

    if (!success || !data) return null;

    const order = data?.data || data;
    if (!order?.businessOrderId) return null;

    return normalizeBusinessOrder(order);
}

/**
 * Cancela un pedido de negocio.
 * POST /api/internal/business-orders/cancel
 */
async function cancelOrderInNegocios(order_code, reason) {
    const { success, data } = await httpPost(
        `${NEGOCIOS_URL}/api/internal/business-orders/cancel`,
        {
            externalOrderCode: order_code,
            cancelledBy:       "customer",
            cancellationReason: reason || "Cancelado por el cliente a través del chat automatizado",
        },
        null
    );

    if (!success || !data) return null;

    return {
        cancelled: true,
        message:   "Pedido de negocio cancelado exitosamente",
        data:      data?.data || data,
    };
}

// ─── Logística ───────────────────────────────────────────────────────────────

/**
 * Normaliza la respuesta de Logística al formato que espera el bot.
 * Estados: pendiente, asignada, en_ruta, entregada, cancelada, no_entregada
 */
function normalizeLogisticaOrder(entrega) {
    const estadoMap = {
        pendiente:     "pendiente",
        asignada:      "confirmado",
        en_ruta:       "en_camino",
        entregada:     "entregado",
        cancelada:     "cancelado",
        no_entregada:  "no_entregado",
    };

    const repartidor = entrega.asignaciones?.find(a => a.activa)?.repartidor_id || null;

    return {
        order_code:        `PED-${entrega.origen_id}`,
        id:                entrega.origen_id,
        entrega_id:        entrega.id_entrega,
        status:            estadoMap[entrega.estado_entrega] || "desconocido",
        business:          entrega.negocio_nombre || "Negocio",
        items:             entrega.detalles_orden || [],
        total:             parseFloat(entrega.monto_cobrar) || 0,
        direccion_entrega: entrega.direccion_entrega || "",
        referencia:        entrega.referencia_direccion || null,
        instrucciones:     entrega.instrucciones_entrega || null,
        repartidor_id:     repartidor,
        tipo_origen:       entrega.tipo_origen || "pedido",
        fecha_estimada:    entrega.fecha_entrega_estimada || null,
        source:            "logistica",
    };
}

/**
 * Busca el pedido en Logística por origen_id.
 * Mientras el equipo de Logística agrega el filtro ?origen_id=X,
 * traemos todas las entregas y filtramos del lado nuestro.
 * TODO: cambiar a GET /api/logistica/entregas?origen_id={order_id} cuando esté disponible
 */
async function findOrderInLogistica(order_id) {
    // Endpoint directo por origen_id
    const { success, data } = await httpGet(
        `${LOGISTICA_URL}/api/logistica/entregas/origen/${order_id}?tipo_origen=pedido`,
        null
    );

    if (!success || !data?.data) return null;

    // Puede devolver array o un solo objeto
    const entregas = Array.isArray(data.data) ? data.data : [data.data];
    if (!entregas.length) return null;

    // Tomar la entrega más reciente activa
    const entrega = entregas.find(e => e.activa) || entregas[0];
    if (!entrega) return null;

    logger.info({ order_id, entrega_id: entrega.id_entrega, estado: entrega.estado_entrega }, "[Logistica] Entrega encontrada");
    return normalizeLogisticaOrder(entrega);
}

/**
 * Busca entregas activas de un repartidor en Logística.
 * GET /api/logistica/asignaciones/repartidor/:id?activa=true
 */
async function getPendingFromLogistica(id_repartidor) {
    const { success, data } = await httpGet(
        `${LOGISTICA_URL}/api/logistica/asignaciones/repartidor/${id_repartidor}?activa=true`,
        null
    );

    if (!success || !data?.data) return [];

    const asignaciones = Array.isArray(data.data) ? data.data : [data.data];

    return asignaciones.map(a => ({
        order_code:        `PED-${a.origen_id || a.entrega_id}`,
        id:                a.entrega_id,
        status:            "en_camino",
        business:          a.negocio_nombre || "Negocio",
        address:           a.direccion_entrega || "",
        total:             parseFloat(a.monto_cobrar) || 0,
        source:            "logistica",
    }));
}

/**
 * Cancela una entrega en Logística.
 * Primero busca el id_entrega por origen_id, luego cancela.
 * PATCH /api/logistica/entregas/:id_entrega/cancelar
 */
async function cancelOrderInLogistica(order_id, reason) {
    // 1. Buscar la entrega
    const { success, data } = await httpGet(
        `${LOGISTICA_URL}/api/logistica/entregas/origen/${order_id}?tipo_origen=pedido`,
        null
    );

    if (!success || !data?.data) return null;

    const entregas = Array.isArray(data.data) ? data.data : [data.data];
    const entrega = entregas.find(e => e.activa) || entregas[0];
    if (!entrega?.id_entrega) return null;

    // 2. Cancelar la entrega
    const { success: ok, data: resultado } = await httpPost(
        `${LOGISTICA_URL}/api/logistica/entregas/${entrega.id_entrega}/cancelar`,
        { comentario: reason || "Cancelado por el cliente a través del chat automatizado" },
        null
    );

    if (!ok || !resultado) {
        logger.warn({ entrega_id: entrega.id_entrega }, "[Logistica] No se pudo cancelar la entrega");
        return null;
    }

    logger.info({ entrega_id: entrega.id_entrega }, "[Logistica] Entrega cancelada exitosamente");
    return {
        cancelled: true,
        message:   "Entrega cancelada exitosamente",
        data:      resultado?.data || resultado,
    };
}

/**
 * Crea una incidencia en Logística cuando el repartidor reporta un problema.
 * POST /api/logistica/incidencias
 * tipo_incidencia: cliente_ausente, direccion_incorrecta, accidente, otro
 */
async function createIncidencia(entrega_id, repartidor_id, tipo_incidencia, descripcion) {
    const { success, data } = await httpPost(
        `${LOGISTICA_URL}/api/logistica/incidencias`,
        {
            entrega_id,
            repartidor_id,
            tipo_incidencia,
            descripcion: descripcion || "Incidencia reportada desde chat automatizado",
        },
        null
    );

    if (!success || !data) {
        logger.warn({ entrega_id, tipo_incidencia }, "[Logistica] No se pudo crear incidencia");
        return null;
    }

    logger.info({ entrega_id, tipo_incidencia }, "[Logistica] Incidencia creada exitosamente");
    return data?.data || data;
}

// ─── Paquetería ───────────────────────────────────────────────────────────────

function normalizePackageOrder(pkg) {
    const shipment = pkg.idShipmentShipment || pkg.Shipment || {};

    const estadoMap = {
        pending:    "pendiente",
        assigned:   "confirmado",
        in_transit: "en_camino",
        delivered:  "entregado",
        cancelled:  "cancelado",
    };

    return {
        order_code:        `PED-${pkg.idPackage}`,
        id:                pkg.idPackage,
        status:            estadoMap[shipment.shipmentStatus] || "pendiente",
        business:          "Servicio de Paquetería",
        items:             [pkg.description || "Paquete"],
        total:             parseFloat(pkg.subtotal) || 0,
        size:              pkg.size || null,
        weight:            pkg.weight || null,
        direccion_entrega: shipment.deliveryInstructions || "",
        estimated_delivery: shipment.estimatedDeliveryTime
            ? new Date(shipment.estimatedDeliveryTime).toLocaleDateString("es-GT")
            : "Por confirmar",
        source: "paqueteria",
    };
}

async function findOrderInPaqueteria(order_id) {
    const { success, data } = await httpGet(
        `${PAQUETERIA_URL}/api/packages/${order_id}`,
        null
    );

    if (!success || !data) return null;

    const pkg = data?.data || data;
    if (!pkg?.idPackage) return null;

    return normalizePackageOrder(pkg);
}

async function getPendingFromPaqueteria(id_repartidor) {
    const { success, data } = await httpGet(
        `${PAQUETERIA_URL}/api/shipments`,
        null
    );

    if (!success || !data) return [];

    const shipments = Array.isArray(data) ? data : data?.data || [];

    return shipments
        .filter((s) => s.courierId === id_repartidor && s.shipmentStatus === "in_transit")
        .map((s) => ({
            order_code: `PED-${s.idShipment}`,
            id:         s.idShipment,
            status:     "en_camino",
            business:   "Servicio de Paquetería",
            address:    s.deliveryInstructions || "",
            total:      parseFloat(s.total) || 0,
            source:     "paqueteria",
        }));
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

async function getOrderByCode(order_code) {
    const order_id = extractOrderId(order_code);

    if (!order_id) {
        logger.warn({ order_code }, "[Pedidos] Código de pedido inválido");
        return buildMockOrder(order_code);
    }

    // Logística es la única fuente de verdad para pedidos
    const fromLogistica = await findOrderInLogistica(order_id);
    if (fromLogistica) return fromLogistica;

    logger.warn({ order_code }, "[Pedidos] Pedido no encontrado en Logística");
    return null;
}

async function getPendingOrdersByDelivery(id_repartidor) {
    // Logística es la fuente principal para pedidos activos del repartidor
    const [fromLogistica, fromRestaurants] = await Promise.all([
        getPendingFromLogistica(id_repartidor),
        getPendingFromRestaurants(id_repartidor),
    ]);

    // Combinar y deduplicar por order_code
    const seen = new Set();
    const allOrders = [];

    for (const order of [...fromLogistica, ...fromRestaurants]) {
        if (!seen.has(order.order_code)) {
            seen.add(order.order_code);
            allOrders.push(order);
        }
    }

    return allOrders;
}

async function cancelOrder(order_code, id_negocio, reason) {
    const order_id = extractOrderId(order_code);

    // 1. Cancelar en Logística (cancela la entrega)
    if (order_id) {
        const logisticaResult = await cancelOrderInLogistica(order_id, reason);
        if (logisticaResult) {
            // También cancelar en el origen (restaurante/negocio)
            if (RESTAURANTS_URL !== "http://localhost:3002") {
                await cancelOrderInRestaurants(order_id, reason).catch(() => {});
            }
            await cancelOrderInNegocios(order_code, reason).catch(() => {});
            return logisticaResult;
        }
    }

    // 2. Fallback: cancelar directo en restaurantes
    if (order_id && RESTAURANTS_URL !== "http://localhost:3002") {
        const result = await cancelOrderInRestaurants(order_id, reason);
        if (result) return result;
    }

    // 3. Fallback: cancelar en negocios
    const negocioResult = await cancelOrderInNegocios(order_code, reason);
    if (negocioResult) return negocioResult;

    return {
        cancelled: false,
        message: "No se pudo cancelar el pedido en este momento",
    };
}

export { getOrderByCode, getPendingOrdersByDelivery, cancelOrder, createIncidencia };