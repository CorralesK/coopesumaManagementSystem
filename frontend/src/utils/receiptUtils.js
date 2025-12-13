/**
 * Receipt Utilities
 * Helper functions for receipt printing and PDF generation
 */

import api from '../services/api';

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * Download savings receipt PDF
 * @param {Object} receiptData - Receipt data
 */
export const downloadSavingsReceiptPDF = async (receiptData) => {
    try {
        const response = await api.post('/savings/receipt/pdf', receiptData, {
            responseType: 'blob'
        });

        // response.data is already a Blob, no need to wrap it again
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recibo-${receiptData.transactionType}-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading savings receipt PDF:', error);
        throw error;
    }
};

/**
 * Download affiliation receipt PDF
 * @param {Object} receiptData - Receipt data
 */
export const downloadAffiliationReceiptPDF = async (receiptData) => {
    try {
        const response = await api.post('/members/receipt/affiliation/pdf', receiptData, {
            responseType: 'blob'
        });

        // response.data is already a Blob, no need to wrap it again
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recibo-afiliacion-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading affiliation receipt PDF:', error);
        throw error;
    }
};

/**
 * Download liquidation receipt PDF
 * @param {Object} receiptData - Receipt data
 */
export const downloadLiquidationReceiptPDF = async (receiptData) => {
    try {
        const response = await api.post('/members/receipt/liquidation/pdf', receiptData, {
            responseType: 'blob'
        });

        // response.data is already a Blob, no need to wrap it again
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recibo-liquidacion-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading liquidation receipt PDF:', error);
        throw error;
    }
};
