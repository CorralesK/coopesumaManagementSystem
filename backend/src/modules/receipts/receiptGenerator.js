/**
 * Receipt Generator
 * Generates PDF receipts using PDFKit
 * Receipts are generated in memory and streamed directly without saving to disk
 * All receipts use standardized format optimized for black and white printing
 */

const PDFDocument = require('pdfkit');
const logger = require('../../utils/logger');

/**
 * Format currency
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2
    }).format(amount);
};

/**
 * Format date
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Generate receipt header
 */
const generateHeader = (doc) => {
    doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('COOPESUMA R.L.', 50, 50, { align: 'center' })
        .fontSize(10)
        .font('Helvetica')
        .text('Escuela Los Chiles, Aguas Zarcas', { align: 'center' })
        .text('Cooperativa Estudiantil', { align: 'center' })
        .moveDown();
};

/**
 * Generate receipt footer
 */
const generateFooter = (doc) => {
    const bottomY = doc.page.height - 100;

    doc
        .fontSize(8)
        .font('Helvetica')
        .text('_'.repeat(60), 50, bottomY, { align: 'center' })
        .moveDown(0.5)
        .text('Firma del Tesorero/Autorizado', { align: 'center' })
        .moveDown(2)
        .fontSize(7)
        .text(`Generado electrónicamente el ${formatDate(new Date())}`, { align: 'center' })
        .text('Sistema de Gestión CoopeSuma', { align: 'center' });
};

/**
 * Draw a table row with label and value
 */
const drawTableRow = (doc, y, label, value, options = {}) => {
    const leftX = options.leftX || 70;
    const rightX = options.rightX || 400;
    const fontSize = options.fontSize || 11;
    const bold = options.bold || false;
    const lineAfter = options.lineAfter || false;

    doc.fontSize(fontSize);

    // Label
    if (bold) {
        doc.font('Helvetica-Bold').text(label, leftX, y);
    } else {
        doc.font('Helvetica').text(label, leftX, y);
    }

    // Value (aligned to the right)
    if (bold) {
        doc.font('Helvetica-Bold').text(value, rightX, y, { align: 'right', width: 150 });
    } else {
        doc.font('Helvetica').text(value, rightX, y, { align: 'right', width: 150 });
    }

    // Optional line after row
    if (lineAfter) {
        doc.moveTo(leftX, y + 18).lineTo(550, y + 18).stroke();
    }

    return y + 25;
};

/**
 * Generate standardized receipt with table format
 */
const generateStandardizedReceipt = (receiptData, title) => {
    const doc = new PDFDocument({ margin: 50 });

    // Header
    generateHeader(doc);

    // Title and Receipt Number
    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(title, { align: 'center' })
        .moveDown(0.5)
        .fontSize(12)
        .text(`Recibo No. ${receiptData.receiptNumber}`, { align: 'center' })
        .moveDown(2);

    // Draw border box
    const boxTop = doc.y;
    doc.rect(50, boxTop, 512, 0).stroke(); // Top line

    let currentY = boxTop + 15;

    // Member Information Section
    doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL ASOCIADO', 70, currentY);
    currentY += 20;

    currentY = drawTableRow(doc, currentY, 'Nombre:', receiptData.memberName);
    currentY = drawTableRow(doc, currentY, 'Cédula:', receiptData.identification);
    currentY = drawTableRow(doc, currentY, 'Código de Asociado:', receiptData.memberCode, { lineAfter: true });

    currentY += 5;

    // Transaction Details Section
    doc.fontSize(10).font('Helvetica-Bold').text('DETALLES DE LA TRANSACCIÓN', 70, currentY);
    currentY += 20;

    currentY = drawTableRow(doc, currentY, 'Concepto:', receiptData.concept);
    currentY = drawTableRow(doc, currentY, 'Fecha:', formatDate(receiptData.date));

    // Add specific fields based on receipt type
    if (receiptData.previousBalance !== undefined && receiptData.newBalance !== undefined) {
        currentY = drawTableRow(doc, currentY, 'Saldo Anterior:', formatCurrency(receiptData.previousBalance));
        currentY = drawTableRow(doc, currentY, 'Saldo Nuevo:', formatCurrency(receiptData.newBalance));
    }

    if (receiptData.fiscalYear) {
        currentY = drawTableRow(doc, currentY, 'Año Fiscal:', receiptData.fiscalYear.toString());
    }

    currentY = drawTableRow(doc, currentY, '', '', { lineAfter: true });
    currentY += 5;

    // Amount Section (highlighted)
    currentY = drawTableRow(doc, currentY, 'MONTO TOTAL:', formatCurrency(receiptData.amount), {
        fontSize: 14,
        bold: true
    });

    // Close border box
    const boxBottom = currentY + 10;
    doc.rect(50, boxTop, 512, boxBottom - boxTop).stroke();

    // Footer
    generateFooter(doc);

    doc.end();
    return doc;
};

