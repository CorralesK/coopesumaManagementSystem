/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('./notificationController');
const authenticate = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/permissionMiddleware');
const { checkNotificationOwnership } = require('../../middlewares/ownershipMiddleware');

/**
 * @route GET /api/notifications
 * @desc Get notifications for current user
 * @access Private
 */
router.get(
    '/',
    authenticate,
    notificationController.getUserNotifications
);

/**
 * @route PATCH /api/notifications/:notificationId/read
 * @desc Mark notification as read
 * @access Private - Users can only mark their own notifications as read
 */
router.patch(
    '/:notificationId/read',
    authenticate,
    checkNotificationOwnership,
    notificationController.markAsRead
);

/**
 * @route POST /api/notifications/broadcast
 * @desc Broadcast notification to all members
 * @access Private (administrators only)
 */
router.post(
    '/broadcast',
    authenticate,
    checkPermission('broadcast_notifications'),
    notificationController.broadcastToMembers
);

/**
 * @route GET /api/notifications/withdrawal-status/:requestId
 * @desc Check if a withdrawal request has been processed
 * @access Private (administrators and managers)
 */
router.get(
    '/withdrawal-status/:requestId',
    authenticate,
    checkPermission('approve_withdrawals'),
    notificationController.checkWithdrawalRequestStatus
);

module.exports = router;