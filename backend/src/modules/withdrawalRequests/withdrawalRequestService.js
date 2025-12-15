/**
 * Withdrawal Request Service
 * Business logic for withdrawal request operations
 */

const withdrawalRequestRepository = require('./withdrawalRequestRepository');
const memberRepository = require('../members/memberRepository');
const receiptService = require('../receipts/receiptService');
const notificationService = require('../notifications/notificationService');
const db = require('../../config/database');
const logger = require('../../utils/logger');
const ERROR_CODES = require('../../constants/errorCodes');
const MESSAGES = require('../../constants/messages');

class WithdrawalRequestError extends Error {
    constructor(message, errorCode, statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Create a withdrawal request
 * Note: Members can only request withdrawals from their savings account
 */
const createWithdrawalRequest = async (requestData) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Verify member
        const member = await memberRepository.findById(requestData.memberId);
        if (!member || !member.isActive) {
            throw new WithdrawalRequestError(MESSAGES.MEMBER_NOT_FOUND, ERROR_CODES.MEMBER_NOT_FOUND, 404);
        }

        // Only allow withdrawal requests from savings account
        if (requestData.accountType !== 'savings') {
            throw new WithdrawalRequestError(
                'Solo se permiten solicitudes de retiro de la cuenta de ahorros',
                ERROR_CODES.VALIDATION_ERROR,
                400
            );
        }

        // Get account and verify balance
        const accountQuery = `SELECT account_id, account_type, current_balance FROM accounts WHERE member_id = $1 AND account_type = $2`;
        const accountResult = await client.query(accountQuery, [requestData.memberId, requestData.accountType]);

        if (accountResult.rows.length === 0) {
            throw new WithdrawalRequestError('Account not found', ERROR_CODES.ACCOUNT_NOT_FOUND, 404);
        }

        const account = accountResult.rows[0];

        if (parseFloat(account.current_balance) < requestData.requestedAmount) {
            throw new WithdrawalRequestError('Insufficient balance', ERROR_CODES.INSUFFICIENT_BALANCE, 400);
        }

        // Create request
        const request = await withdrawalRequestRepository.createRequest({
            memberId: requestData.memberId,
            accountId: account.account_id,
            requestedAmount: requestData.requestedAmount,
            requestType: requestData.requestType || 'withdrawal',
            requestNotes: requestData.requestNotes
        }, client);

        await client.query('COMMIT');

        logger.info('Withdrawal request created', { requestId: request.request_id });

        // Notify admins about the new withdrawal request
        try {
            await notificationService.notifyWithdrawalRequest({
                requestId: request.request_id,
                memberId: requestData.memberId,
                memberName: member.fullName,
                amount: requestData.requestedAmount,
                accountType: requestData.accountType
            });
        } catch (notifError) {
            logger.error('Error sending withdrawal request notification (non-critical):', notifError);
        }

        return request;
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.isOperational) throw error;
        logger.error('Error creating withdrawal request:', error);
        throw new WithdrawalRequestError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    } finally {
        client.release();
    }
};

/**
 * Approve withdrawal request
 */
