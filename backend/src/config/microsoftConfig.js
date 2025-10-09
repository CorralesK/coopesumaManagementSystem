/**
 * Microsoft OAuth 2.0 Configuration
 * Configuration for Microsoft Azure AD authentication
 *
 * @module config/microsoftConfig
 */

require('dotenv').config();

const microsoftConfig = {
    // Microsoft App Registration credentials
    clientId: process.env.MS_CLIENT_ID || '',
    clientSecret: process.env.MS_CLIENT_SECRET || '',
    tenantId: process.env.MS_TENANT_ID || 'common',

    // OAuth endpoints
    authority: process.env.MS_AUTHORITY || 'https://login.microsoftonline.com/common',
    redirectUri: process.env.MS_REDIRECT_URI || 'http://localhost:5000/api/auth/callback',

    // Scopes (permissions)
    scopes: (process.env.MS_SCOPES || 'openid profile email User.Read').split(' '),

    // Microsoft Graph API endpoint
    graphApiEndpoint: 'https://graph.microsoft.com/v1.0/me',

    // Frontend URL for redirect after authentication
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // OAuth endpoints (constructed)
    authorizationEndpoint: `${process.env.MS_AUTHORITY || 'https://login.microsoftonline.com/common'}/oauth2/v2.0/authorize`,
    tokenEndpoint: `${process.env.MS_AUTHORITY || 'https://login.microsoftonline.com/common'}/oauth2/v2.0/token`
};

/**
 * Validates Microsoft OAuth configuration
 * Ensures all required credentials are present
 *
 * @returns {Object} Validation result
 */
const validateMicrosoftConfig = () => {
    const required = {
        clientId: microsoftConfig.clientId,
        clientSecret: microsoftConfig.clientSecret
    };

    const missing = Object.keys(required).filter(key => !required[key]);

    if (missing.length > 0) {
        return {
            valid: false,
            missing,
            message: `Missing Microsoft OAuth credentials: ${missing.join(', ')}`
        };
    }

    return {
        valid: true,
        message: 'Microsoft OAuth configuration is valid'
    };
};

/**
 * Gets the full authorization URL for Microsoft OAuth
 *
 * @param {string} state - CSRF protection state parameter
 * @returns {string} Full authorization URL
 */
const getAuthorizationUrl = (state) => {
    const params = new URLSearchParams({
        client_id: microsoftConfig.clientId,
        response_type: 'code',
        redirect_uri: microsoftConfig.redirectUri,
        response_mode: 'query',
        scope: microsoftConfig.scopes.join(' '),
        state: state
    });

    return `${microsoftConfig.authorizationEndpoint}?${params.toString()}`;
};

module.exports = {
    microsoftConfig,
    validateMicrosoftConfig,
    getAuthorizationUrl
};
