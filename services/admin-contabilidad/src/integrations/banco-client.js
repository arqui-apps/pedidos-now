const axios = require('axios');
const CircuitBreaker = require('../utils/circuit-breaker');

const BANCO_SERVICE_URL = process.env.SISTEMA_BANCARIO_URL || 'https://basilinux.online';

let bancoCaller;
const circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000
});

try {
    bancoCaller = axios.create({
        baseURL: BANCO_SERVICE_URL,
        timeout: 5000
    });

    bancoCaller.interceptors.request.use(config => {
        config.headers = config.headers || {};

        if (global.bankToken) {

            config.headers.Authorization =
                `Bearer ${global.bankToken}`;

            console.log(
                '[BancoClient] AUTH HEADER SET'
            );
        }

        console.log(
            '[BancoClient] URL:',
            config.url
        );

        console.log(
            '[BancoClient] HEADERS FINALES:',
            config.headers
        );

        return config;
    });

    bancoCaller.interceptors.response.use(
        response => response,
        error => {
            console.error(`[BancoClient] Error: ${error.message}`);
            throw error;
        }
    );

} catch (error) {
    console.warn('[BancoClient] No disponible en tests o entorno sin conexión');
}

// ========== BANCOS ==========

const obtenerBancos = async () => {
    try {
        const response = await circuitBreaker.execute(() =>
            bancoCaller.get('/api/banks')
        );
        return response.data;
    } catch (error) {
        throw new Error(`Error obteniendo bancos: ${error.message}`);
    }
};

// ========== CUENTAS BANCARIAS ==========

const crearCuenta = async (data) => {
    try {
        if (!data.type || data.associate_id === undefined) {
            throw new Error('Datos incompletos: type, associate_id requeridos');
        }

        const payload = {
            type: data.type,
            associate_id: data.associate_id,
            available_balance: data.available_balance || 0,
            reserve_balance: data.reserve_balance || 0
        };

        const response = await circuitBreaker.execute(() =>
            bancoCaller.post('/api/accounts', payload)
        );
        
        if (!response.data || !response.data.account_number) {
            throw new Error('Respuesta inválida: cuenta sin account_number');
        }

        return response.data;
    } catch (error) {
        if (error.message.includes('Circuit breaker')) {
            throw error;
        }
        throw new Error(`Error creando cuenta: ${error.message}`);
    }
};

const obtenerCuentasPorAsociado = async (associate_id) => {
    try {
        if (!associate_id) {
            throw new Error('associate_id requerido');
        }

        // El endpoint GET /api/accounts no filtra por asociado, necesitamos obtener todas
        // y filtrar localmente, O usar GET /api/associates/:id que incluye Accounts
        const response = await circuitBreaker.execute(() =>
            bancoCaller.get(`/api/associates/${associate_id}`)
        );

        if (!response.data) {
            throw new Error('Respuesta vacía del servidor');
        }

        console.log(
            '[BancoClient] RESPONSE ASSOCIADO COMPLETA:'
        );

        console.log(
            JSON.stringify(
                response.data,
                null,
                2
            )
        );

        const cuentas =
            response.data.Accounts || [];
        
        console.log(
            '[BancoClient] CUENTAS OBTENIDAS:'
        );

        console.log(
            JSON.stringify(
                cuentas,
                null,
                2
            )
        );
        
        if (!Array.isArray(cuentas)) {
            throw new Error('Respuesta inválida: Accounts no es un array');
        }

        return cuentas;
    } catch (error) {
        if (error.message.includes('Circuit breaker')) {
            throw error;
        }
        if (error.response?.status === 404) {
            return [];
        }
        throw new Error(`Error obteniendo cuentas del asociado: ${error.message}`);
    }
};

const obtenerCuentaPorNumero = async (account_number) => {
    try {
        if (!account_number) {
            throw new Error('account_number requerido');
        }

        const response = await circuitBreaker.execute(() =>
            bancoCaller.get(`/api/accounts/${account_number}`)
        );

        if (!response.data) {
            throw new Error('Respuesta vacía del servidor');
        }

        if (!response.data.account_number) {
            throw new Error('Respuesta inválida: sin account_number');
        }

        return response.data;

    } catch (error) {
        if (error.message.includes('Circuit breaker')) {
            throw error;
        }
        if (error.response?.status === 404) {
            throw new Error(`Cuenta ${account_number} no encontrada en el sistema bancario`);
        }
        throw new Error(`Error obteniendo cuenta: ${error.message}`);
    }
};

