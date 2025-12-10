/**
 * Notification Controller
 */

const notificationService = require('./notificationService');
const logger = require('../../utils/logger');

const getUserNotifications = async (req, res, next) => {
    try {
        const { onlyUnread } = req.query;

        const notifications = await notificationService.getUserNotifications(
            req.user.userId,
            onlyUnread === 'true'
        );

        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: notifications
        });
    } catch (error) {
        logger.error('Controller error - getUserNotifications:', error);
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const { notificationId } = req.params;

        const notification = await notificationService.markAsRead(
            parseInt(notificationId),
            req.user.userId
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
                error: 'NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification
        });
    } catch (error) {
        logger.error('Controller error - markAsRead:', error);
        next(error);
    }
};

const broadcastToMembers = async (req, res, next) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required',
                error: 'VALIDATION_ERROR'
            });
        }

        const notifications = await notificationService.broadcastToMembers({ title, message });

        res.status(201).json({
            success: true,
            message: `Notification sent to ${notifications.length} members`,
            data: { count: notifications.length }
        });
    } catch (error) {
        logger.error('Controller error - broadcastToMembers:', error);
        next(error);
    }
};

/**
 * Check if a withdrawal request has already been processed
 * Used when admin clicks on a withdrawal notification
 */
const checkWithdrawalRequestStatus = async (req, res, next) => {
    try {
        const { requestId } = req.params;

        const status = await notificationService.checkWithdrawalRequestStatus(parseInt(requestId));

        if (!status) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
                error: 'NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Request status retrieved',
            data: {
                requestId: status.request_id,
                status: status.status,
                isProcessed: status.status !== 'pending',
                reviewedBy: status.reviewed_by,
                reviewedByName: status.reviewed_by_name,
                reviewedAt: status.reviewed_at
            }
        });
    } catch (error) {
        logger.error('Controller error - checkWithdrawalRequestStatus:', error);
        next(error);
    }
};

module.exports = {
    getUserNotifications,
    markAsRead,
    broadcastToMembers,
    checkWithdrawalRequestStatus
};