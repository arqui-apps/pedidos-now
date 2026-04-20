const express = require('express');
const router = express.Router();

router.use('/users', require('./user.routes'));
router.use('/couriers', require('./courier.routes'));
router.use('/courier-status-types', require('./courierStatusType.routes'));
router.use('/courier-statuses', require('./courierStatus.routes'));
router.use('/addresses', require('./address.routes'));
router.use('/prices', require('./prices.routes'));
router.use('/shipments', require('./shipment.routes'));
router.use('/packages', require('./package.routes'));

module.exports = router;