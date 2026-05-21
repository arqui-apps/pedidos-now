const express = require('express');
const router  = express.Router({ mergeParams: true });
const ctrl    = require('../../controllers/pedidos/historial-estados-pedido.controller');


router.get('/',    ctrl.getByPedido);
router.get('/:id', ctrl.getById);


module.exports = router;
