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
 * @param {number} params.qualityId - Filter by quality ID
 * @param {number} params.levelId - Filter by level ID
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
 * Affiliate a new member (includes ₡500 affiliation fee + receipt generation)
 * Supports both JSON and FormData (for file uploads)
 * @param {Object|FormData} memberData - Member data (Object or FormData with photo file)
 * @returns {Promise<Object>} Created member data with receipt info
 */
export const affiliateMember = async (memberData) => {
    // Check if memberData is FormData (for file uploads)
    const isFormData = memberData instanceof FormData;

    const config = isFormData ? {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    } : {};

    const response = await api.post('/members/affiliate', memberData, config);
    return response;
};

/**
 * Create a new member (DEPRECATED - Use affiliateMember instead)
 * @param {Object} memberData - Member data
 * @param {string} memberData.fullName - Full name
 * @param {string} memberData.identification - Identification number
 * @param {string} memberData.institutionalEmail - Institutional email
 * @param {number} memberData.qualityId - Quality ID (1=Student, 2=Employee)
 * @param {number} memberData.levelId - Level ID (optional for employees)
 * @param {string} memberData.gender - Gender (M/F) (optional)
 * @param {string} memberData.memberCode - Member code (optional)
 * @param {string} memberData.photoUrl - Photo URL (optional)
 * @returns {Promise<Object>} Created member data
 */
export const createMember = async (memberData) => {
    const response = await api.post('/members', memberData);
    return response;
};

/**
 * Update an existing member
 * Supports both JSON and FormData (for file uploads)
 * @param {string} memberId - Member ID
 * @param {Object|FormData} memberData - Updated member data (Object or FormData with photo file)
 * @returns {Promise<Object>} Updated member data
 */
export const updateMember = async (memberId, memberData) => {
    // Check if memberData is FormData (for file uploads)
    const isFormData = memberData instanceof FormData;

    const config = isFormData ? {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    } : {};

    const response = await api.put(`/members/${memberId}`, memberData, config);
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

/**
 * Verify member by QR hash (for attendance confirmation)
 * @param {string} qrHash - QR hash to verify
 * @returns {Promise<Object>} Member data
 */
export const verifyMemberByQR = async (qrHash) => {
    const response = await api.post('/members/qr/verify', { qrHash });
    return response;
};

/**
 * Download member cards PDF for batch printing (mobile devices)
 * @param {Array<number>} memberIds - Array of member IDs
 * @returns {Promise<void>}
 */
export const downloadMemberCardsPDF = async (memberIds) => {
    const baseURL = api.defaults.baseURL;
    const token = sessionStorage.getItem('token');
    const fullURL = `${baseURL}/members/cards/pdf`;

    try {
        const response = await fetch(fullURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/pdf'
            },
            body: JSON.stringify({ memberIds })
        });

        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.text();
                const jsonError = JSON.parse(errorData);
                errorMessage = jsonError.message || jsonError.error || errorMessage;
            } catch {
                // Ignore parse error
            }
            throw new Error(errorMessage);
        }

        const blob = await response.blob();

        if (blob.size < 100) {
            throw new Error('El servidor devolvio un PDF vacio o invalido');
        }

        const url = window.URL.createObjectURL(blob);

        // For iOS Safari, open in new window
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.open(url, '_blank');
        } else {
            // Android/other - trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `carnets-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Cleanup after delay
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error) {
        console.error('Error downloading member cards PDF:', error);
        throw error;
    }
};
