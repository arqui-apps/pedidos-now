const { sequelize } = require('../config/db');
const repo = require('../repositories/compensacion.repository');
const movRepo = require('../repositories/movimiento.repository');
const auditoriaRepo = require('../repositories/auditoria.repository');

const registrarCompensacion = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        const cuenta_id = 1;

        // Verificar saldo
        const saldo = await sequelize.query(
            'SELECT saldo FROM cuenta_fondo WHERE id = :cuenta_id',
            {
                replacements: { cuenta_id },
                type: sequelize.QueryTypes.SELECT,
                transaction
            }
        );

        if (!saldo || saldo.length === 0) {
            throw new Error('Cuenta no existe');
        }

        if (saldo[0].saldo < data.monto) {
            throw new Error('Fondos insuficientes');
        }

        // Verificar que entidad comercial existe
        const entidad = await sequelize.query(
            'SELECT id FROM entidad_comercial WHERE id = :entidad_id',
            {
                replacements: { entidad_id: data.entidad_id },
                type: sequelize.QueryTypes.SELECT,
                transaction
            }
        );

        if (!entidad || entidad.length === 0) {
            throw new Error('Entidad comercial no existe');
        }

        // Crear compensación
        const compensacionId = await repo.crearCompensacion(data, transaction);

        // Registrar egreso financiero
        const movimientoId = await movRepo.crearEgreso(
            {
                cuenta_id,
                subtipo: 'compensacion',
                referencia_id: data.entidad_id,
                monto: data.monto,
                descripcion: data.motivo
            },
            transaction
        );

        // Restar saldo
        await movRepo.restarSaldo(cuenta_id, data.monto, transaction);

        // Auditoría
        await auditoriaRepo.registrarLog({
            accion: 'COMPENSACION',
            descripcion: `Compensación a entidad ${data.entidad_id}`,
            monto: data.monto
        }, transaction);

        await transaction.commit();

        return {
            ok: true,
            compensacion_id: compensacionId,
            movimiento_id: movimientoId
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    registrarCompensacion
};