/**
 * Push Notifications Routes
 */

const express = require('express');
const router = express.Router();
const pushController = require('./pushController');
const authMiddleware = require('../../middlewares/authMiddleware');

// Public route - get VAPID public key (needed before login to subscribe)
router.get('/vapid-public-key', pushController.getVapidPublicKey);

// Protected routes
router.post('/subscribe', authMiddleware, pushController.subscribe);
router.post('/unsubscribe', authMiddleware, pushController.unsubscribe);
router.get('/subscriptions', authMiddleware, pushController.getSubscriptions);

module.exports = router;