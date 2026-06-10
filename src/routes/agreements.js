const express = require('express');
const agreementController = require('../controllers/agreementController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', agreementController.listAgreements);
router.get('/:id', agreementController.getAgreement);
router.post('/', agreementController.createAgreement);
router.put('/:id', agreementController.updateAgreement);
router.patch('/:id', agreementController.updateAgreement);
router.patch('/:id/terminate', agreementController.terminateAgreement);
router.put('/:id/terminate', agreementController.terminateAgreement);
router.delete('/:id', agreementController.deleteAgreement);

module.exports = router;
