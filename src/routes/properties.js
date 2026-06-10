const express = require('express');
const propertyController = require('../controllers/propertyController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', propertyController.listProperties);
router.get('/:id', propertyController.getProperty);
router.post('/', propertyController.createProperty);
router.put('/:id', propertyController.updateProperty);
router.patch('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;
