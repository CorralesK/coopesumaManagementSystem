/**
 * Cooperative Routes
 * Defines routes for cooperative operations
 *
 * @module modules/cooperatives/cooperativeRoutes
 */

const express = require('express');
const cooperativeController = require('./cooperativeController');
const authMiddleware = require('../../middlewares/authMiddleware');

const router = express.Router();

/**
 * All routes require authentication
 */
router.use(authMiddleware);

/**
 * GET /api/cooperatives
 * Get all cooperatives
 */
router.get('/', cooperativeController.getAllCooperatives);

/**
 * GET /api/cooperatives/:id
 * Get cooperative by ID
 */
router.get('/:id', cooperativeController.getCooperativeById);

module.exports = router;