// ========== TARJETAS ==========
const obtenerTarjetas = async (account_number) => {
    try {
        if (!account_number) {
            throw new Error('account_number requerido');
        }

        const response = await circuitBreaker.execute(() =>
            bancoCaller.get(`/api/accounts/${account_number}`)
        );

        const tarjetas = response.data.Cards || [];

        if (!Array.isArray(tarjetas)) {
            throw new Error('Respuesta inválida: Cards no es array');
        }

        return tarjetas;

    } catch (error) {
        if (error.message.includes('Circuit breaker')) {
            throw error;
        }
        if (error.response?.status === 404) {
            return [];
        }
        throw new Error(`Error obteniendo tarjetas: ${error.message}`);
    }
};

const validarTarjeta = async (data) => {
    if (!global.bankToken) {
        console.log('[BancoClient] Token no encontrado. Haciendo login...');
        await loginBanco();
    }

    try {
        if (!data.card_number || !data.cvv) {
            throw new Error('card_number y cvv requeridos');
        }

        console.log(
            '[BancoClient] VALIDATE PAYLOAD:',
            data
        );

        console.log(
            '[BancoClient] TOKEN:',
            global.bankToken
        );

        const response = await circuitBreaker.execute(() =>
            bancoCaller.post('/api/cards/validate', data)
        );

        if (!response.data) {
            throw new Error('Respuesta vacía');
        }

        return response.data;

    } catch (error) {
        if (error.message.includes('Circuit breaker')) {
            throw error;
        }

        console.log(
            '[BancoClient] VALIDATE ERROR:',
            error.response?.data
        );

    if (error.response?.status === 401) {

        console.log('[BancoClient] Token expirado. Reintentando login...');

        await loginBanco();

        return await validarTarjeta(data);
    }

        throw new Error(`Error validando tarjeta: ${error.message}`);
    }
};

// ========== CONSULTAR SALDO ==========
const consultarSaldo = async (account_number) => {
    try {
        if (!account_number) {
            throw new Error('account_number requerido');
        }

        const response = await circuitBreaker.execute(() =>
            bancoCaller.get(`/api/accounts/${account_number}`)
        );

        if (!response.data) {
            throw new Error('Respuesta vacía del servidor');
        }

        const saldoDisponible = response.data.available_balance || 0;
        
        if (saldoDisponible === undefined) {
            throw new Error('Respuesta no contiene saldo disponible');
        }

        return {
            account_number: response.data.account_number,
            saldo_total: saldoDisponible,
            available_balance: saldoDisponible,
            reserve_balance: response.data.reserve_balance || 0,
            moneda: 'USD',
            estado: response.data.status || 'activa'
        };

    } catch (error) {
        if (error.message.includes('Circuit breaker')) {
            throw error;
        }

        if (error.code === 'ECONNREFUSED') {
            throw new Error('Servicio bancario no disponible (conexión rechazada)');
        }
        else if (error.code === 'ECONNABORTED') {
            throw new Error('Timeout: servicio bancario tardó demasiado en responder');
        }
        else if (error.response?.status === 404) {
            throw new Error(`Cuenta ${account_number} no encontrada en el sistema bancario`);
        }
        else if (error.response?.status === 400) {
            throw new Error(`Solicitud inválida: ${error.response.data?.error || 'error desconocido'}`);
        }
        else if (error.response?.status === 401) {
            throw new Error('No autorizado para consultar saldo');
        }
        else if (error.response?.status >= 500) {
            throw new Error('Error del servidor bancario');
        }

        throw new Error(`Error consultando saldo: ${error.message}`);
    }
};

// ========== TOKENIZACIÓN DE TARJETA ==========
const tokenizarTarjeta = async (data) => {
    if (!global.bankToken) {
        console.log('[BancoClient] Token no encontrado. Haciendo login...');
        await loginBanco();
    }

    try {
        if (!data.card_number || !data.cvv) {
            throw new Error('card_number y cvv requeridos para tokenizar');
        }

        const response = await circuitBreaker.execute(() =>
            bancoCaller.post('/api/transactions/tokenize', data)
        );

        if (!response.data || !response.data.token) {
            throw new Error('Respuesta inválida: sin token');
        }

        return response.data;

    } catch (error) {
        if (error.message.includes('Circuit breaker')) {
            throw error;
        }
        throw new Error(`Error tokenizando tarjeta: ${error.message}`);
    }
};

