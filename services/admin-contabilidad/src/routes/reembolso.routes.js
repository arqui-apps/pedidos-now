const express = require('express');
const router = express.Router();
const controller = require('../controller/reembolso.controller');

router.get('/', controller.getAllReembolsos);
router.post('/', controller.crearReembolso);

module.exports = router;