/**
 * Generate affiliation receipt
 */
const generateAffiliationReceipt = (receiptData) => {
    return generateStandardizedReceipt({
        ...receiptData,
        concept: 'Cuota de Afiliación'
    }, 'RECIBO DE AFILIACIÓN');
};

/**
 * Generate savings deposit receipt
 */
const generateSavingsDepositReceipt = (receiptData) => {
    return generateStandardizedReceipt({
        ...receiptData,
        concept: 'Depósito de Ahorros'
    }, 'RECIBO DE DEPÓSITO - AHORROS');
};

/**
 * Generate contribution receipt
 */
const generateContributionReceipt = (receiptData) => {
    const tractInfo = receiptData.tractInfo ? ` - ${receiptData.tractInfo}` : '';
    return generateStandardizedReceipt({
        ...receiptData,
        concept: `Aportación${tractInfo}`
    }, 'RECIBO DE APORTACIÓN');
};

/**
 * Generate withdrawal receipt
 */
const generateWithdrawalReceipt = (receiptData) => {
    const accountTypeLabel = receiptData.accountType === 'savings' ? 'AHORROS' : 'EXCEDENTES';
    return generateStandardizedReceipt({
        ...receiptData,
        concept: `Retiro de ${accountTypeLabel}`
    }, `RECIBO DE RETIRO - ${accountTypeLabel}`);
};

/**
 * Generate transfer receipt (surplus to savings)
 */
const generateTransferReceipt = (receiptData) => {
    const doc = new PDFDocument({ margin: 50 });

    // Header
    generateHeader(doc);

    // Title and Receipt Number
    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('COMPROBANTE DE TRANSFERENCIA', { align: 'center' })
        .moveDown(0.5)
        .fontSize(12)
        .text(`Recibo No. ${receiptData.receiptNumber}`, { align: 'center' })
        .moveDown(2);

    // Draw border box
    const boxTop = doc.y;
    doc.rect(50, boxTop, 512, 0).stroke();

    let currentY = boxTop + 15;

    // Member Information
    doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL ASOCIADO', 70, currentY);
    currentY += 20;

    currentY = drawTableRow(doc, currentY, 'Nombre:', receiptData.memberName);
    currentY = drawTableRow(doc, currentY, 'Cédula:', receiptData.identification);
    currentY = drawTableRow(doc, currentY, 'Código de Asociado:', receiptData.memberCode, { lineAfter: true });

    currentY += 5;

    // Transaction Details
    doc.fontSize(10).font('Helvetica-Bold').text('DETALLES DE LA TRANSFERENCIA', 70, currentY);
    currentY += 20;

    currentY = drawTableRow(doc, currentY, 'Concepto:', 'Transferencia de Excedentes a Ahorros');
    currentY = drawTableRow(doc, currentY, 'Fecha:', formatDate(receiptData.date));
    currentY = drawTableRow(doc, currentY, '', '', { lineAfter: true });

    currentY += 5;

    // Account Origin
    doc.fontSize(10).font('Helvetica-Bold').text('CUENTA ORIGEN: Excedentes', 70, currentY);
    currentY += 20;

    currentY = drawTableRow(doc, currentY, 'Saldo Anterior:', formatCurrency(receiptData.surplusPrevBalance));
    currentY = drawTableRow(doc, currentY, 'Saldo Nuevo:', formatCurrency(receiptData.surplusNewBalance), { lineAfter: true });

    currentY += 5;

    // Account Destination
    doc.fontSize(10).font('Helvetica-Bold').text('CUENTA DESTINO: Ahorros', 70, currentY);
    currentY += 20;

    currentY = drawTableRow(doc, currentY, 'Saldo Anterior:', formatCurrency(receiptData.savingsPrevBalance));
    currentY = drawTableRow(doc, currentY, 'Saldo Nuevo:', formatCurrency(receiptData.savingsNewBalance), { lineAfter: true });

    currentY += 5;

    // Total Amount
    currentY = drawTableRow(doc, currentY, 'MONTO TRANSFERIDO:', formatCurrency(receiptData.amount), {
        fontSize: 14,
        bold: true
    });

    // Close border box
    const boxBottom = currentY + 10;
    doc.rect(50, boxTop, 512, boxBottom - boxTop).stroke();

    // Footer
    generateFooter(doc);

    doc.end();
    return doc;
};

