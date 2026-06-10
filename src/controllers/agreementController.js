const agreementService = require('../services/agreementService');
const asyncHandler = require('../utils/asyncHandler');

const listAgreements = asyncHandler(async (req, res) => {
  res.json(await agreementService.list());
});

const getAgreement = asyncHandler(async (req, res) => {
  const agreement = await agreementService.getById(req.params.id);
  if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
  res.json(agreement);
});

const createAgreement = asyncHandler(async (req, res) => {
  res.status(201).json(await agreementService.create(req.body));
});

const updateAgreement = asyncHandler(async (req, res) => {
  const agreement = await agreementService.update(req.params.id, req.body);
  if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
  res.json(agreement);
});

const terminateAgreement = asyncHandler(async (req, res) => {
  const agreement = await agreementService.terminate(req.params.id);
  if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
  res.json(agreement);
});

const deleteAgreement = asyncHandler(async (req, res) => {
  const agreement = await agreementService.remove(req.params.id);
  if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
  res.json({ message: 'Agreement deleted', agreement });
});

module.exports = {
  createAgreement,
  deleteAgreement,
  getAgreement,
  listAgreements,
  terminateAgreement,
  updateAgreement,
};
