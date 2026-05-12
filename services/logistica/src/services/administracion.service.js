const { requestJson } = require('./http.service');
const config = require('../config/env');

const baseUrl = config.ADMINISTRACION_API_URL.replace(/\/$/, '');

const normalizarRepartidor = (repartidor) => ({
    ...repartidor,
    id_repartidor: repartidor.courierId || repartidor.id,
    nombre: [repartidor.firstName, repartidor.lastName].filter(Boolean).join(' ') || null,
    telefono: repartidor.phone || null,
    estado_operativo: repartidor.estado_operativo || repartidor.operationalStatus,
    modulo_activo: repartidor.modulo_activo || repartidor.activeModule,
    entrega_id: repartidor.entrega_id || repartidor.activeDeliveryId
});

const listarDisponibles = async () => {
    const url = `${baseUrl}/api/internal/couriers?available=true&module=${encodeURIComponent(config.LOGISTICA_MODULE_NAME)}`;
    const data = await requestJson(url);
    const repartidores = Array.isArray(data) ? data : data?.data || data?.couriers || [];

    return repartidores.map(normalizarRepartidor);
};

const obtenerPorId = async (repartidorId) => {
    const data = await requestJson(`${baseUrl}/api/internal/couriers/${repartidorId}`);
    return normalizarRepartidor(data?.data || data);
};

const marcarOcupado = async (repartidorId, entregaId) => {
    const data = await requestJson(`${baseUrl}/api/internal/couriers/${repartidorId}/status`, {
        method: 'PATCH',
        body: {
            estado_operativo: 'OCCUPIED',
            modulo_activo: config.LOGISTICA_MODULE_NAME,
            entrega_id: entregaId
        }
    });

    return normalizarRepartidor(data?.data || data);
};

const liberar = async (repartidorId) => {
    const data = await requestJson(`${baseUrl}/api/internal/couriers/${repartidorId}/status`, {
        method: 'PATCH',
        body: { estado_operativo: 'AVAILABLE' }
    });

    return normalizarRepartidor(data?.data || data);
};

const estaDisponible = (repartidor) => {
    const estado = repartidor.estado_operativo || repartidor.operationalStatus;
    const modulo = repartidor.modulo_activo || repartidor.activeModule;

    return repartidor.active !== false
        && repartidor.accountStatus === 'ACTIVE'
        && estado === 'AVAILABLE'
        && (!modulo || modulo === config.LOGISTICA_MODULE_NAME);
};

module.exports = {
    listarDisponibles,
    obtenerPorId,
    marcarOcupado,
    liberar,
    estaDisponible
};
