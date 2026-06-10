const express = require('express');
const tenantController = require('../controllers/tenantController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', tenantController.listTenants);
router.get('/:id', tenantController.getTenant);
router.post('/', tenantController.createTenant);
router.put('/:id', tenantController.updateTenant);
router.patch('/:id', tenantController.updateTenant);
router.delete('/:id', tenantController.deleteTenant);

module.exports = router;
