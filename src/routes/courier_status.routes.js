const express = require('express');
const router = express.Router();
const courierStatusController = require('../controllers/courier_status.controller');

/**
 * @route   GET /api/courier-status/:courierId
 * @desc    Obtener el estado actual de un repartidor
 * @access  Public
 */
router.get('/courier-status/:courierId', courierStatusController.getCurrentStatus);

/**
 * @route   POST /api/courier-status/:courierId/change
 * @desc    Cambiar el estado de un repartidor
 * @body    { newStatusName: string, reason?: string }
 * @access  Public
 */
router.post('/courier-status/:courierId/change', courierStatusController.changeStatus);

/**
 * @route   GET /api/courier-status/:courierId/valid-transitions
 * @desc    Obtener las transiciones válidas desde el estado actual
 * @access  Public
 */
router.get('/courier-status/:courierId/valid-transitions', courierStatusController.getValidTransitions);

/**
 * @route   GET /api/courier-status-types
 * @desc    Obtener todos los tipos de estado disponibles
 * @access  Public
 */
router.get('/courier-status-types', courierStatusController.getAllStatusTypes);

/**
 * @route   POST /api/courier-status/initialize
 * @desc    Inicializar el estado de un nuevo repartidor (uso interno)
 * @body    { courierId: number, initialStatus?: string }
 * @access  Private (normalmente usado por admin)
 */
router.post('/courier-status/initialize', courierStatusController.initializeStatus);

module.exports = router;
