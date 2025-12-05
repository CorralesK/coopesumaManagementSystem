/**
 * Receipt Generator
 * Generates PDF receipts using PDFKit
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

/**
 * Ensure receipts directory exists
 */
const ensureReceiptsDirectory = () => {
    const receiptsDir = path.join(__dirname, '../../../receipts');
    if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
    }
    return receiptsDir;
};

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
 * Generate affiliation receipt
 */
const generateAffiliationReceipt = async (receiptData) => {
    const doc = new PDFDocument({ margin: 50 });
    const receiptsDir = ensureReceiptsDirectory();
    const filename = `receipt-${receiptData.receiptNumber}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    generateHeader(doc);

    // Title
    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('RECIBO DE AFILIACIÓN', { align: 'center' })
        .moveDown()
        .fontSize(12)
        .text(`No. ${receiptData.receiptNumber}`, { align: 'center' })
        .moveDown(2);

    // Body
    doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Recibimos de: ${receiptData.memberName}`, 50)
        .moveDown(0.5)
        .text(`Cédula: ${receiptData.identification}`)
        .moveDown(0.5)
        .text(`Código de Asociado: ${receiptData.memberCode}`)
        .moveDown(0.5)
        .text(`Concepto: Cuota de Afiliación`)
        .moveDown(0.5)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Monto: ${formatCurrency(receiptData.amount)}`)
        .moveDown(0.5)
        .fontSize(11)
        .font('Helvetica')
        .text(`Fecha: ${formatDate(receiptData.date)}`)
        .moveDown(0.5)
        .text(`Año Fiscal: ${receiptData.fiscalYear}`);

    // Footer
    generateFooter(doc);

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
};

/**
 * Generate savings deposit receipt
 */
const generateSavingsDepositReceipt = async (receiptData) => {
    const doc = new PDFDocument({ margin: 50 });
    const receiptsDir = ensureReceiptsDirectory();
    const filename = `receipt-${receiptData.receiptNumber}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    generateHeader(doc);

    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('RECIBO DE DEPÓSITO - AHORROS', { align: 'center' })
        .moveDown()
        .fontSize(12)
        .text(`No. ${receiptData.receiptNumber}`, { align: 'center' })
        .moveDown(2);

    doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Recibimos de: ${receiptData.memberName}`, 50)
        .moveDown(0.5)
        .text(`Cédula: ${receiptData.identification}`)
        .moveDown(0.5)
        .text(`Código de Asociado: ${receiptData.memberCode}`)
        .moveDown(0.5)
        .text(`Concepto: Depósito de Ahorros`)
        .moveDown(0.5)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Monto: ${formatCurrency(receiptData.amount)}`)
        .moveDown(0.5)
        .fontSize(11)
        .font('Helvetica')
        .text(`Fecha: ${formatDate(receiptData.date)}`)
        .moveDown(0.5)
        .text(`Saldo Anterior: ${formatCurrency(receiptData.previousBalance)}`)
        .moveDown(0.5)
        .text(`Nuevo Saldo: ${formatCurrency(receiptData.newBalance)}`);

    generateFooter(doc);
    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
};

/**
 * Generate contribution receipt
 */
const generateContributionReceipt = async (receiptData) => {
    const doc = new PDFDocument({ margin: 50 });
    const receiptsDir = ensureReceiptsDirectory();
    const filename = `receipt-${receiptData.receiptNumber}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    generateHeader(doc);

    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('RECIBO DE APORTACIÓN', { align: 'center' })
        .moveDown()
        .fontSize(12)
        .text(`No. ${receiptData.receiptNumber}`, { align: 'center' })
        .moveDown(2);

    doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Recibimos de: ${receiptData.memberName}`, 50)
        .moveDown(0.5)
        .text(`Cédula: ${receiptData.identification}`)
        .moveDown(0.5)
        .text(`Código de Asociado: ${receiptData.memberCode}`)
        .moveDown(0.5)
        .text(`Concepto: Aportación ${receiptData.tractInfo || ''}`)
        .moveDown(0.5)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Monto: ${formatCurrency(receiptData.amount)}`)
        .moveDown(0.5)
        .fontSize(11)
        .font('Helvetica')
        .text(`Fecha: ${formatDate(receiptData.date)}`)
        .moveDown(0.5)
        .text(`Año Fiscal: ${receiptData.fiscalYear}`);

    generateFooter(doc);
    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
};

/**
 * Generate withdrawal receipt
 */
const generateWithdrawalReceipt = async (receiptData) => {
    const doc = new PDFDocument({ margin: 50 });
    const receiptsDir = ensureReceiptsDirectory();
    const filename = `receipt-${receiptData.receiptNumber}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    generateHeader(doc);

    const accountTypeLabel = receiptData.accountType === 'savings' ? 'AHORROS' : 'EXCEDENTES';

    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`RECIBO DE RETIRO - ${accountTypeLabel}`, { align: 'center' })
        .moveDown()
        .fontSize(12)
        .text(`No. ${receiptData.receiptNumber}`, { align: 'center' })
        .moveDown(2);

    doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Entregamos a: ${receiptData.memberName}`, 50)
        .moveDown(0.5)
        .text(`Cédula: ${receiptData.identification}`)
        .moveDown(0.5)
        .text(`Código de Asociado: ${receiptData.memberCode}`)
        .moveDown(0.5)
        .text(`Concepto: Retiro de ${accountTypeLabel}`)
        .moveDown(0.5)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Monto: ${formatCurrency(receiptData.amount)}`)
        .moveDown(0.5)
        .fontSize(11)
        .font('Helvetica')
        .text(`Fecha: ${formatDate(receiptData.date)}`)
        .moveDown(0.5)
        .text(`Saldo Anterior: ${formatCurrency(receiptData.previousBalance)}`)
        .moveDown(0.5)
        .text(`Nuevo Saldo: ${formatCurrency(receiptData.newBalance)}`);

    generateFooter(doc);
    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
};

