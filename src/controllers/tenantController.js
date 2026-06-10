const tenantService = require('../services/tenantService');
const asyncHandler = require('../utils/asyncHandler');

const listTenants = asyncHandler(async (req, res) => {
  res.json(await tenantService.list());
});

const getTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.getById(req.params.id);
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  res.json(tenant);
});

const createTenant = asyncHandler(async (req, res) => {
  res.status(201).json(await tenantService.create(req.body));
});

const updateTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.update(req.params.id, req.body);
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  res.json(tenant);
});

const deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.remove(req.params.id);
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  res.json({ message: 'Tenant deleted', tenant });
});

module.exports = {
  createTenant,
  deleteTenant,
  getTenant,
  listTenants,
  updateTenant,
};
