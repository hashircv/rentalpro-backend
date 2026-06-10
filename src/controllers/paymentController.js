const paymentService = require('../services/paymentService');
const asyncHandler = require('../utils/asyncHandler');

const listPayments = asyncHandler(async (req, res) => {
  res.json(await paymentService.list());
});

const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

const createPayment = asyncHandler(async (req, res) => {
  res.status(201).json(await paymentService.create(req.body));
});

const updatePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.update(req.params.id, req.body);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

const deletePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.remove(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json({ message: 'Payment deleted', payment });
});

module.exports = {
  createPayment,
  deletePayment,
  getPayment,
  listPayments,
  updatePayment,
};