/**
 * Generate transfer receipt (surplus to savings)
 */
const generateTransferReceipt = async (receiptData) => {
    const doc = new PDFDocument({ margin: 50 });
    const receiptsDir = ensureReceiptsDirectory();
    const filename = `receipt-${receiptData.receiptNumber}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    generateHeader(doc);

    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('COMPROBANTE DE TRANSFERENCIA', { align: 'center' })
        .moveDown()
        .fontSize(12)
        .text(`No. ${receiptData.receiptNumber}`, { align: 'center' })
        .moveDown(2);

    doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Miembro: ${receiptData.memberName}`, 50)
        .moveDown(0.5)
        .text(`Cédula: ${receiptData.identification}`)
        .moveDown(0.5)
        .text(`Código de Asociado: ${receiptData.memberCode}`)
        .moveDown(0.5)
        .text(`Concepto: Transferencia de Excedentes a Ahorros`)
        .moveDown(0.5)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Monto Transferido: ${formatCurrency(receiptData.amount)}`)
        .moveDown(0.5)
        .fontSize(11)
        .font('Helvetica')
        .text(`Fecha: ${formatDate(receiptData.date)}`)
        .moveDown(1)
        .fontSize(10)
        .text('Cuenta Origen: Excedentes')
        .text(`Saldo Anterior: ${formatCurrency(receiptData.surplusPrevBalance)}`)
        .text(`Nuevo Saldo: ${formatCurrency(receiptData.surplusNewBalance)}`)
        .moveDown(0.5)
        .text('Cuenta Destino: Ahorros')
        .text(`Saldo Anterior: ${formatCurrency(receiptData.savingsPrevBalance)}`)
        .text(`Nuevo Saldo: ${formatCurrency(receiptData.savingsNewBalance)}`);

    generateFooter(doc);
    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
};

/**
 * Generate liquidation receipt
 */
const generateLiquidationReceipt = async (receiptData) => {
    const doc = new PDFDocument({ margin: 50 });
    const receiptsDir = ensureReceiptsDirectory();
    const filename = `receipt-${receiptData.receiptNumber}.pdf`;
    const filepath = path.join(receiptsDir, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    generateHeader(doc);

    const reasonLabel = receiptData.reason === 'time' ?
        'Liquidación por Tiempo Cumplido (6 años)' :
        'Liquidación por Retiro de Cooperativa';

    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('RECIBO DE LIQUIDACIÓN', { align: 'center' })
        .moveDown()
        .fontSize(12)
        .text(`No. ${receiptData.receiptNumber}`, { align: 'center' })
        .moveDown(2);

    doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Entregamos a: ${receiptData.memberName}`, 50)
        .moveDown(0.5)
        .text(`Cédula: ${receiptData.identification}`)
        .moveDown(0.5)
        .text(`Código de Asociado: ${receiptData.memberCode}`)
        .moveDown(0.5)
        .text(`Concepto: ${reasonLabel}`)
        .moveDown(0.5)
        .text(`Fecha: ${formatDate(receiptData.date)}`)
        .moveDown(1.5);

    // Desglose
    doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('DESGLOSE DE LIQUIDACIÓN:', 50)
        .moveDown(0.5)
        .fontSize(11)
        .font('Helvetica');

    const tableTop = doc.y;
    const itemLeft = 70;
    const amountLeft = 400;

    doc.text('Cuenta de Ahorros:', itemLeft, tableTop);
    doc.text(formatCurrency(receiptData.savingsAmount), amountLeft, tableTop, { align: 'right', width: 150 });

    doc.text('Cuenta de Aportaciones:', itemLeft, tableTop + 20);
    doc.text(formatCurrency(receiptData.contributionsAmount), amountLeft, tableTop + 20, { align: 'right', width: 150 });

    doc.text('Cuenta de Excedentes:', itemLeft, tableTop + 40);
    doc.text(formatCurrency(receiptData.surplusAmount), amountLeft, tableTop + 40, { align: 'right', width: 150 });

    // Line
    doc.moveTo(itemLeft, tableTop + 60).lineTo(550, tableTop + 60).stroke();

    // Total
    doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('TOTAL LIQUIDADO:', itemLeft, tableTop + 70);
    doc.text(formatCurrency(receiptData.totalAmount), amountLeft, tableTop + 70, { align: 'right', width: 150 });

    generateFooter(doc);
    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
};

/**
 * Main function to generate receipt based on type
 */
const generateReceipt = async (type, data) => {
    try {
        let filepath;

        switch (type) {
            case 'affiliation':
                filepath = await generateAffiliationReceipt(data);
                break;
            case 'savings_deposit':
                filepath = await generateSavingsDepositReceipt(data);
                break;
            case 'savings_withdrawal':
            case 'surplus_withdrawal':
                filepath = await generateWithdrawalReceipt(data);
                break;
            case 'contribution':
                filepath = await generateContributionReceipt(data);
                break;
            case 'surplus_to_savings':
                filepath = await generateTransferReceipt(data);
                break;
            case 'liquidation':
                filepath = await generateLiquidationReceipt(data);
                break;
            default:
                throw new Error(`Unknown receipt type: ${type}`);
        }

        logger.info('Receipt PDF generated', { type, filepath });
        return filepath;

    } catch (error) {
        logger.error('Error generating receipt PDF:', error);
        throw error;
    }
};

module.exports = {
    generateReceipt
};