const unitService = require('../services/unitService');
const asyncHandler = require('../utils/asyncHandler');

const listUnits = asyncHandler(async (req, res) => {
  res.json(await unitService.list());
});

const getUnit = asyncHandler(async (req, res) => {
  const unit = await unitService.getById(req.params.id);
  if (!unit) return res.status(404).json({ message: 'Unit not found' });
  res.json(unit);
});

const createUnit = asyncHandler(async (req, res) => {
  res.status(201).json(await unitService.create(req.body));
});

const updateUnit = asyncHandler(async (req, res) => {
  const unit = await unitService.update(req.params.id, req.body);
  if (!unit) return res.status(404).json({ message: 'Unit not found' });
  res.json(unit);
});

const deleteUnit = asyncHandler(async (req, res) => {
  const unit = await unitService.remove(req.params.id);
  if (!unit) return res.status(404).json({ message: 'Unit not found' });
  res.json({ message: 'Unit deleted', unit });
});

module.exports = {
  createUnit,
  deleteUnit,
  getUnit,
  listUnits,
  updateUnit,
};
