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
            message: 'Notificaciones obtenidas successfully',
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
                message: 'Notificación no encontrada',
                error: 'NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notificación marcada como leída',
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
                message: 'Título y mensaje are required',
                error: 'VALIDATION_ERROR'
            });
        }

        const notifications = await notificationService.broadcastToMembers({ title, message });

        res.status(201).json({
            success: true,
            message: `Notificación enviada a ${notifications.length} miembros`,
            data: { count: notifications.length }
        });
    } catch (error) {
        logger.error('Controller error - broadcastToMembers:', error);
        next(error);
    }
};

module.exports = {
    getUserNotifications,
    markAsRead,
    broadcastToMembers
};