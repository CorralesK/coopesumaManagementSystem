/**
 * @file memberService.js
 * @description Service for member-related API calls
 * @module services/memberService
 */

import api from './api';

/**
 * Get all members with optional filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term
 * @param {string} params.grade - Filter by grade
 * @param {string} params.isActive - Filter by active status
 * @returns {Promise<Object>} Response with data and pagination info
 */
export const getAllMembers = async (params = {}) => {
    const response = await api.get('/members', { params });
    return response;
};

/**
 * Get a single member by ID
 * @param {string} memberId - Member ID
 * @returns {Promise<Object>} Member data
 */
export const getMemberById = async (memberId) => {
    const response = await api.get(`/members/${memberId}`);
    return response;
};

/**
 * Create a new member
 * @param {Object} memberData - Member data
 * @param {string} memberData.fullName - Full name
 * @param {string} memberData.identification - Identification number
 * @param {string} memberData.institutionalEmail - Institutional email
 * @param {number} memberData.grade - Grade level
 * @param {string} memberData.photoUrl - Photo URL (optional)
 * @returns {Promise<Object>} Created member data
 */
export const createMember = async (memberData) => {
    const response = await api.post('/members', memberData);
    return response;
};

/**
 * Update an existing member
 * @param {string} memberId - Member ID
 * @param {Object} memberData - Updated member data
 * @returns {Promise<Object>} Updated member data
 */
export const updateMember = async (memberId, memberData) => {
    const response = await api.put(`/members/${memberId}`, memberData);
    return response;
};

/**
 * Deactivate a member (soft delete)
 * @param {string} memberId - Member ID
 * @returns {Promise<Object>} Response message
 */
export const deactivateMember = async (memberId) => {
    const response = await api.delete(`/members/${memberId}`);
    return response;
};

/**
 * Regenerate QR code for a member
 * @param {string} memberId - Member ID
 * @returns {Promise<Object>} New QR code data
 */
export const regenerateMemberQR = async (memberId) => {
    const response = await api.post(`/members/${memberId}/qr/regenerate`);
    return response;
};

/**
 * Get member QR code
 * @param {string} memberId - Member ID
 * @returns {Promise<Object>} QR code data
 */
export const getMemberQR = async (memberId) => {
    const response = await api.get(`/members/${memberId}/qr`);
    return response;
};

/**
 * Batch generate QR codes for multiple members
 * @param {Array<string>} memberIds - Array of member IDs
 * @returns {Promise<Object>} Batch QR codes data
 */
export const batchGenerateQRCodes = async (memberIds) => {
    const response = await api.post('/members/qr/batch', { memberIds });
    return response;
};
