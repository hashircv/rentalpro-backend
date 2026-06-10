const propertyService = require('../services/propertyService');
const asyncHandler = require('../utils/asyncHandler');

const listProperties = asyncHandler(async (req, res) => {
  res.json(await propertyService.list());
});

const getProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.getById(req.params.id);
  if (!property) return res.status(404).json({ message: 'Property not found' });
  res.json(property);
});

const createProperty = asyncHandler(async (req, res) => {
  res.status(201).json(await propertyService.create(req.body));
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.update(req.params.id, req.body);
  if (!property) return res.status(404).json({ message: 'Property not found' });
  res.json(property);
});

const deleteProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.remove(req.params.id);
  if (!property) return res.status(404).json({ message: 'Property not found' });
  res.json({ message: 'Property deleted', property });
});

module.exports = {
  createProperty,
  deleteProperty,
  getProperty,
  listProperties,
  updateProperty,
};
