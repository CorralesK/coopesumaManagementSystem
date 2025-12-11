/**
 * Push Notifications Controller
 * Handles HTTP requests for push subscription management
 */

const pushService = require('./pushService');
const logger = require('../../utils/logger');

/**
 * Get VAPID public key
 * GET /api/push/vapid-public-key
 */
const getVapidPublicKey = async (req, res) => {
    try {
        const publicKey = pushService.getPublicKey();
        res.json({
            success: true,
            data: { publicKey }
        });
    } catch (error) {
        logger.error('Error getting VAPID public key', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error al obtener la clave pública'
        });
    }
};

/**
 * Subscribe to push notifications
 * POST /api/push/subscribe
 */
const subscribe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const subscription = req.body.subscription;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({
                success: false,
                message: 'Suscripción inválida'
            });
        }

        const saved = await pushService.saveSubscription(userId, subscription);

        res.json({
            success: true,
            message: 'Suscripción guardada correctamente',
            data: { subscriptionId: saved.subscription_id }
        });
    } catch (error) {
        logger.error('Error subscribing to push', { error: error.message, userId: req.user?.userId });
        res.status(500).json({
            success: false,
            message: 'Error al guardar la suscripción'
        });
    }
};

/**
 * Unsubscribe from push notifications
 * POST /api/push/unsubscribe
 */
const unsubscribe = async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({
                success: false,
                message: 'Endpoint requerido'
            });
        }

        await pushService.removeSubscription(endpoint);

        res.json({
            success: true,
            message: 'Suscripción eliminada correctamente'
        });
    } catch (error) {
        logger.error('Error unsubscribing from push', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la suscripción'
        });
    }
};

/**
 * Get user's subscriptions (for debugging)
 * GET /api/push/subscriptions
 */
const getSubscriptions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const subscriptions = await pushService.getUserSubscriptions(userId);

        res.json({
            success: true,
            data: {
                count: subscriptions.length,
                subscriptions: subscriptions.map(s => ({
                    id: s.subscription_id,
                    endpoint: s.endpoint.substring(0, 50) + '...',
                    createdAt: s.created_at
                }))
            }
        });
    } catch (error) {
        logger.error('Error getting subscriptions', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Error al obtener suscripciones'
        });
    }
};

module.exports = {
    getVapidPublicKey,
    subscribe,
    unsubscribe,
    getSubscriptions
};