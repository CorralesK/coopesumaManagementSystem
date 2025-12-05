/**
 * Contributions Controller
 * Handle HTTP requests for contributions operations
 *
 * @module modules/contributions/contributionsController
 */

const contributionsService = require('./contributionsService');
const logger = require('../../utils/logger');

/**
 * Get contribution periods for a fiscal year
 * GET /api/contributions/periods?fiscalYear=2024
 */
const getContributionPeriods = async (req, res, next) => {
    try {
        const cooperativeId = req.user.cooperativeId || 1;
        const { fiscalYear } = req.query;

        const data = await contributionsService.getContributionPeriods(
            cooperativeId,
            fiscalYear ? parseInt(fiscalYear) : null
        );

        res.status(200).json({
            success: true,
            message: 'Contribution periods retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - getContributionPeriods:', error);
        next(error);
    }
};

/**
 * Create contribution periods for a fiscal year
 * POST /api/contributions/periods
 * Body: { fiscalYear, tracts: [{ startDate, endDate, requiredAmount }] }
 */
const createContributionPeriods = async (req, res, next) => {
    try {
        const cooperativeId = req.user.cooperativeId || 1;
        const { fiscalYear, tracts } = req.body;

        if (!fiscalYear || !tracts) {
            return res.status(400).json({
                success: false,
                message: 'Fiscal year and tracts are required',
                error: 'VALIDATION_ERROR'
            });
        }

        if (!Array.isArray(tracts) || tracts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tracts must be a non-empty array',
                error: 'VALIDATION_ERROR'
            });
        }

        for (let i = 0; i < tracts.length; i++) {
            const tract = tracts[i];
            if (!tract.startDate || !tract.endDate || !tract.requiredAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Tract ${i + 1}: startDate, endDate, and requiredAmount are required`,
                    error: 'VALIDATION_ERROR'
                });
            }

            if (isNaN(parseFloat(tract.requiredAmount)) || parseFloat(tract.requiredAmount) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Tract ${i + 1}: requiredAmount must be greater than zero`,
                    error: 'VALIDATION_ERROR'
                });
            }
        }

        const parsedFiscalYear = parseInt(fiscalYear);
        if (isNaN(parsedFiscalYear) || parsedFiscalYear < 2000 || parsedFiscalYear > 2100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid fiscal year',
                error: 'VALIDATION_ERROR'
            });
        }

        const data = await contributionsService.createContributionPeriods({
            cooperativeId,
            fiscalYear: parsedFiscalYear,
            tracts
        });

        res.status(201).json({
            success: true,
            message: 'Contribution periods created successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - createContributionPeriods:', error);
        next(error);
    }
};

/**
 * Get member's contribution status
 * GET /api/contributions/:memberId?fiscalYear=2024
 */
const getMemberContributions = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { fiscalYear } = req.query;

        const data = await contributionsService.getMemberContributions(
            parseInt(memberId),
            fiscalYear ? parseInt(fiscalYear) : null
        );

        res.status(200).json({
            success: true,
            message: 'Contribution status retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - getMemberContributions:', error);
        next(error);
    }
};

/**
 * Register a contribution payment
 * POST /api/contributions/register
 * Body: { memberId, tractNumber, amount, transactionDate?, description? }
 */
const registerContribution = async (req, res, next) => {
    try {
        const { memberId, tractNumber, amount, transactionDate, description } = req.body;

        // Validate required fields
        if (!memberId || !tractNumber || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Member ID, tract number and amount are required',
                error: 'VALIDATION_ERROR'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than zero',
                error: 'VALIDATION_ERROR'
            });
        }

        const contributionData = {
            memberId: parseInt(memberId),
            tractNumber: parseInt(tractNumber),
            amount: parseFloat(amount),
            transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
            description,
            createdBy: req.user.userId
        };

        const result = await contributionsService.registerContribution(contributionData);

        res.status(201).json({
            success: true,
            message: 'Contribution registered successfully',
            data: result
        });
    } catch (error) {
        logger.error('Controller error - registerContribution:', error);
        next(error);
    }
};

/**
 * Get contributions report for all members
 * GET /api/contributions/report?fiscalYear=2024
 */
const getContributionsReport = async (req, res, next) => {
    try {
        const cooperativeId = req.user.cooperativeId || 1;
        const { fiscalYear } = req.query;

        const data = await contributionsService.getContributionsReport(
            cooperativeId,
            fiscalYear ? parseInt(fiscalYear) : null
        );

        res.status(200).json({
            success: true,
            message: 'Contributions report retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - getContributionsReport:', error);
        next(error);
    }
};

module.exports = {
    getContributionPeriods,
    createContributionPeriods,
    getMemberContributions,
    registerContribution,
    getContributionsReport
};