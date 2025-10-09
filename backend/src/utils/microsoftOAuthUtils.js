/**
 * Microsoft OAuth Utilities
 * Helper functions for Microsoft OAuth 2.0 / OpenID Connect authentication
 *
 * @module utils/microsoftOAuthUtils
 */

const axios = require('axios');
const crypto = require('crypto');
const { microsoftConfig } = require('../config/microsoftConfig');
const logger = require('./logger');

/**
 * Generates a random state parameter for CSRF protection
 * State parameter is used to prevent CSRF attacks in OAuth flow
 *
 * @returns {string} Random state string
 */
const generateState = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Generates the Microsoft OAuth authorization URL
 * User should be redirected to this URL to begin OAuth flow
 *
 * @returns {Object} Authorization URL and state
 */
const generateAuthorizationUrl = () => {
    const state = generateState();

    const params = new URLSearchParams({
        client_id: microsoftConfig.clientId,
        response_type: 'code',
        redirect_uri: microsoftConfig.redirectUri,
        response_mode: 'query',
        scope: microsoftConfig.scopes.join(' '),
        state: state,
        prompt: 'select_account' // Always show account picker
    });

    const authorizationUrl = `${microsoftConfig.authorizationEndpoint}?${params.toString()}`;

    return {
        authorizationUrl,
        state
    };
};

/**
 * Exchanges authorization code for access token
 * This is step 2 of the OAuth flow, after user authorizes
 *
 * @param {string} code - Authorization code from Microsoft
 * @returns {Promise<Object>} Token response object
 */
const exchangeCodeForToken = async (code) => {
    try {
        const params = new URLSearchParams({
            client_id: microsoftConfig.clientId,
            client_secret: microsoftConfig.clientSecret,
            code: code,
            redirect_uri: microsoftConfig.redirectUri,
            grant_type: 'authorization_code',
            scope: microsoftConfig.scopes.join(' ')
        });

        logger.debug('Exchanging authorization code for token');

        const response = await axios.post(
            microsoftConfig.tokenEndpoint,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000 // 10 seconds timeout
            }
        );

        logger.info('Successfully exchanged code for access token');

        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in,
            tokenType: response.data.token_type,
            idToken: response.data.id_token
        };
    } catch (error) {
        logger.error('Error exchanging code for token:', {
            error: error.message,
            response: error.response?.data
        });

        throw new Error('Failed to exchange authorization code for access token');
    }
};

/**
 * Fetches user profile from Microsoft Graph API
 * Retrieves user information like email, name, and Microsoft ID
 *
 * @param {string} accessToken - Microsoft access token
 * @returns {Promise<Object>} User profile object
 */
const getUserProfile = async (accessToken) => {
    try {
        logger.debug('Fetching user profile from Microsoft Graph API');

        const response = await axios.get(
            microsoftConfig.graphApiEndpoint,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 seconds timeout
            }
        );

        logger.info('Successfully fetched user profile', {
            email: response.data.mail || response.data.userPrincipalName
        });

        // Microsoft Graph API returns user profile
        return {
            microsoftId: response.data.id,
            email: response.data.mail || response.data.userPrincipalName,
            displayName: response.data.displayName,
            givenName: response.data.givenName,
            surname: response.data.surname,
            jobTitle: response.data.jobTitle,
            officeLocation: response.data.officeLocation
        };
    } catch (error) {
        logger.error('Error fetching user profile:', {
            error: error.message,
            response: error.response?.data
        });

        throw new Error('Failed to fetch user profile from Microsoft');
    }
};

/**
 * Validates OAuth state parameter for CSRF protection
 * Compares received state with stored state
 *
 * @param {string} receivedState - State parameter from OAuth callback
 * @param {string} storedState - State parameter stored in session/cookie
 * @returns {boolean} True if states match
 */
const validateState = (receivedState, storedState) => {
    if (!receivedState || !storedState) {
        logger.warn('Missing state parameter in OAuth callback');
        return false;
    }

    if (receivedState !== storedState) {
        logger.warn('State mismatch in OAuth callback - possible CSRF attack');
        return false;
    }

    return true;
};

/**
 * Complete OAuth flow: exchange code for token and fetch user profile
 * This combines steps 2 and 3 of OAuth flow
 *
 * @param {string} code - Authorization code
 * @returns {Promise<Object>} User profile with tokens
 */
const completeOAuthFlow = async (code) => {
    try {
        // Step 1: Exchange code for access token
        const tokenData = await exchangeCodeForToken(code);

        // Step 2: Fetch user profile using access token
        const userProfile = await getUserProfile(tokenData.accessToken);

        // Return combined data
        return {
            ...userProfile,
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            expiresIn: tokenData.expiresIn
        };
    } catch (error) {
        logger.error('Error completing OAuth flow:', error.message);
        throw error;
    }
};

/**
 * Decodes JWT ID token (basic decoding, no verification)
 * This is for reading claims only, NOT for security validation
 *
 * @param {string} idToken - JWT ID token
 * @returns {Object} Decoded token payload
 */
const decodeIdToken = (idToken) => {
    try {
        const parts = idToken.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }

        const payload = Buffer.from(parts[1], 'base64').toString('utf8');
        return JSON.parse(payload);
    } catch (error) {
        logger.error('Error decoding ID token:', error.message);
        throw new Error('Failed to decode ID token');
    }
};

module.exports = {
    generateState,
    generateAuthorizationUrl,
    exchangeCodeForToken,
    getUserProfile,
    validateState,
    completeOAuthFlow,
    decodeIdToken
};