// ========== TRANSACCIONES / COBROS (CORE) ==========
const realizarCobro = async (data) => {
    if (!global.bankToken) {
        console.log('[BancoClient] Token no encontrado. Haciendo login...');
        await loginBanco();
    }

    try {
        if (
            !data.token || 
            !data.destination_account_id || 
            (!data.amount && !data.monto && !data.monto_total)) {
            throw new Error('token, destination_account_id, amount requeridos');
        }

        const montoNormalizado = 
            data.amount ??
            data.monto ??
            data.monto_total;

        if (typeof montoNormalizado !== 'number' || montoNormalizado <= 0) {
            throw new Error('Monto debe ser número > 0');
        }

        const payload = {
            token: data.token,
            destination_account_id: data.destination_account_id,
            amount: parseFloat(montoNormalizado.toFixed(2)),
            description: data.description || 'Cobro desde Admin-Contabilidad'
        };

        console.log(`[BancoClient] Iniciando cobro: ${payload.amount} → cuenta ${payload.destination_account_id}`);

        const response = await circuitBreaker.execute(() =>
            bancoCaller.post('/api/transactions/charge', payload)
        );

        if (!response.data) {
            throw new Error('Respuesta vacía');
        }

        if (response.data.status !== 'COMPLETADA') {
            throw new Error(`Cobro no completado. Estado: ${response.data.status}`);
        }

        console.log(`[BancoClient] Cobro exitoso: transacción ${response.data.transaction_id}`);

        return {
            id: response.data.transaction_id,
            destination_account_id: data.destination_account_id,
            amount: response.data.amount,
            status: response.data.status,
            fecha: new Date().toISOString(),
            description: payload.description
        };

    } catch (error) {
        console.error(`[BancoClient] Error en cobro: ${error.message}`);

        if (error.message.includes('Circuit breaker')) {
            throw error;
        }

        if (error.code === 'ECONNREFUSED') {
            throw new Error('Servicio bancario no disponible');
        }
        else if (error.response?.status === 402) {
            throw new Error('Saldo insuficiente en tarjeta');
        }
        else if (error.response?.status === 400) {
            throw new Error(`Error en cobro: ${error.response.data?.message || 'error desconocido'}`);
        }

        throw new Error(`Error realizando cobro: ${error.message}`);
    }
};

// ========== DEPÓSITOS ==========

const realizarDeposito = async (data) => {
    if (!global.bankToken) {

        console.log(
            '[BancoClient] Token no encontrado. Haciendo login...'
        );

        await loginBanco();
    }

    try {
        if (!data.account_id || !data.amount) {
            throw new Error('account_id y amount requeridos');
        }

        const payload = {
            account_id: data.account_id,
            amount: parseFloat(data.amount.toFixed(2)),
            description: data.description || 'Depósito'
        };

        const response = await circuitBreaker.execute(() =>
            bancoCaller.post('/api/transactions/deposit', payload)
        );

        if (!response.data || response.data.status !== 'COMPLETADA') {
            throw new Error('Depósito no completado');
        }

        return response.data;

    } catch (error) {
        if (error.message.includes('Circuit breaker')) {
            throw error;
        }

        if (error.response?.status === 401) {

            console.log(
                '[BancoClient] Token expirado. Reintentando login...'
            );

            await loginBanco();

            return await realizarDeposito(data);
        }
        throw new Error(`Error realizando depósito: ${error.message}`);
    }
};

// ========== TRANSFERENCIAS ==========

