const movService = require('../services/movimiento.service');

// ========== CREAR MOVIMIENTO ==========

const crearMovimiento = async (req, res) => {
    try {

        const {
            cuenta_id,
            tipo,
            subtipo,
            monto,
            descripcion,
            referencia_id
        } = req.body;

        if (!cuenta_id || !tipo || !subtipo || !monto) {
            return res.status(400).json({
                ok: false,
                error:
                    'cuenta_id, tipo, subtipo y monto son requeridos'
            });
        }

        if (monto <= 0) {
            return res.status(400).json({
                ok: false,
                error: 'Monto debe ser mayor a 0'
            });
        }

        let movimiento;

        if (tipo === 'ingreso') {

            movimiento =
                await movService.crearIngreso({
                    cuenta_id,
                    subtipo,
                    monto,
                    descripcion: descripcion || null,
                    referencia_id: referencia_id || null
                });

        } else if (tipo === 'egreso') {

            movimiento =
                await movService.crearEgreso({
                    cuenta_id,
                    subtipo,
                    monto,
                    descripcion: descripcion || null,
                    referencia_id: referencia_id || null
                });

        } else {

            return res.status(400).json({
                ok: false,
                error:
                    'tipo debe ser "ingreso" o "egreso"'
            });
        }

        res.status(201).json({
            ok: true,
            movimiento
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            ok: false,
            error: error.message
        });
    }
};

// ========== OBTENER MOVIMIENTOS ==========

const obtenerMovimientos = async (req, res) => {
    try {

        const {
            cuenta_id,
            tipo,
            subtipo,
            inicio,
            fin
        } = req.query;

        const filtros = {};

        if (cuenta_id)
            filtros.cuenta_id = cuenta_id;

        if (tipo)
            filtros.tipo = tipo;

        if (subtipo)
            filtros.subtipo = subtipo;

        if (inicio && fin) {
            filtros.inicio = inicio;
            filtros.fin = fin;
        }

        const movimientos =
            await movService.obtenerMovimientos(filtros);

        res.json({
            ok: true,
            count: movimientos.length,
            movimientos
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
};

// ========== SALDO ==========

const obtenerSaldo = async (req, res) => {
    try {

        const { cuenta_id } = req.params;

        const saldo =
            await movService.obtenerSaldo(cuenta_id);

        res.json({
            ok: true,
            cuenta_id,
            saldo
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
};

// ========== PERIODO ==========

const obtenerMovimientosPorPeriodo =
    async (req, res) => {

        try {

            const {
                cuenta_id,
                inicio,
                fin
            } = req.query;

            const movimientos =
                await movService.obtenerMovimientosPorPeriodo(
                    cuenta_id,
                    inicio,
                    fin
                );

            res.json({
                ok: true,
                movimientos
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    };

// ========== ESTADISTICAS ==========

const obtenerEstadisticas =
    async (req, res) => {

        try {

            const {
                cuenta_id,
                inicio,
                fin
            } = req.query;

            const estadisticas =
                await movService.obtenerEstadisticas(
                    cuenta_id,
                    inicio,
                    fin
                );

            res.json({
                ok: true,
                estadisticas
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    };

// ===== CRUD EXTRA =====

const getMovimientoById =
    async (req, res) => {

        try {

            const movimiento =
                await movService.getMovimientoById(
                    req.params.id
                );

            res.json({
                ok: true,
                movimiento
            });

        } catch (error) {

            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    };

const updateMovimiento =
    async (req, res) => {

        try {

            const movimiento =
                await movService.updateMovimiento(
                    req.params.id,
                    req.body
                );

            res.json({
                ok: true,
                movimiento
            });

        } catch (error) {

            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    };

const deleteMovimiento =
    async (req, res) => {

        try {

            await movService.deleteMovimiento(
                req.params.id
            );

            res.json({
                ok: true
            });

        } catch (error) {

            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    };

// ===== FONDOS =====

const getFondoReembolsos =
    async (req, res) => {

        try {

            const fondo =
                await movService.getFondoReembolsos();

            res.json({
                ok: true,
                fondo
            });

        } catch (error) {

            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    };

const recargarFondo =
    async (req, res) => {

        try {

            const fondo =
                await movService.recargarFondo(
                    req.body
                );

            res.status(201).json({
                ok: true,
                fondo
            });

        } catch (error) {

            res.status(500).json({
                ok: false,
                error: error.message
            });
        }
    };

module.exports = {
    crearMovimiento,
    obtenerMovimientos,
    obtenerSaldo,
    obtenerMovimientosPorPeriodo,
    obtenerEstadisticas,

    getMovimientoById,
    updateMovimiento,
    deleteMovimiento,

    getFondoReembolsos,
    recargarFondo
};