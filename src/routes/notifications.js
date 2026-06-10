const express = require('express');
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', notificationController.listNotifications);
router.get('/:id', notificationController.getNotification);
router.post('/', notificationController.createNotification);
router.put('/:id', notificationController.updateNotification);
router.patch('/:id', notificationController.updateNotification);
router.put('/:id/read', notificationController.markNotificationRead);
router.patch('/:id/read', notificationController.markNotificationRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
