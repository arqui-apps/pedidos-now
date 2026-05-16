import { httpGet, httpPost } from "./httpHelper.js";

const RESTAURANTS_URL =
    process.env.RESTAURANTS_SERVICE_URL || "http://localhost:3002";
const NEGOCIOS_URL =
    process.env.NEGOCIOS_SERVICE_URL || "http://localhost:3003";
const PAQUETERIA_URL =
    process.env.PAQUETERIA_SERVICE_URL || "https://pedidos-now-backend.onrender.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractOrderId(order_code) {
    if (!order_code) return null;
    const match = String(order_code).match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
}

function buildMockOrder(order_code) {
    return {
        order_code,
        status: "en_camino",
        business: "Restaurante Ejemplo",
        items: ["Hamburguesa x1", "Refresco x2"],
        total: 85.5,
        estimated_delivery: "20 minutos",
        source: "mock",
    };
}

// ─── Helpers internos de restaurantes ────────────────────────────────────────

async function getRestaurantList() {
    const { success, data: respuesta } = await httpGet(
        `${RESTAURANTS_URL}/restaurantes`,
        []
    );
    const restaurantes = Array.isArray(respuesta)
        ? respuesta
        : respuesta?.data || [];

    if (!success || !restaurantes.length) {
        console.warn("[Pedidos] No se pudo obtener lista de restaurantes");
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

    const items =
        pedido.detalles?.map((d) => {
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

// ─── Helpers internos de paquetería ──────────────────────────────────────────

/**
 * Normaliza la respuesta de paquetería al formato que espera el bot.
 * Estados: pending, assigned, in_transit, delivered, cancelled
 */
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

// ─── Buscar pedido en restaurantes ───────────────────────────────────────────

async function findOrderInRestaurants(order_id) {
    const restaurantes = await getRestaurantList();
    if (!restaurantes.length) return null;

    const resultados = await Promise.all(
        restaurantes.map(async (restaurante) => {
            const { success: ok, data: respuestaPedido } = await httpGet(
                `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos/${order_id}`,
                null
            );

            const pedido =
                respuestaPedido?.data?.data ||
                respuestaPedido?.data ||
                respuestaPedido;

            if (ok && pedido?.id) {
                return normalizeRestaurantOrder(pedido, restaurante.nombre);
            }
            return null;
        })
    );

    return resultados.find((r) => r !== null) || null;
}

// ─── Buscar paquete en paquetería ─────────────────────────────────────────────

/**
 * Busca un paquete por ID en la API de paquetería.
 * GET /api/packages/:id
 */
async function findOrderInPaqueteria(order_id) {
    const { success, data } = await httpGet(
        `${PAQUETERIA_URL}/api/packages/${order_id}`,
        null
    );

    if (!success || !data) return null;

    // La API devuelve el paquete directamente o envuelto en data
    const pkg = data?.data || data;

    if (!pkg?.idPackage) return null;

    return normalizePackageOrder(pkg);
}

// ─── Cancelar pedido en restaurante ──────────────────────────────────────────

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

// ─── Pedidos pendientes de un repartidor ─────────────────────────────────────

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

/**
 * Busca envíos asignados a un repartidor en paquetería.
 * GET /api/shipments — filtramos por courier_id
 */
async function getPendingFromPaqueteria(id_repartidor) {
    const { success, data } = await httpGet(
        `${PAQUETERIA_URL}/api/shipments`,
        null
    );

    if (!success || !data) return [];

    const shipments = Array.isArray(data) ? data : data?.data || [];

    return shipments
        .filter(
            (s) =>
                s.courierId === id_repartidor &&
                s.shipmentStatus === "in_transit"
        )
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

    // 1. Buscar en restaurantes
    if (order_id && RESTAURANTS_URL !== "http://localhost:3002") {
        const fromRestaurant = await findOrderInRestaurants(order_id);
        if (fromRestaurant) return fromRestaurant;
    }

    // 2. Buscar en paquetería
    if (order_id) {
        const fromPaqueteria = await findOrderInPaqueteria(order_id);
        if (fromPaqueteria) return fromPaqueteria;
    }

    // 3. Buscar en negocios
    const negocios = await httpGet(
        `${NEGOCIOS_URL}/orders/${order_code}`,
        null
    );
    if (negocios.success && negocios.data)
        return { ...negocios.data, source: "negocio" };

    console.warn(`[Pedidos] Ningún servicio encontró el pedido: ${order_code}`);
    return buildMockOrder(order_code);
}

async function getPendingOrdersByDelivery(id_repartidor) {
    const [fromRestaurants, fromPaqueteria, negocios] = await Promise.all([
        getPendingFromRestaurants(id_repartidor),
        getPendingFromPaqueteria(id_repartidor),
        httpGet(`${NEGOCIOS_URL}/orders/delivery/${id_repartidor}/pending`, []),
    ]);

    const allOrders = [
        ...fromRestaurants,
        ...fromPaqueteria,
        ...(negocios.data || []).map((o) => ({ ...o, source: "negocio" })),
    ];

    if (allOrders.length === 0) {
        return [{
            order_code: "PED-MOCK-001",
            status:     "pendiente",
            business:   "Farmacia Ejemplo",
            address:    "4a Calle 5-55 Zona 1",
            source:     "mock",
        }];
    }
    return allOrders;
}

async function cancelOrder(order_code, id_negocio, reason) {
    const order_id = extractOrderId(order_code);

    // 1. Intentar cancelar en restaurantes
    if (order_id && RESTAURANTS_URL !== "http://localhost:3002") {
        const result = await cancelOrderInRestaurants(order_id, reason);
        if (result) return result;
    }

    // 2. Intentar cancelar en negocios
    const negocioResult = await httpPost(
        `${NEGOCIOS_URL}/orders/${order_code}/cancel`,
        { id_negocio, reason },
        null
    );
    if (negocioResult.success && negocioResult.data) return negocioResult.data;

    return {
        cancelled: false,
        message: "No se pudo cancelar el pedido en este momento",
    };
}

export { getOrderByCode, getPendingOrdersByDelivery, cancelOrder };