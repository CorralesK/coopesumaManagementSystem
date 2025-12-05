/**
 * Catalog Routes
 * Define routes for catalog operations
 *
 * @module modules/catalogs/catalogRoutes
 */

const express = require('express');
const router = express.Router();
const catalogController = require('./catalogController');
const authenticate = require('../../middlewares/authMiddleware');

/**
 * @route GET /api/catalogs/qualities
 * @desc Get all member qualities
 * @access Private
 */
router.get('/qualities', authenticate, catalogController.getAllQualities);

/**
 * @route GET /api/catalogs/qualities/:id
 * @desc Get quality by ID
 * @access Private
 */
router.get('/qualities/:id', authenticate, catalogController.getQualityById);

/**
 * @route GET /api/catalogs/levels
 * @desc Get all member levels (optional query: qualityCode)
 * @access Private
 */
router.get('/levels', authenticate, catalogController.getAllLevels);

/**
 * @route GET /api/catalogs/levels/:id
 * @desc Get level by ID
 * @access Private
 */
router.get('/levels/:id', authenticate, catalogController.getLevelById);

/**
 * @route GET /api/catalogs/account-types
 * @desc Get all account types
 * @access Private
 */
router.get('/account-types', authenticate, catalogController.getAllAccountTypes);

module.exports = router;