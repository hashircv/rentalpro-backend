const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/stats', dashboardController.getStats);

module.exports = router;
