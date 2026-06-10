const expenseService = require('../services/expenseService');
const asyncHandler = require('../utils/asyncHandler');

const listExpenses = asyncHandler(async (req, res) => {
  res.json(await expenseService.list());
});

const getExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.getById(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
});

const createExpense = asyncHandler(async (req, res) => {
  res.status(201).json(await expenseService.create(req.body));
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.update(req.params.id, req.body);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.remove(req.params.id);
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json({ message: 'Expense deleted', expense });
});

module.exports = {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
};
