const express = require('express');
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', reportController.getSummary);

module.exports = router;
