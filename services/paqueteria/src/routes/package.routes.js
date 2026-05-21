const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');

router.get('/', packageController.getAll);
router.get('/:id', packageController.getById);
router.post('/', packageController.create);
router.put('/:id', packageController.update);
router.delete('/:id', packageController.remove);

module.exports = router;