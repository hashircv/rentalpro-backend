const express = require('express');
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', paymentController.listPayments);
router.get('/:id', paymentController.getPayment);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.patch('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
