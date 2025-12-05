/**
 * Ownership Verification Middleware
 * Ensures users can only access their own resources or have appropriate permissions
 */

const memberRepository = require('../modules/members/memberRepository');
const logger = require('../utils/logger');

/**
 * Verify user owns the member resource or is an administrator
 * Checks if the memberId in the request matches the user's memberId
 * or if the user has administrative privileges
 */
const checkMemberOwnership = async (req, res, next) => {
    try {
        const requestedMemberId = parseInt(req.params.memberId);
        const userRole = req.user?.role;

        // Administrators and managers can access any member data
        if (userRole === 'administrator' || userRole === 'manager') {
            return next();
        }

        // Get the member associated with the current user
        const userMember = await memberRepository.findByUserId(req.user.userId);

        if (!userMember) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                error: 'FORBIDDEN'
            });
        }

        // Verify ownership
        if (userMember.member_id !== requestedMemberId) {
            logger.warn('Unauthorized member access attempt', {
                userId: req.user.userId,
                requestedMemberId,
                actualMemberId: userMember.member_id
            });

            return res.status(403).json({
                success: false,
                message: 'You can only access your own data',
                error: 'FORBIDDEN'
            });
        }

        // Add member context to request
        req.memberContext = userMember;
        next();

    } catch (error) {
        logger.error('Error in checkMemberOwnership middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Verify user owns the notification or is an administrator
 */
const checkNotificationOwnership = async (req, res, next) => {
    try {
        const notificationId = parseInt(req.params.notificationId);
        const userId = req.user.userId;

        // Query to verify notification ownership
        const db = require('../config/database');
        const result = await db.query(
            'SELECT user_id FROM notifications WHERE notification_id = $1',
            [notificationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
                error: 'NOT_FOUND'
            });
        }

        const notification = result.rows[0];

        // Verify ownership
        if (notification.user_id !== userId) {
            logger.warn('Unauthorized notification access attempt', {
                userId,
                notificationId,
                actualOwnerId: notification.user_id
            });

            return res.status(403).json({
                success: false,
                message: 'You can only access your own notifications',
                error: 'FORBIDDEN'
            });
        }

        next();

    } catch (error) {
        logger.error('Error in checkNotificationOwnership middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Verify user owns the withdrawal request or has approval permissions
 */
const checkWithdrawalOwnership = async (req, res, next) => {
    try {
        const requestId = parseInt(req.params.requestId);
        const userRole = req.user?.role;

        // Users with approval permissions can access any request
        if (userRole === 'administrator' || userRole === 'manager') {
            return next();
        }

        // Get the member associated with the current user
        const userMember = await memberRepository.findByUserId(req.user.userId);

        if (!userMember) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                error: 'FORBIDDEN'
            });
        }

        // Query to verify request ownership
        const db = require('../config/database');
        const result = await db.query(
            'SELECT member_id FROM withdrawal_requests WHERE request_id = $1',
            [requestId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
                error: 'NOT_FOUND'
            });
        }

        const request = result.rows[0];

        // Verify ownership
        if (request.member_id !== userMember.member_id) {
            logger.warn('Unauthorized withdrawal request access attempt', {
                userId: req.user.userId,
                requestId,
                actualMemberId: request.member_id
            });

            return res.status(403).json({
                success: false,
                message: 'You can only access your own requests',
                error: 'FORBIDDEN'
            });
        }

        next();

    } catch (error) {
        logger.error('Error in checkWithdrawalOwnership middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Verify user owns the receipt or has viewing permissions
 */
const checkReceiptOwnership = async (req, res, next) => {
    try {
        const receiptId = parseInt(req.params.receiptId);
        const userRole = req.user?.role;

        // Administrators and managers can access any receipt
        if (userRole === 'administrator' || userRole === 'manager') {
            return next();
        }

        // Get the member associated with the current user
        const userMember = await memberRepository.findByUserId(req.user.userId);

        if (!userMember) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                error: 'FORBIDDEN'
            });
        }

        // Query to verify receipt ownership
        const db = require('../config/database');
        const result = await db.query(
            'SELECT member_id FROM receipts WHERE receipt_id = $1',
            [receiptId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found',
                error: 'NOT_FOUND'
            });
        }

        const receipt = result.rows[0];

        // Verify ownership
        if (receipt.member_id !== userMember.member_id) {
            logger.warn('Unauthorized receipt access attempt', {
                userId: req.user.userId,
                receiptId,
                actualMemberId: receipt.member_id
            });

            return res.status(403).json({
                success: false,
                message: 'You can only access your own receipts',
                error: 'FORBIDDEN'
            });
        }

        next();

    } catch (error) {
        logger.error('Error in checkReceiptOwnership middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR'
        });
    }
};

module.exports = {
    checkMemberOwnership,
    checkNotificationOwnership,
    checkWithdrawalOwnership,
    checkReceiptOwnership
};