/**
 * Generate liquidation receipt
 */
const generateLiquidationReceipt = (receiptData) => {
    const doc = new PDFDocument({ margin: 50 });

    // Header
    generateHeader(doc);

    const reasonLabel = receiptData.reason === 'periodic' ?
        'Liquidación Periódica (6 años)' :
        'Liquidación por Retiro de Cooperativa';

    // Title and Receipt Number
    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('RECIBO DE LIQUIDACIÓN', { align: 'center' })
        .moveDown(0.5)
        .fontSize(12)
        .text(`Recibo No. ${receiptData.receiptNumber}`, { align: 'center' })
        .moveDown(2);

    // Draw border box
    const boxTop = doc.y;
    doc.rect(50, boxTop, 512, 0).stroke();

    let currentY = boxTop + 15;

    // Member Information
    doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL ASOCIADO', 70, currentY);
    currentY += 20;

    currentY = drawTableRow(doc, currentY, 'Nombre:', receiptData.memberName);
    currentY = drawTableRow(doc, currentY, 'Cédula:', receiptData.identification);
    currentY = drawTableRow(doc, currentY, 'Código de Asociado:', receiptData.memberCode, { lineAfter: true });

    currentY += 5;

    // Liquidation Details
    doc.fontSize(10).font('Helvetica-Bold').text('DETALLES DE LA LIQUIDACIÓN', 70, currentY);
    currentY += 20;

    currentY = drawTableRow(doc, currentY, 'Concepto:', reasonLabel);
    currentY = drawTableRow(doc, currentY, 'Fecha:', formatDate(receiptData.date));
    currentY = drawTableRow(doc, currentY, '', '', { lineAfter: true });

    currentY += 5;

    // Breakdown
    doc.fontSize(10).font('Helvetica-Bold').text('DESGLOSE DE CUENTAS', 70, currentY);
    currentY += 20;

    currentY = drawTableRow(doc, currentY, 'Cuenta de Ahorros:', formatCurrency(receiptData.savingsAmount));

    // Future accounts (commented for now)
    // currentY = drawTableRow(doc, currentY, 'Cuenta de Aportaciones:', formatCurrency(receiptData.contributionsAmount || 0));
    // currentY = drawTableRow(doc, currentY, 'Cuenta de Excedentes:', formatCurrency(receiptData.surplusAmount || 0));

    currentY = drawTableRow(doc, currentY, '', '', { lineAfter: true });
    currentY += 5;

    // Total Amount
    currentY = drawTableRow(doc, currentY, 'TOTAL LIQUIDADO:', formatCurrency(receiptData.totalAmount), {
        fontSize: 14,
        bold: true
    });

    // Close border box
    const boxBottom = currentY + 10;
    doc.rect(50, boxTop, 512, boxBottom - boxTop).stroke();

    // Footer
    generateFooter(doc);

    doc.end();
    return doc;
};

/**
 * Generate receipt PDF document based on type
 * Returns a PDFDocument stream ready to be piped to response
 *
 * @param {string} type - Receipt type (affiliation, savings_deposit, etc.)
 * @param {Object} data - Receipt data
 * @returns {PDFDocument} PDF document stream
 */
const generateReceiptPDF = (type, data) => {
    try {
        let doc;

        switch (type) {
            case 'affiliation':
                doc = generateAffiliationReceipt(data);
                break;
            case 'savings_deposit':
                doc = generateSavingsDepositReceipt(data);
                break;
            case 'savings_withdrawal':
            case 'surplus_withdrawal':
                doc = generateWithdrawalReceipt(data);
                break;
            case 'contribution':
                doc = generateContributionReceipt(data);
                break;
            case 'surplus_to_savings':
                doc = generateTransferReceipt(data);
                break;
            case 'liquidation':
                doc = generateLiquidationReceipt(data);
                break;
            default:
                throw new Error(`Unknown receipt type: ${type}`);
        }

        logger.info('Receipt PDF generated in memory', { type });
        return doc;

    } catch (error) {
        logger.error('Error generating receipt PDF:', error);
        throw error;
    }
};

module.exports = {
    generateReceiptPDF
};
