// Admin-contabilidad Victor

const negociosService = require('../services/negocios.service');
const movimientoRepository = require('../repositories/movimiento.repository');
const reportesNegociosRepository = require('../repositories/reportesNegocios.repository');

const healthNegocios = async (req, res, next) => {
    try {
        const data = await negociosService.verificarSaludNegocios();

        res.json({
            ok: true,
            service: 'admin-contabilidad',
            externalService: 'negocios',
            externalUrl: process.env.NEGOCIOS_SERVICE_URL,
            data
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({
            ok: false,
            service: 'admin-contabilidad',
            externalService: 'negocios',
            message: 'No se pudo conectar con el microservicio de Negocios',
            externalUrl: process.env.NEGOCIOS_SERVICE_URL,
            error: error.response?.data || error.message
        });
    }
};

const listarNegocios = async (req, res, next) => {
    try {
        const data = await negociosService.listarNegocios(req.query);

        res.json({
            ok: true,
            modulo: 'negocios',
            data
        });
    } catch (error) {
        next(error);
    }
};

const obtenerNegocioPorId = async (req, res, next) => {
    try {
        const { businessId } = req.params;

        const data = await negociosService.obtenerNegocioPorId(businessId);

        res.json({
            ok: true,
            modulo: 'negocios',
            businessId,
            data
        });
    } catch (error) {
        next(error);
    }
};

const obtenerCatalogoNegocio = async (req, res, next) => {
    try {
        const { businessId } = req.params;

        const data = await negociosService.obtenerCatalogoNegocio(businessId);

        res.json({
            ok: true,
            modulo: 'negocios',
            businessId,
            data
        });
    } catch (error) {
        next(error);
    }
};

const obtenerProductosNegocio = async (req, res, next) => {
    try {
        const { businessId } = req.params;

        const data = await negociosService.obtenerProductosNegocio(businessId, req.query);

        res.json({
            ok: true,
            modulo: 'negocios',
            businessId,
            data
        });
    } catch (error) {
        next(error);
    }
};

const obtenerInventarioNegocio = async (req, res, next) => {
    try {
        const { businessId } = req.params;

        const data = await negociosService.obtenerInventarioNegocio(businessId);

        res.json({
            ok: true,
            modulo: 'negocios',
            businessId,
            data
        });
    } catch (error) {
        next(error);
    }
};

const obtenerStockProducto = async (req, res, next) => {
    try {
        const { businessId, productId } = req.params;

        const data = await negociosService.obtenerStockProducto(businessId, productId);

        res.json({
            ok: true,
            modulo: 'negocios',
            businessId,
            productId,
            data
        });
    } catch (error) {
        next(error);
    }
};

const registrarMovimientoNegocio = async (req, res, next) => {
    try {
        const {
            cuenta_id,
            referencia_id,
            monto,
            descripcion,
            pedido_id,
            repartidor_id,
            estado
        } = req.body;

        const movimiento = await movimientoRepository.crearMovimiento({
            cuenta_id: cuenta_id || 1,
            tipo: 'ingreso',
            subtipo: 'pedido_negocio',
            modulo_origen: 'negocios',
            referencia_id: referencia_id || pedido_id || null,
            monto,
            descripcion: descripcion || 'Ingreso por pedido de negocio',
            pedido_id: pedido_id || null,
            repartidor_id: repartidor_id || null,
            estado: estado || 'procesado'
        });

        res.status(201).json({
            ok: true,
            message: 'Movimiento financiero de negocio registrado correctamente',
            modulo: 'negocios',
            movimiento_id: movimiento
        });
    } catch (error) {
        next(error);
    }
};

const registrarCancelacionNegocio = async (req, res, next) => {
    try {
        const {
            cuenta_id,
            referencia_id,
            monto,
            descripcion,
            pedido_id,
            repartidor_id,
            estado
        } = req.body;

        const movimiento = await movimientoRepository.crearMovimiento({
            cuenta_id: cuenta_id || 1,
            tipo: 'egreso',
            subtipo: 'cancelacion_negocio',
            modulo_origen: 'negocios',
            referencia_id: referencia_id || pedido_id || null,
            monto: monto || 0,
            descripcion: descripcion || 'Cancelación de pedido de negocio',
            pedido_id: pedido_id || null,
            repartidor_id: repartidor_id || null,
            estado: estado || 'cancelado'
        });

        res.status(201).json({
            ok: true,
            message: 'Cancelación de negocio registrada correctamente',
            modulo: 'negocios',
            movimiento_id: movimiento
        });
    } catch (error) {
        next(error);
    }
};

const registrarDescuentoNegocio = async (req, res, next) => {
    try {
        const {
            cuenta_id,
            referencia_id,
            monto,
            descripcion,
            pedido_id,
            repartidor_id,
            estado
        } = req.body;

        const movimiento = await movimientoRepository.crearMovimiento({
            cuenta_id: cuenta_id || 1,
            tipo: 'egreso',
            subtipo: 'descuento_negocio',
            modulo_origen: 'negocios',
            referencia_id: referencia_id || pedido_id || null,
            monto,
            descripcion: descripcion || 'Descuento aplicado a pedido de negocio',
            pedido_id: pedido_id || null,
            repartidor_id: repartidor_id || null,
            estado: estado || 'procesado'
        });

        res.status(201).json({
            ok: true,
            message: 'Descuento de negocio registrado correctamente',
            modulo: 'negocios',
            movimiento_id: movimiento
        });
    } catch (error) {
        next(error);
    }
};
// Admin-contabilidad Victor
const registrarPedidoContabilidadNegocio = async (req, res, next) => {
    try {
        const resultado = await reportesNegociosRepository.guardarPedidoYMovimientoNegocio(req.body);

        res.status(201).json({
            ok: true,
            message: 'Pedido de negocio registrado en contabilidad correctamente',
            modulo: 'negocios',
            data: resultado
        });
    } catch (error) {
        next(error);
    }
};

// Admin-contabilidad Victor
const obtenerResumenNegocios = async (req, res, next) => {
    try {
        const resumen = await reportesNegociosRepository.obtenerResumenNegocios();

        res.json({
            ok: true,
            modulo: 'negocios',
            reporte: 'resumen_general',
            data: resumen
        });
    } catch (error) {
        next(error);
    }
};

// Admin-contabilidad Victor
const obtenerResumenNegocioPorEntidad = async (req, res, next) => {
    try {
        const { businessId } = req.params;

        const resumen = await reportesNegociosRepository.obtenerResumenNegocioPorEntidad(businessId);

        if (!resumen) {
            return res.status(404).json({
                ok: false,
                modulo: 'negocios',
                message: 'No se encontró información contable para este negocio'
            });
        }

        res.json({
            ok: true,
            modulo: 'negocios',
            reporte: 'resumen_por_negocio',
            businessId,
            data: resumen
        });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    healthNegocios,
    listarNegocios,
    obtenerNegocioPorId,
    obtenerCatalogoNegocio,
    obtenerProductosNegocio,
    obtenerInventarioNegocio,
    obtenerStockProducto,
    registrarMovimientoNegocio,
    registrarCancelacionNegocio,
    registrarDescuentoNegocio,
    registrarPedidoContabilidadNegocio,
    obtenerResumenNegocios,
    obtenerResumenNegocioPorEntidad
    
};