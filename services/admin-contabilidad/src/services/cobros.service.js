const cobrosRepo = require('../repositories/cobros.repository');
const movimientoRepo = require('../repositories/movimiento.repository');
const bancoClient = require('../integrations/banco-client');
const CobroStateMachine = require('../utils/cobro-state-machine');
const { sequelize } = require('../config/db');
const cobrosClient = require('../integrations/cobros-client');

const stateMachine = new CobroStateMachine();

// ========== PROCESAR COBRO (INTEGRACIÓN REAL CON BANCO) ==========

const procesarCobro = async (data) => {
    const idempotencyKey = data.idempotency_key;

    if (!idempotencyKey) {
        throw new Error('idempotency_key requerida');
    }

    const existente = await cobrosRepo.obtenerCobroPorIdempotencyKey(idempotencyKey);

    if (existente) {
        return {
            ok: true,
            cobro_id: existente.id,
            estado: existente.estado
        };
    }

    const transaction = await sequelize.transaction();

    try {
        // 1. VALIDAR DATOS BÁSICOS
        if (!data.cliente_id || !data.pedido_id || !data.monto_total) {
            throw new Error('Datos insuficientes para procesar cobro');
        }

        if (!data.cliente_id) {
            throw new Error('cliente_id no definido (verificar integración con JWT)');
        }

        if (data.monto_total <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }

        const tiposValidos = ['efectivo', 'tarjeta', 'cupon'];
        if (!tiposValidos.includes(data.tipo_pago)) {
            throw new Error(`Tipo de pago inválido: ${data.tipo_pago}`);
        }

        // Estado inicial: pendiente
        let estadoActual = 'pendiente';

        const tarifa_servicio = data.tarifa_servicio || (data.monto_total * 0.08);
        const monto_final = data.monto_total + tarifa_servicio + (data.propina || 0);

        let cobro_realizado = false;
        let source_account_id = null;
        let transferencia_bancaria = null;
        let numero_transaccion = null;

        // 2. TRANSICIÓN A PROCESANDO
        estadoActual = stateMachine.transition(estadoActual, 'procesando');

// 3. PROCESAR SEGÚN TIPO DE PAGO

// ===============================
// PAGO CON TARJETA
// ===============================

if (data.tipo_pago === 'tarjeta') {

    console.log('[CobrosService] Validando tarjeta...');

    const validacion =
        await bancoClient.validarTarjeta({
            card_number: data.card_number,
            cvv: data.cvv
        });

    console.log(
        '[CobrosService] Tarjeta válida:',
        validacion
    );

    console.log('[CobrosService] Tokenizando tarjeta...');

    const tokenizacion =
        await bancoClient.tokenizarTarjeta({
            card_number: data.card_number,
            cvv: data.cvv
        });

    console.log(
        '[CobrosService] Token generado'
    );

    console.log('[CobrosService] Realizando cobro bancario...');

    const cobroBanco =
        await bancoClient.realizarCobro({
            token: tokenizacion.token,
            destination_account_id:
                process.env.EMPRESA_ACCOUNT_ID,
            amount: monto_final,
            description:
                `Pedido #${data.pedido_id}`
        });

    console.log(
        '[CobrosService] Cobro bancario exitoso:',
        cobroBanco
    );

    numero_transaccion =
        cobroBanco.id;

    transferencia_bancaria =
        cobroBanco;
}

// ===============================
// COBROS API (lógica financiera)
// ===============================

console.log(
    '[CobrosService] Enviando cobro a API externa...'
);

const cobroExterno =
    await cobrosClient.procesarCobro(data);

console.log(
    '[CobrosService] Respuesta Cobros:',
    JSON.stringify(cobroExterno, null, 2)
);

cobro_realizado = true;

estadoActual =
    stateMachine.transition(
        estadoActual,
        'completado'
    );

// Si banco no devolvió transacción,
// usar payment_id de Cobros API

if (!numero_transaccion) {

    numero_transaccion =
        cobroExterno?.result?.payment_id ||
        cobroExterno?.payment_id ||
        null;
}

        // 4. CREAR REGISTRO DE COBRO
        const cobro = await cobrosRepo.crearCobro(
            {
            idempotency_key: idempotencyKey,
            cliente_id: data.cliente_id,
            pedido_id: data.pedido_id,
            monto_total: data.monto_total,
            tarifa_servicio,
            propina: data.propina || 0,
            tipo_pago: data.tipo_pago,
            repartidor_id: data.repartidor_id,
            cupon_id: data.cupon_id || null,
            estado: estadoActual,

            numero_transaccion:
                numero_transaccion || null,

            estado_reconciliacion:
                'reconciliado',

            payment_id_cobros:
                cobroExterno?.result?.payment_id ||
                cobroExterno?.payment_id ||
                null,

            transaction_id_banco:
                transferencia_bancaria?.id ||
                numero_transaccion ||
                null,

            ultimo_error_externo:
                null,

            reconciliado:
                true
        },
            transaction
        );

        console.log(`[CobrosService] Cobro registrado en BD: ${cobro.id}`);

        // 5. CREAR MOVIMIENTO FINANCIERO
        await movimientoRepo.crearMovimiento(
            {
                cuenta_id: 1,
                tipo: 'ingreso',
                subtipo: 'cobro_cliente',
                modulo_origen: 'cobros',
                referencia_id: data.cliente_id,
                monto: data.monto_total,
                descripcion: `Cobro de cliente #${data.cliente_id} - Pedido #${data.pedido_id} (${data.tipo_pago})`,
                pedido_id: data.pedido_id,
                repartidor_id: data.repartidor_id,
                estado: estadoActual,
                numero_transaccion,
                transaction_id_banco:
                transferencia_bancaria?.id ||
                    numero_transaccion,
                payment_id_cobros:
                    cobroExterno?.result?.payment_id ||
                    cobroExterno?.payment_id ||
                    null,
                idempotency_key:
                    idempotencyKey
            },
            transaction
        );

        console.log(`[CobrosService] Movimiento financiero registrado`);

        await transaction.commit();

        return {
            ok: true,
            cobro_id: cobro.id,
            monto_final,
            tarifa_servicio,
            tipo_pago: data.tipo_pago,
            estado: estadoActual,
            transferencia_id: transferencia_bancaria?.id || null,
            numero_transaccion: numero_transaccion || null,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('[CobrosService] ERROR COMPLETO:', {
            mensaje: error.message,
            stack: error.stack,
            data
        });

        if (error.code === '23505') {
            await transaction.rollback();

            const existente = await cobrosRepo.obtenerCobroPorIdempotencyKey(idempotencyKey);

            return {
                ok: true,
                cobro_id: existente.id,
                estado: existente.estado,
                mensaje: 'Recuperado tras duplicado concurrente'
            };
        }

        await transaction.rollback();

        try {
            await cobrosRepo.registrarIntentoDenegado({
                cliente_id: data.cliente_id,
                pedido_id: data.pedido_id,
                monto_intentado: data.monto_total,
                razon: error.message,
                tipo_pago: data.tipo_pago,
                repartidor_id: data.repartidor_id || null
            });
        } catch (err) {
            console.error('[CobrosService] Error registrando intento denegado:', err);
        }

        throw error;
    }
};

// ========== RESTO DEL ARCHIVO (SIN CAMBIOS) ==========

const cambiarEstadoCobro = async (cobro_id, nuevoEstado, razon = null) => {
    const transaction = await sequelize.transaction();

    try {
        const cobro = await cobrosRepo.obtenerCobroPorId(cobro_id);

        if (!cobro) throw new Error('Cobro no encontrado');

        const transicionValida = stateMachine.canTransition(cobro.estado, nuevoEstado);
        if (!transicionValida) {
            const validas = stateMachine.getValidTransitions(cobro.estado);
            throw new Error(`No se puede cambiar de ${cobro.estado} a ${nuevoEstado}. Estados válidos: ${validas.join(', ')}`);
        }

        await cobrosRepo.actualizarEstadoCobro(cobro_id, nuevoEstado, transaction);

        await transaction.commit();

        return { ok: true };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const cancelarCobro = async (cobro_id, razon) => {
    return await cambiarEstadoCobro(cobro_id, 'cancelado', razon);
};

const obtenerCobros = async (filtros = {}) => {
    return await cobrosRepo.obtenerCobros(filtros);
};

const obtenerCobroPorId = async (id) => {
    return await cobrosRepo.obtenerCobroPorId(id);
};

const obtenerCobrosPorRepartidor = async (repartidor_id) => {
    return await cobrosRepo.obtenerCobrosPorRepartidor(repartidor_id);
};

const obtenerSaldoRepartidor = async (repartidor_id) => {
    return await cobrosRepo.obtenerSaldoRepartidor(repartidor_id);
};

const obtenerEstadisticasCobros = async (inicio, fin) => {
    return await cobrosRepo.obtenerEstadisticasCobros(inicio, fin);
};

const obtenerEstadoBancario = async () => {
    try {
        const disponibilidad = await bancoClient.verificarDisponibilidad();
        const circuitBreakerStatus = bancoClient.getCircuitBreakerStatus();

        return {
            banco_disponible: disponibilidad.disponible,
            banco_estado: disponibilidad.estado,
            banco_razon: disponibilidad.razon || null,
            circuit_breaker_estado: circuitBreakerStatus.state,
            circuit_breaker_fallos: circuitBreakerStatus.failureCount,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            banco_disponible: false,
            banco_estado: 'ERROR',
            banco_razon: error.message,
            circuit_breaker_estado: 'UNKNOWN',
            timestamp: new Date().toISOString()
        };
    }
};

module.exports = {
    procesarCobro,
    obtenerCobros,
    obtenerCobroPorId,
    cancelarCobro,
    cambiarEstadoCobro,
    obtenerCobrosPorRepartidor,
    obtenerSaldoRepartidor,
    obtenerEstadisticasCobros,
    obtenerEstadoBancario
};