const reembolsoRepo = require('../repositories/reembolso.repository');
const movRepo = require('../repositories/movimiento.repository');
const bancoClient = require('../integrations/banco-client');
const { sequelize } = require('../config/db');

// ========== CREAR REEMBOLSO ==========

const crearReembolso = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        if (!data.cliente_id || !data.pedido_id || !data.monto || !data.razon || !data.tipo) {
            throw new Error('Datos insuficientes para crear reembolso');
        }

        if (data.monto <= 0) {
            throw new Error('Monto debe ser mayor a 0');
        }

        // Crear reembolso en estado PENDIENTE
        const reembolso = await reembolsoRepo.crearReembolso(
            {
                cliente_id: data.cliente_id,
                pedido_id: data.pedido_id,
                monto: data.monto,
                razon: data.razon,
                tipo: data.tipo,
                estado: 'pendiente'
            },
            transaction
        );

        await transaction.commit();

        return {
            ok: true,
            reembolso_id: reembolso.id,
            cliente_id: data.cliente_id,
            monto: data.monto,
            estado: 'pendiente',
            razon: data.razon
        };

    } catch (error) {
        if (transaction && !transaction.finished) {
            if (!transaction.finished) {
                await transaction.rollback();
            };
        }

        throw error;
    }
};

// ========== PROCESAR REEMBOLSO ==========

const procesarReembolso = async (reembolso_id, medio_pago) => {

    const transaction = await sequelize.transaction();

    try {

        const reembolso =
            await reembolsoRepo.obtenerReembolsoPorId(
                reembolso_id
            );

        if (!reembolso) {
            throw new Error('Reembolso no encontrado');
        }

        if (reembolso.estado !== 'pendiente') {
            throw new Error(
                `Reembolso ya ha sido ${reembolso.estado}`
            );
        }

        const cuenta_id = 2;

        // ================= VERIFICAR SALDO =================

        const saldo = await sequelize.query(
            'SELECT saldo FROM cuenta_fondo WHERE id = :cuenta_id',
            {
                replacements: { cuenta_id },
                type: sequelize.QueryTypes.SELECT,
                transaction
            }
        );

        console.log(
            '[ReembolsoService] SALDO CUENTA:',
            saldo
        );

        if (!saldo || saldo.length === 0) {
            throw new Error('Cuenta no existe');
        }

        if (Number(saldo[0].saldo) < Number(reembolso.monto)) {
            throw new Error(
                'Fondos insuficientes para procesar reembolso'
            );
        }

        // ================= VALIDACIÓN BANCARIA =================

        let validacionBanco = null;

        if (medio_pago === 'tarjeta') {

            const cuentasCliente =
            await bancoClient.obtenerCuentasPorAsociado(
                1
            );

            if (
                !cuentasCliente ||
                cuentasCliente.length === 0
            ) {
                throw new Error(
                    'Cliente no tiene cuentas bancarias'
                );
            }

            validacionBanco = cuentasCliente;
        }

        // ================= DEPÓSITO BANCARIO =================
        let transferenciaBanco = null;

        if (medio_pago === 'tarjeta') {

            const cuentaDestino =
                validacionBanco[0];

            transferenciaBanco =
                await bancoClient.realizarTransferencia({

                    source_account_id:
                        process.env.EMPRESA_ACCOUNT_ID,

                    destination_account_id:
                        cuentaDestino.account_number,

                    amount:
                        Number(reembolso.monto),

                    description:
                        `Reembolso pedido ${reembolso.pedido_id}`
                });

            console.log(
                '[ReembolsoService] Transferencia completada:',
                transferenciaBanco
            );
        }

        // ================= REGISTRAR EGRESO =================

        await movRepo.crearEgreso({
            cuenta_id,
            subtipo: 'reembolso',
            referencia_id: reembolso.cliente_id,
            monto: reembolso.monto,
            descripcion:
                `Reembolso a cliente ${reembolso.cliente_id}`,
            saldo_anterior: saldo[0].saldo,
            saldo_posterior:
                saldo[0].saldo - reembolso.monto
        }, transaction);

        // ================= ACTUALIZAR SALDO =================

        await movRepo.restarSaldo(
            cuenta_id,
            reembolso.monto,
            transaction
        );

        // ================= ACTUALIZAR ESTADO =================

        await reembolsoRepo.actualizarEstado(
            reembolso_id,
            'procesado',
            transaction
        );

        await transaction.commit();

        return {
            ok: true,
            reembolso_id,
            estado: 'procesado',
            monto: reembolso.monto,
            medio_pago,
            transferencia_bancaria:
                transferenciaBanco
        };

    } catch (error) {

        if (!transaction.finished) {
            await transaction.rollback();
        };

        throw error;
    }
};

// ========== RECHAZAR REEMBOLSO ==========

const rechazarReembolso = async (reembolso_id, razon) => {
    const transaction = await sequelize.transaction();

    try {
        const reembolso = await reembolsoRepo.obtenerReembolsoPorId(reembolso_id);
        
        if (!reembolso) {
            throw new Error('Reembolso no encontrado');
        }

        if (reembolso.estado !== 'pendiente') {
            throw new Error(`No se puede rechazar un reembolso en estado ${reembolso.estado}`);
        }

        await reembolsoRepo.actualizarEstado(
            reembolso_id,
            'rechazado',
            transaction
        );

        await transaction.commit();

        return {
            ok: true,
            reembolso_id,
            estado: 'rechazado',
            razon
        };

    } catch (error) {
        if (!transaction.finished) {
            await transaction.rollback();
        };
        throw error;
    }
};

// ========== OBTENER REEMBOLSOS ==========

const obtenerReembolsos = async (filtros = {}) => {
    return await reembolsoRepo.obtenerReembolsos(filtros);
};

// ========== OBTENER REEMBOLSO POR ID ==========

const obtenerReembolsoPorId = async (id) => {
    return await reembolsoRepo.obtenerReembolsoPorId(id);
};

// ========== OBTENER TOTAL REEMBOLSOS ==========

const obtenerTotalReembolsos = async (filtros = {}) => {
    return await reembolsoRepo.obtenerTotalReembolsos(filtros);
};

module.exports = {
    crearReembolso,
    procesarReembolso,
    rechazarReembolso,
    obtenerReembolsos,
    obtenerReembolsoPorId,
    obtenerTotalReembolsos
};