const express = require('express');
const router  = express.Router({ mergeParams: true });
const ctrl    = require('../../controllers/pedidos/detalle-pedido.controller');


router.get('/',    ctrl.getByPedido);
router.get('/:id', ctrl.getById);
router.post('/',   ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);


module.exports = router;
