const express = require('express');
const unitController = require('../controllers/unitController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', unitController.listUnits);
router.get('/:id', unitController.getUnit);
router.post('/', unitController.createUnit);
router.put('/:id', unitController.updateUnit);
router.patch('/:id', unitController.updateUnit);
router.delete('/:id', unitController.deleteUnit);

module.exports = router;
