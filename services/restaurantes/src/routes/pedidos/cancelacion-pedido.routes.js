const express = require('express');
const router  = express.Router({ mergeParams: true });
const ctrl    = require('../../controllers/pedidos/cancelacion-pedido.controller');


router.get('/',         ctrl.getByPedido);
router.post('/cancelar', ctrl.cancelar);


module.exports = router; 

