const express = require('express');
const router = express.Router();

router.use('/users', require('./user.routes'));
router.use('/couriers', require('./courier.routes'));
router.use('/addresses', require('./address.routes'));
router.use('/prices', require('./prices.routes'));
router.use('/shipments', require('./shipment.routes'));
router.use('/packages', require('./package.routes'));
router.use('/courier-status', require('./courier_status.routes'));

module.exports = router;