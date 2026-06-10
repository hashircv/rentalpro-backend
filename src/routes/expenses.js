const express = require('express');
const expenseController = require('../controllers/expenseController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', expenseController.listExpenses);
router.get('/:id', expenseController.getExpense);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.patch('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
