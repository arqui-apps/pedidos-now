const express = require('express');
const router = express.Router();
const controller = require('../controller/compensacion.controller');

router.get('/', controller.getAllCompensaciones);
router.post('/', controller.crearCompensacion);

module.exports = router;