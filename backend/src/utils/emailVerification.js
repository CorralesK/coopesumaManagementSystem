/**
 * Email Verification Utilities
 * Utilities for verifying institutional email addresses
 *
 * @module utils/emailVerification
 */

const axios = require('axios');
const logger = require('./logger');

/**
 * Verify if an institutional email exists
 * This is a basic validation - checks format and domain
 * For production, you might want to integrate with Microsoft Graph API
 * or use a more robust email verification service
 *
 * @param {string} email - Email address to verify
 * @returns {Promise<Object>} Verification result
 */
const verifyInstitutionalEmail = async (email) => {
    try {
        // Basic validation
        if (!email || typeof email !== 'string') {
            return {
                isValid: false,
                error: 'Email inválido'
            };
        }

        // Check format - must end with mep.go.cr
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]*mep\.go\.cr$/;
        if (!emailRegex.test(email.toLowerCase())) {
            return {
                isValid: false,
                error: 'El correo debe ser un correo institucional válido del MEP (debe terminar en mep.go.cr)'
            };
        }

        // For now, we'll consider all emails with the correct format as valid
        // In production, you could integrate with Microsoft Graph API to verify
        // if the email actually exists in the organization's directory

        // Example of future Microsoft Graph API integration:
        // const graphResponse = await verifyWithMicrosoftGraph(email);
        // if (!graphResponse.exists) {
        //     return { isValid: false, error: 'El correo no existe en el sistema institucional' };
        // }

        logger.info('Email verification successful', { email });

        return {
            isValid: true,
            email: email.toLowerCase()
        };
    } catch (error) {
        logger.error('Error verifying email:', error);
        return {
            isValid: false,
            error: 'Error al verificar el correo electrónico'
        };
    }
};

/**
 * Future implementation: Verify email with Microsoft Graph API
 * This would require proper permissions and authentication
 *
 * @param {string} email - Email to verify
 * @returns {Promise<Object>} Verification result from Microsoft
 */
/*
const verifyWithMicrosoftGraph = async (email) => {
    try {
        // This would require an app-only access token with User.Read.All permission
        const response = await axios.get(
            `https://graph.microsoft.com/v1.0/users/${email}`,
            {
                headers: {
                    'Authorization': `Bearer ${appAccessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            exists: true,
            userData: response.data
        };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { exists: false };
        }
        throw error;
    }
};
*/

module.exports = {
    verifyInstitutionalEmail
};
