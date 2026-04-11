const { httpGet, httpPost } = require("./httpHelper");

// Por qué tres URLs separadas:
// Restaurantes, Negocios y Paquetería son tres microservicios distintos
// según el enunciado. Un pedido puede venir de cualquiera de los tres.
const RESTAURANTS_URL =
    process.env.RESTAURANTS_SERVICE_URL || "http://localhost:3002";
const NEGOCIOS_URL =
    process.env.NEGOCIOS_SERVICE_URL || "http://localhost:3003";
const PAQUETERIA_URL =
    process.env.PAQUETERIA_SERVICE_URL || "http://localhost:3004";

/**
 * Busca un pedido por código en los tres microservicios.
 *
 * Por qué buscar en los tres:
 * El usuario solo sabe su código de pedido, no sabe de qué
 * microservicio vino. Buscamos en los tres y retornamos el primero
 * que responda con datos.
 */
async function getOrderByCode(order_code) {
    // Buscamos en paralelo en los tres servicios para ser más rápidos
    const [restaurants, negocios, paqueteria] = await Promise.all([
        httpGet(
            `${RESTAURANTS_URL}/orders/${order_code}`,
            null
        ),
        httpGet(
            `${NEGOCIOS_URL}/orders/${order_code}`,
            null
        ),
        httpGet(
            `${PAQUETERIA_URL}/packages/${order_code}`,
            null
        ),
    ]);

    // Retornamos el primero que haya encontrado el pedido
    if (restaurants.success && restaurants.data) {
        return { ...restaurants.data, source: "restaurante" };
    }
    if (negocios.success && negocios.data) {
        return { ...negocios.data, source: "negocio" };
    }
    if (paqueteria.success && paqueteria.data) {
        return { ...paqueteria.data, source: "paqueteria" };
    }

    // Si ninguno respondió con datos, devolvemos mock
    console.warn(
        `[Pedidos] Ningún servicio encontró el pedido: ${order_code}`
    );

    // Mock para desarrollo
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

async function getPendingOrdersByDelivery(id_repartidor) {
    // Un repartidor puede tener pedidos de restaurantes Y negocios
    const [restaurants, negocios] = await Promise.all([
        httpGet(
            `${RESTAURANTS_URL}/orders/delivery/${id_repartidor}/pending`,
            []
        ),
        httpGet(
            `${NEGOCIOS_URL}/orders/delivery/${id_repartidor}/pending`,
            []
        ),
    ]);

    const restaurantOrders = restaurants.data || [];
    const negocioOrders = negocios.data || [];

    // Combinamos los pedidos de ambos servicios
    const allOrders = [
        ...restaurantOrders.map((o) => ({ ...o, source: "restaurante" })),
        ...negocioOrders.map((o) => ({ ...o, source: "negocio" })),
    ];

    if (allOrders.length === 0) {
        // Mock para desarrollo
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
    // Intentamos en restaurantes primero, luego en negocios
    let result = await httpPost(
        `${RESTAURANTS_URL}/orders/${order_code}/cancel`,
        { id_negocio, reason },
        null
    );

    if (!result.success || !result.data) {
        result = await httpPost(
            `${NEGOCIOS_URL}/orders/${order_code}/cancel`,
            { id_negocio, reason },
            null
        );
    }

    if (!result.success) {
        return {
            cancelled: false,
            message: "No se pudo cancelar el pedido en este momento",
        };
    }

    return result.data;
}

module.exports = {
    getOrderByCode,
    getPendingOrdersByDelivery,
    cancelOrder,
};