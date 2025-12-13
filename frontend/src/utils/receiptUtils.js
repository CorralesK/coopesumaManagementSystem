/**
 * Receipt Utilities
 * Helper functions for receipt printing and PDF generation
 */

import { downloadPDFFromBackendPOST } from './printUtils';

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
        const filename = `recibo-${receiptData.transactionType}-${Date.now()}.pdf`;
        await downloadPDFFromBackendPOST('/savings/receipt/pdf', filename, receiptData);
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
        const filename = `recibo-afiliacion-${Date.now()}.pdf`;
        await downloadPDFFromBackendPOST('/members/receipt/affiliation/pdf', filename, receiptData);
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
        const filename = `recibo-liquidacion-${Date.now()}.pdf`;
        await downloadPDFFromBackendPOST('/members/receipt/liquidation/pdf', filename, receiptData);
    } catch (error) {
        console.error('Error downloading liquidation receipt PDF:', error);
        throw error;
    }
};
