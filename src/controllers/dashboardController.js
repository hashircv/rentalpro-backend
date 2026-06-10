const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getStats());
});

module.exports = {
  getStats,
};
