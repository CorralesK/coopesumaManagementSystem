/**
 * Push Notifications Service
 * Handles Web Push subscriptions and sending push notifications
 */

const webpush = require('web-push');
const pool = require('../../config/database');
const config = require('../../config/environment');
const logger = require('../../utils/logger');

// Configure web-push with VAPID keys
webpush.setVapidDetails(
    config.webPush.subject,
    config.webPush.publicKey,
    config.webPush.privateKey
);

/**
 * Save a push subscription for a user
 * @param {number} userId - User ID
 * @param {Object} subscription - Push subscription object from browser
 * @returns {Object} - Saved subscription
 */
const saveSubscription = async (userId, subscription) => {
    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    const query = `
        INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (endpoint)
        DO UPDATE SET
            user_id = EXCLUDED.user_id,
            p256dh = EXCLUDED.p256dh,
            auth = EXCLUDED.auth,
            updated_at = CURRENT_TIMESTAMP
        RETURNING *
    `;

    const result = await pool.query(query, [userId, endpoint, p256dh, auth]);

    logger.info('Push subscription saved', { userId, endpoint: endpoint.substring(0, 50) });

    return result.rows[0];
};

/**
 * Remove a push subscription
 * @param {string} endpoint - Subscription endpoint to remove
 */
const removeSubscription = async (endpoint) => {
    const query = `DELETE FROM push_subscriptions WHERE endpoint = $1`;
    await pool.query(query, [endpoint]);

    logger.info('Push subscription removed', { endpoint: endpoint.substring(0, 50) });
};

/**
 * Get all subscriptions for a user
 * @param {number} userId - User ID
 * @returns {Array} - Array of subscriptions
 */
const getUserSubscriptions = async (userId) => {
    const query = `SELECT * FROM push_subscriptions WHERE user_id = $1`;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

/**
 * Send push notification to a specific user
 * @param {number} userId - User ID to send notification to
 * @param {Object} payload - Notification payload { title, body, icon, url, data }
 */
const sendToUser = async (userId, payload) => {
    const subscriptions = await getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
        logger.debug('No push subscriptions for user', { userId });
        return { sent: 0, failed: 0 };
    }

    const notificationPayload = JSON.stringify({
        title: payload.title || 'COOPESUMA',
        body: payload.body || '',
        icon: payload.icon || '/logo.png',
        badge: '/logo.png',
        url: payload.url || '/',
        data: payload.data || {}
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        };

        try {
            await webpush.sendNotification(pushSubscription, notificationPayload);
            sent++;
        } catch (error) {
            failed++;
            logger.error('Failed to send push notification', {
                userId,
                endpoint: sub.endpoint.substring(0, 50),
                error: error.message,
                statusCode: error.statusCode
            });

            // Remove invalid subscriptions (410 Gone or 404 Not Found)
            if (error.statusCode === 410 || error.statusCode === 404) {
                await removeSubscription(sub.endpoint);
            }
        }
    }

    logger.info('Push notifications sent to user', { userId, sent, failed });
    return { sent, failed };
};

/**
 * Send push notification to multiple users
 * @param {Array<number>} userIds - Array of user IDs
 * @param {Object} payload - Notification payload
 */
const sendToUsers = async (userIds, payload) => {
    let totalSent = 0;
    let totalFailed = 0;

    for (const userId of userIds) {
        const result = await sendToUser(userId, payload);
        totalSent += result.sent;
        totalFailed += result.failed;
    }

    return { sent: totalSent, failed: totalFailed };
};

/**
 * Send push notification to all users with a specific role
 * @param {string} role - User role
 * @param {Object} payload - Notification payload
 */
const sendToRole = async (role, payload) => {
    const query = `
        SELECT DISTINCT ps.user_id
        FROM push_subscriptions ps
        JOIN users u ON ps.user_id = u.user_id
        WHERE u.role = $1 AND u.is_active = true
    `;
    const result = await pool.query(query, [role]);
    const userIds = result.rows.map(r => r.user_id);

    return sendToUsers(userIds, payload);
};

/**
 * Send push notification to all active users (broadcast)
 * @param {Object} payload - Notification payload
 */
const broadcast = async (payload) => {
    const query = `
        SELECT DISTINCT ps.user_id
        FROM push_subscriptions ps
        JOIN users u ON ps.user_id = u.user_id
        WHERE u.is_active = true
    `;
    const result = await pool.query(query);
    const userIds = result.rows.map(r => r.user_id);

    logger.info('Broadcasting push notification', { userCount: userIds.length });

    return sendToUsers(userIds, payload);
};

/**
 * Get VAPID public key (for frontend)
 * @returns {string} - VAPID public key
 */
const getPublicKey = () => {
    return config.webPush.publicKey;
};

module.exports = {
    saveSubscription,
    removeSubscription,
    getUserSubscriptions,
    sendToUser,
    sendToUsers,
    sendToRole,
    broadcast,
    getPublicKey
};