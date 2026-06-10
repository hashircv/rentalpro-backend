const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  res.json(await notificationService.list());
});

const getNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.getById(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
});

const createNotification = asyncHandler(async (req, res) => {
  res.status(201).json(await notificationService.create(req.body));
});

const updateNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.update(req.params.id, req.body);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.remove(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json({ message: 'Notification deleted', notification });
});

module.exports = {
  createNotification,
  deleteNotification,
  getNotification,
  listNotifications,
  markNotificationRead,
  updateNotification,
};
