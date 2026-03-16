const express = require('express');
const router = express.Router();
const courierStatusController = require('../controllers/courier_status.controller');

/**
 * @route   GET /:courierId
 * @desc    Obtener el estado actual de un repartidor
 * @access  Public
 */
router.get('/:courierId', courierStatusController.getCurrentStatus);

/**
 * @route   POST /:courierId/change
 * @desc    Cambiar el estado de un repartidor
 * @body    { newStatusName: string, reason?: string }
 * @access  Public
 */
router.post('/:courierId/change', courierStatusController.changeStatus);

/**
 * @route   GET /:courierId/valid-transitions
 * @desc    Obtener las transiciones válidas desde el estado actual
 * @access  Public
 */
router.get('/:courierId/valid-transitions', courierStatusController.getValidTransitions);

/**
 * @route   GET /types
 * @desc    Obtener todos los tipos de estado disponibles
 * @access  Public
 */
router.get('/types', courierStatusController.getAllStatusTypes);

/**
 * @route   POST /initialize
 * @desc    Inicializar el estado de un nuevo repartidor (uso interno)
 * @body    { courierId: number, initialStatus?: string }
 * @access  Private (normalmente usado por admin)
 */
router.post('/initialize', courierStatusController.initializeStatus);

module.exports = router;
