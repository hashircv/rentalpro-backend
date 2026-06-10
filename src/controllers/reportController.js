const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');

const getSummary = asyncHandler(async (req, res) => {
  res.json(await reportService.getSummary(req.query));
});

module.exports = {
  getSummary,
};