const realizarTransferencia = async (data) => {
    try {
        if (!global.bankToken) {
            console.log('[BancoClient] Token no encontrado. Haciendo login...');
            await loginBanco();
        }

        if (!data.source_account_id || 
            !data.destination_account_id || 
            (!data.amount && !data.monto && !data.monto_total)) {
            throw new Error('source_account_id, destination_account_id, amount requeridos');
        }

        const montoNormalizado = 
            data.amount ??
            data.monto ?? 
            data.monto_total;
        
        if (typeof montoNormalizado !== 'number' || montoNormalizado <= 0) {
            throw new Error('Monto debe ser número > 0');
        }

        const payload = {
            source_account_id: data.source_account_id,
            destination_account_id: data.destination_account_id,
            amount: parseFloat(montoNormalizado.toFixed(2)),
            description: data.description || 'Transferencia desde Admin-Contabilidad'
        };

        console.log(`[BancoClient] Transferencia: ${payload.source_account_id} → ${payload.destination_account_id}, monto: ${payload.amount}`);

        const response = await circuitBreaker.execute(() =>
            bancoCaller.post('/api/transfers', payload)
        );

        if (!response.data) {
            throw new Error('Respuesta vacía');
        }

        console.log(`[BancoClient] Transferencia iniciada: ${response.data.data?.transfer_id}`);

        return {
            id: response.data.data?.transfer_id,
            source_account_id: data.source_account_id,
            destination_account_id: data.destination_account_id,
            amount: payload.amount,
            status: response.data.status,
            description: payload.description,
            isACH: response.data.data?.isACH || false
        };

    } catch (error) {
        console.error(`[BancoClient] Error en transferencia: ${error.message}`);

        if (error.message.includes('Circuit breaker')) {
            throw error;
        }

        if (error.code === 'ECONNREFUSED') {
            throw new Error('Servicio bancario no disponible');
        }
        else if (error.response?.status === 402) {
            throw new Error('Saldo insuficiente');
        }

        if (error.response?.status === 401) {
            console.log('[BancoClient] Token expirado. Reintentando login...');

            await loginBanco();

            return await realizarTransferencia(data);
        }

        throw new Error(`Error realizando transferencia: ${error.message}`);
    }
};

// ========== HISTORIAL ==========

const obtenerHistorial = async (account_number) => {
    try {
        if (!account_number) {
            throw new Error('account_number requerido');
        }

        const response = await circuitBreaker.execute(() =>
            bancoCaller.get(`/api/transactions/by-account/${account_number}`)
        );

        if (!Array.isArray(response.data)) {
            return [];
        }

        return response.data;

    } catch (error) {
        if (error.response?.status === 404) {
            return [];
        }
        throw new Error(`Error obteniendo historial: ${error.message}`);
    }
};

// ========== ESTADO DEL CIRCUIT BREAKER ==========

const getCircuitBreakerStatus = () => {
    return circuitBreaker.getState();
};

// ========== LOGIN BANCOS =========
const loginBanco = async () => {

    console.log('[BancoClient] Ejecutando login bancario...');

    console.log(
        '[BancoClient] Usuario:',
        process.env.BANK_USER
    );

    const response = await bancoCaller.post(
        '/api/associates/login',
        {
            user: process.env.BANK_USER,
            password: process.env.BANK_PASSWORD
        }
    );

    console.log(
        '[BancoClient] LOGIN RESPONSE COMPLETA:'
    );

    console.log(
        JSON.stringify(
            response.data,
            null,
            2
        )
    );

    global.bankToken = response.data.token.token;

    bancoCaller.defaults.headers.common[
        'Authorization'
    ] = `Bearer ${global.bankToken}`;

    console.log(
        '[BancoClient] TOKEN GUARDADO:',
        global.bankToken
    );

    return global.bankToken;
};

const verificarDisponibilidad = async () => {
    try {

        const inicio = Date.now();

        await bancoCaller.get('/api/banks');

        const fin = Date.now();

        return {
            disponible: true,
            estado: 'ONLINE',
            latencia_ms: fin - inicio
        };

    } catch (error) {

        return {
            disponible: false,
            estado: 'OFFLINE',
            razon: error.message
        };
    }
};

// ========== EXPORTAR ==========

module.exports = {
    obtenerBancos,
    crearCuenta,
    obtenerCuentasPorAsociado,
    obtenerCuentaPorNumero,
    obtenerTarjetas,
    validarTarjeta,
    consultarSaldo,
    tokenizarTarjeta,
    realizarCobro,
    realizarDeposito,
    realizarTransferencia,
    obtenerHistorial,
    getCircuitBreakerStatus,
    loginBanco,
    verificarDisponibilidad
};