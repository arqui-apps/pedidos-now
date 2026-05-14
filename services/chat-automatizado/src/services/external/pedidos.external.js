import { httpGet, httpPost } from "./httpHelper.js";

const RESTAURANTS_URL =
    process.env.RESTAURANTS_SERVICE_URL || "http://localhost:3002";
const NEGOCIOS_URL =
    process.env.NEGOCIOS_SERVICE_URL || "http://localhost:3003";
const PAQUETERIA_URL =
    process.env.PAQUETERIA_SERVICE_URL || "http://localhost:3007";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extrae el ID numérico de un código de pedido.
 * "PED-001" → 1 | "PED-42" → 42 | "42" → 42
 */
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

/**
 * Obtiene la lista de restaurantes activos desde la API.
 * La API devuelve { success: true, data: [...] }
 */
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

/**
 * Normaliza la respuesta de restaurantes al formato que espera el bot.
 * Estados: 1=Recibido, 2=Confirmado, 3=En Preparacion,
 *          4=Listo, 5=En Camino, 6=Entregado, 7=Cancelado
 */
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
            const nombre =
                d.producto?.nombre || d.combo?.nombre || "Producto";
            return `${nombre} x${d.cantidad}`;
        }) || [];

    return {
        order_code: `PED-${pedido.id}`,
        id: pedido.id,
        restaurante_id: pedido.restaurante_id,
        status: estadoMap[pedido.estado_id] || "desconocido",
        business: restauranteName,
        items,
        total: parseFloat(pedido.total) || 0,
        direccion_entrega: pedido.direccion_entrega || "",
        notas: pedido.notas || null,
        estimated_delivery: pedido.estado_id <= 4 ? "30 minutos" : null,
        source: "restaurante",
    };
}

// ─── Buscar pedido en todos los restaurantes ──────────────────────────────────

/**
 * Busca un pedido por ID en todos los restaurantes en paralelo.
 * La API de restaurantes requiere: GET /restaurantes/:restaurante_id/pedidos/:id
 * No tiene búsqueda global por código, por eso consultamos todos.
 */
async function findOrderInRestaurants(order_id) {
    const restaurantes = await getRestaurantList();
    if (!restaurantes.length) return null;

    const resultados = await Promise.all(
        restaurantes.map(async (restaurante) => {
            const { success: ok, data: respuestaPedido } = await httpGet(
                `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos/${order_id}`,
                null
            );

            // La API devuelve { success: true, data: { id, ... } }
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

// ─── Cancelar pedido en restaurante ──────────────────────────────────────────

/**
 * Busca en qué restaurante está el pedido y lo cancela.
 * Ruta: POST /restaurantes/:restaurante_id/pedidos/:pedido_id/cancelacion/cancelar
 * Body requerido: { cancelado_por, motivo }
 * cancelado_por: 'cliente' | 'restaurante' | 'repartidor' | 'sistema'
 */
async function cancelOrderInRestaurants(order_id, reason) {
    const restaurantes = await getRestaurantList();
    if (!restaurantes.length) return null;

    for (const restaurante of restaurantes) {
        // Verificar si el pedido existe en este restaurante
        const { success: exists, data: respuestaPedido } = await httpGet(
            `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos/${order_id}`,
            null
        );

        const pedido =
            respuestaPedido?.data?.data ||
            respuestaPedido?.data ||
            respuestaPedido;

        if (!exists || !pedido?.id) continue;

        // Verificar que el pedido pueda cancelarse
        if (pedido.estado_id === 7) {
            return { cancelled: false, message: "El pedido ya fue cancelado" };
        }
        if (pedido.estado_id === 6) {
            return {
                cancelled: false,
                message: "No se puede cancelar un pedido ya entregado",
            };
        }

        // Cancelar el pedido
        const { success: ok, data: resultado } = await httpPost(
            `${RESTAURANTS_URL}/restaurantes/${restaurante.id}/pedidos/${order_id}/cancelacion/cancelar`,
            {
                cancelado_por: "cliente",
                motivo:
                    reason ||
                    "Cancelado por el cliente a través del chat automatizado",
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

/**
 * Busca pedidos en estado "En Camino" (estado_id=5) del repartidor
 * en todos los restaurantes.
 */
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

// ─── Funciones públicas ───────────────────────────────────────────────────────

async function getOrderByCode(order_code) {
    const order_id = extractOrderId(order_code);

    // 1. Buscar en restaurantes (si la URL está configurada)
    if (order_id && RESTAURANTS_URL !== "http://localhost:3002") {
        const fromRestaurant = await findOrderInRestaurants(order_id);
        if (fromRestaurant) return fromRestaurant;
    }

    // 2. Buscar en negocios
    const negocios = await httpGet(
        `${NEGOCIOS_URL}/orders/${order_code}`,
        null
    );
    if (negocios.success && negocios.data)
        return { ...negocios.data, source: "negocio" };

    // 3. Buscar en paquetería
    const paqueteria = await httpGet(
        `${PAQUETERIA_URL}/packages/${order_id || order_code}`,
        null
    );
    if (paqueteria.success && paqueteria.data)
        return { ...paqueteria.data, source: "paqueteria" };

    console.warn(
        `[Pedidos] Ningún servicio encontró el pedido: ${order_code}`
    );
    return buildMockOrder(order_code);
}

async function getPendingOrdersByDelivery(id_repartidor) {
    const [fromRestaurants, negocios] = await Promise.all([
        getPendingFromRestaurants(id_repartidor),
        httpGet(
            `${NEGOCIOS_URL}/orders/delivery/${id_repartidor}/pending`,
            []
        ),
    ]);

    const allOrders = [
        ...fromRestaurants,
        ...(negocios.data || []).map((o) => ({ ...o, source: "negocio" })),
    ];

    if (allOrders.length === 0) {
        return [
            {
                order_code: "PED-MOCK-001",
                status: "pendiente",
                business: "Farmacia Ejemplo",
                address: "4a Calle 5-55 Zona 1",
                source: "mock",
            },
        ];
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
    if (negocioResult.success && negocioResult.data)
        return negocioResult.data;

    return {
        cancelled: false,
        message: "No se pudo cancelar el pedido en este momento",
    };
}

export { getOrderByCode, getPendingOrdersByDelivery, cancelOrder };