const approveWithdrawalRequest = async (requestId, approvalData) => {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const request = await withdrawalRequestRepository.findById(requestId);
        if (!request) {
            throw new WithdrawalRequestError('Request not found', ERROR_CODES.NOT_FOUND, 404);
        }

        if (request.status !== 'pending') {
            throw new WithdrawalRequestError('Only pending requests can be approved', ERROR_CODES.INVALID_STATUS, 400);
        }

        // Create withdrawal transaction
        const transactionQuery = `
            INSERT INTO transactions (account_id, transaction_type, amount, transaction_date, fiscal_year, description, status, created_by)
            VALUES ($1, 'withdrawal', $2, CURRENT_DATE, get_fiscal_year(CURRENT_DATE), $3, 'completed', $4)
            RETURNING transaction_id
        `;

        const transactionResult = await client.query(transactionQuery, [
            request.account_id,
            request.requested_amount,
            `Approved withdrawal - ${request.member_name}`,
            approvalData.reviewedBy
        ]);

        const transactionId = transactionResult.rows[0].transaction_id;

        // Update account balance
        await client.query(
            'UPDATE accounts SET current_balance = current_balance - $1, updated_at = CURRENT_TIMESTAMP WHERE account_id = $2',
            [request.requested_amount, request.account_id]
        );

        let receiptInfo = null;
        try {
            const receipt = await receiptService.generateReceiptForTransaction({
                transactionId,
                previousBalance: parseFloat(request.current_balance),
                accountType: request.account_type,
                client: client
            });

            receiptInfo = {
                receiptId: receipt.receipt_id,
                receiptNumber: receipt.receipt_number
            };

            logger.info('Receipt generated for withdrawal', {
                requestId,
                transactionId,
                receiptNumber: receipt.receipt_number
            });
        } catch (receiptError) {
            logger.error('Error generating receipt for withdrawal (non-critical):', receiptError);
        }

        // Update request status
        const updatedRequest = await withdrawalRequestRepository.updateStatus(requestId, {
            status: 'approved',
            adminNotes: approvalData.adminNotes,
            reviewedBy: approvalData.reviewedBy,
            completedTransactionId: transactionId
        }, client);

        await client.query('COMMIT');

        // Notify member about approval
        try {
            await notificationService.notifyWithdrawalResponse(updatedRequest, 'approved');
        } catch (notifError) {
            logger.error('Error sending approval notification (non-critical):', notifError);
        }

        // Mark all admin notifications for this request as processed
        try {
            await notificationService.markWithdrawalNotificationsAsProcessed(requestId);
        } catch (notifError) {
            logger.error('Error marking notifications as processed (non-critical):', notifError);
        }

        logger.info('Withdrawal request approved', { requestId, transactionId });

        return {
            ...updatedRequest,
            receipt: receiptInfo
        };
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.isOperational) throw error;
        logger.error('Error approving withdrawal request:', error);
        throw new WithdrawalRequestError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    } finally {
        client.release();
    }
};

/**
 * Reject withdrawal request
 */
const rejectWithdrawalRequest = async (requestId, rejectionData) => {
    try {
        const request = await withdrawalRequestRepository.findById(requestId);
        if (!request) {
            throw new WithdrawalRequestError('Request not found', ERROR_CODES.NOT_FOUND, 404);
        }

        if (request.status !== 'pending') {
            throw new WithdrawalRequestError('Only pending requests can be rejected', ERROR_CODES.INVALID_STATUS, 400);
        }

        const updatedRequest = await withdrawalRequestRepository.updateStatus(requestId, {
            status: 'rejected',
            adminNotes: rejectionData.adminNotes,
            reviewedBy: rejectionData.reviewedBy
        });

        // Notify member about rejection
        try {
            await notificationService.notifyWithdrawalResponse(updatedRequest, 'rejected');
        } catch (notifError) {
            logger.error('Error sending rejection notification (non-critical):', notifError);
        }

        // Mark all admin notifications for this request as processed
        try {
            await notificationService.markWithdrawalNotificationsAsProcessed(requestId);
        } catch (notifError) {
            logger.error('Error marking notifications as processed (non-critical):', notifError);
        }

        logger.info('Withdrawal request rejected', { requestId });

        return updatedRequest;
    } catch (error) {
        if (error.isOperational) throw error;
        logger.error('Error rejecting withdrawal request:', error);
        throw new WithdrawalRequestError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

/**
 * Get all withdrawal requests
 */
const getAllWithdrawalRequests = async (filters = {}) => {
    try {
        const requests = await withdrawalRequestRepository.findAll(filters);
        return requests;
    } catch (error) {
        logger.error('Error getting withdrawal requests:', error);
        throw new WithdrawalRequestError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

/**
 * Get withdrawal request by ID
 */
const getWithdrawalRequestById = async (requestId) => {
    try {
        const request = await withdrawalRequestRepository.findById(requestId);
        if (!request) {
            throw new WithdrawalRequestError('Request not found', ERROR_CODES.NOT_FOUND, 404);
        }
        return request;
    } catch (error) {
        if (error.isOperational) throw error;
        logger.error('Error getting withdrawal request:', error);
        throw new WithdrawalRequestError(MESSAGES.INTERNAL_ERROR, ERROR_CODES.INTERNAL_ERROR, 500);
    }
};

module.exports = {
    createWithdrawalRequest,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
    getAllWithdrawalRequests,
    getWithdrawalRequestById,
    WithdrawalRequestError
};