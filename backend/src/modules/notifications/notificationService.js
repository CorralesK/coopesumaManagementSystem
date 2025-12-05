/**
 * Notification Service
 * Simple notification system for withdrawal requests and alerts
 */

const db = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Create a notification
 */
const createNotification = async (notificationData) => {
    try {
        const query = `
            INSERT INTO notifications (user_id, notification_type, title, message, related_entity_type, related_entity_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            notificationData.userId,
            notificationData.notificationType,
            notificationData.title,
            notificationData.message,
            notificationData.relatedEntityType || null,
            notificationData.relatedEntityId || null
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        logger.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Get notifications for a user
 */
const getUserNotifications = async (userId, onlyUnread = false) => {
    try {
        let query = `
            SELECT * FROM notifications
            WHERE user_id = $1
        `;

        const params = [userId];

        if (onlyUnread) {
            query += ' AND is_read = false';
        }

        query += ' ORDER BY created_at DESC LIMIT 50';

        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        logger.error('Error getting user notifications:', error);
        throw error;
    }
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
    try {
        const query = `
            UPDATE notifications
            SET is_read = true, read_at = CURRENT_TIMESTAMP
            WHERE notification_id = $1 AND user_id = $2
            RETURNING *
        `;

        const result = await db.query(query, [notificationId, userId]);
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Notify administrators about a new withdrawal request
 */
const notifyWithdrawalRequest = async (request) => {
    try {
        // Get all admin and manager users
        const adminQuery = `
            SELECT user_id FROM users
            WHERE role IN ('administrator', 'manager') AND is_active = true
        `;

        const admins = await db.query(adminQuery);

        const notifications = [];

        for (const admin of admins.rows) {
            const notification = await createNotification({
                userId: admin.user_id,
                notificationType: 'withdrawal_request',
                title: 'Nueva solicitud de retiro',
                message: `${request.member_name} ha solicitado un retiro de ₡${request.requested_amount} de su cuenta de ${request.account_type}`,
                relatedEntityType: 'withdrawal_request',
                relatedEntityId: request.request_id
            });

            notifications.push(notification);
        }

        return notifications;
    } catch (error) {
        logger.error('Error notifying withdrawal request:', error);
        throw error;
    }
};

/**
 * Broadcast notification to all members
 */
const broadcastToMembers = async (data) => {
    try {
        const query = `
            SELECT u.user_id
            FROM users u
            JOIN members m ON u.user_id = m.user_id
            WHERE u.role = 'member' AND u.is_active = true
        `;

        const result = await db.query(query);
        const notifications = [];

        for (const user of result.rows) {
            const notification = await createNotification({
                userId: user.user_id,
                notificationType: 'admin_message',
                title: data.title,
                message: data.message,
                relatedEntityType: null,
                relatedEntityId: null
            });

            notifications.push(notification);
        }

        logger.info('Broadcast sent to members', { count: notifications.length });
        return notifications;

    } catch (error) {
        logger.error('Error broadcasting to members:', error);
        throw error;
    }
};

/**
 * Notify admins about liquidations due
 */
const notifyLiquidationsDue = async () => {
    try {
        const liquidationService = require('../liquidations/liquidationService');
        const pending = await liquidationService.getMembersPendingLiquidation(1);

        if (pending.length === 0) return [];

        const adminQuery = `
            SELECT user_id FROM users
            WHERE role = 'administrator' AND is_active = true
        `;

        const admins = await db.query(adminQuery);
        const notifications = [];

        for (const admin of admins.rows) {
            const notification = await createNotification({
                userId: admin.user_id,
                notificationType: 'liquidation_due',
                title: `${pending.length} miembros necesitan liquidación`,
                message: `Hay ${pending.length} miembros con 6+ años que necesitan liquidarse`,
                relatedEntityType: null,
                relatedEntityId: null
            });

            notifications.push(notification);
        }

        logger.info('Liquidation notifications sent', { count: notifications.length });
        return notifications;

    } catch (error) {
        logger.error('Error notifying liquidations due:', error);
        throw error;
    }
};

/**
 * Notify member about withdrawal response
 */
const notifyWithdrawalResponse = async (request, status) => {
    try {
        const memberQuery = `
            SELECT m.user_id
            FROM members m
            WHERE m.member_id = $1 AND m.user_id IS NOT NULL
        `;

        const result = await db.query(memberQuery, [request.member_id]);

        if (result.rows.length > 0 && result.rows[0].user_id) {
            const notification = await createNotification({
                userId: result.rows[0].user_id,
                notificationType: status === 'approved' ? 'withdrawal_approved' : 'withdrawal_rejected',
                title: status === 'approved' ? 'Retiro Aprobado' : 'Retiro Rechazado',
                message: `Tu solicitud de retiro por ₡${request.requested_amount} ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'}`,
                relatedEntityType: 'withdrawal_request',
                relatedEntityId: request.request_id
            });

            logger.info('Withdrawal response notification sent', {
                requestId: request.request_id,
                status
            });

            return notification;
        }

        return null;

    } catch (error) {
        logger.error('Error notifying withdrawal response:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    notifyWithdrawalRequest,
    broadcastToMembers,
    notifyLiquidationsDue,
    notifyWithdrawalResponse
};