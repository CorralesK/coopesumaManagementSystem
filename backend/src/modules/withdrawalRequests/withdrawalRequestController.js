/**
 * Withdrawal Request Controller
 */

const withdrawalRequestService = require('./withdrawalRequestService');
const logger = require('../../utils/logger');

const createWithdrawalRequest = async (req, res, next) => {
    try {
        const { memberId, accountType, requestedAmount, requestNotes } = req.body;

        if (!memberId || !accountType || !requestedAmount) {
            return res.status(400).json({
                success: false,
                message: 'Required fields are missing',
                error: 'VALIDATION_ERROR'
            });
        }

        const validAccountTypes = ['savings', 'contributions', 'surplus'];
        if (!validAccountTypes.includes(accountType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid account type. Must be one of: savings, contributions, surplus',
                error: 'VALIDATION_ERROR'
            });
        }

        const parsedMemberId = parseInt(memberId);
        const parsedAmount = parseFloat(requestedAmount);

        if (isNaN(parsedMemberId) || parsedMemberId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid member ID',
                error: 'VALIDATION_ERROR'
            });
        }

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Requested amount must be greater than zero',
                error: 'VALIDATION_ERROR'
            });
        }

        const data = await withdrawalRequestService.createWithdrawalRequest({
            memberId: parsedMemberId,
            accountType,
            requestedAmount: parsedAmount,
            requestNotes
        });

        res.status(201).json({
            success: true,
            message: 'Withdrawal request created successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - createWithdrawalRequest:', error);
        next(error);
    }
};

const getAllWithdrawalRequests = async (req, res, next) => {
    try {
        const { status, memberId } = req.query;

        const data = await withdrawalRequestService.getAllWithdrawalRequests({
            status,
            memberId: memberId ? parseInt(memberId) : undefined
        });

        res.status(200).json({
            success: true,
            message: 'Requests retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - getAllWithdrawalRequests:', error);
        next(error);
    }
};

const getWithdrawalRequestById = async (req, res, next) => {
    try {
        const { requestId } = req.params;

        const data = await withdrawalRequestService.getWithdrawalRequestById(parseInt(requestId));

        res.status(200).json({
            success: true,
            message: 'Request retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - getWithdrawalRequestById:', error);
        next(error);
    }
};

const approveWithdrawalRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { adminNotes } = req.body;

        const data = await withdrawalRequestService.approveWithdrawalRequest(parseInt(requestId), {
            adminNotes,
            reviewedBy: req.user.userId
        });

        res.status(200).json({
            success: true,
            message: 'Request approved successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - approveWithdrawalRequest:', error);
        next(error);
    }
};

const rejectWithdrawalRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { adminNotes } = req.body;

        if (!adminNotes) {
            return res.status(400).json({
                success: false,
                message: 'A reason is required to reject the request',
                error: 'VALIDATION_ERROR'
            });
        }

        const data = await withdrawalRequestService.rejectWithdrawalRequest(parseInt(requestId), {
            adminNotes,
            reviewedBy: req.user.userId
        });

        res.status(200).json({
            success: true,
            message: 'Request rejected successfully',
            data
        });
    } catch (error) {
        logger.error('Controller error - rejectWithdrawalRequest:', error);
        next(error);
    }
};

module.exports = {
    createWithdrawalRequest,
    getAllWithdrawalRequests,
    getWithdrawalRequestById,
    approveWithdrawalRequest,
    rejectWithdrawalRequest
};