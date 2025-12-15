/**
 * Print Receipt Utilities
 * Functions to print receipts using HTML window approach (similar to member cards)
 */

/**
 * Print receipts by creating a temporary HTML window
 * @param {Object} params - Print parameters
 * @param {Object} params.receiptData - Receipt data
 * @param {string} params.receiptType - Type of receipt (savings, affiliation, liquidation)
 */
export const printReceipt = ({ receiptData, receiptType }) => {
    // Create receipt HTML based on type
    let receiptHTML = '';

    if (receiptType === 'savings') {
        receiptHTML = createSavingsReceiptHTML(receiptData);
    } else if (receiptType === 'affiliation') {
        receiptHTML = createAffiliationReceiptHTML(receiptData);
    } else if (receiptType === 'liquidation') {
        receiptHTML = createLiquidationReceiptHTML(receiptData);
    }

    // Create temporary window for printing (opens as a new tab)
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Por favor permite las ventanas emergentes para imprimir');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recibo</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Courier New', monospace;
                    background: white;
                    padding: 20px;
                }

                @media print {
                    body {
                        padding: 0;
                    }

                    @page {
                        size: auto;
                        margin: 0.5cm;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
            </style>
        </head>
        <body>
            ${receiptHTML}
        </body>
        </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };
};

/**
 * Create HTML for savings receipt
 */
const createSavingsReceiptHTML = (data) => {
    const {
        transactionType = 'deposit',
        member = {},
        amount = 0,
        previousBalance = 0,
        newBalance = 0,
        description = '',
        transactionDate = new Date(),
        transactionId = ''
    } = data;

    const isDeposit = transactionType === 'deposit';
    const transactionLabel = isDeposit ? 'DEPOSITO' : 'RETIRO';
    const transactionColor = isDeposit ? '#16a34a' : '#dc2626';

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('es-CR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const printDate = new Date().toLocaleString('es-CR');

    return `
        <div style="max-width: 300px; margin: 0 auto; background: white; padding: 10px; color: #000;">
            <div style="border: 2px dashed #000; padding: 15px;">
                <!-- Header -->
                <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
                    <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">COOPESUMA R.L.</h1>
                    <div style="font-size: 11px; color: #666;">Cooperativa de Ahorro</div>
                    <div style="font-size: 11px; color: #666;">Sistema de Gestión</div>
                </div>

                <!-- Transaction Type -->
                <div style="text-align: center; padding: 8px; margin: 10px 0; background: ${transactionColor}; color: white; font-weight: bold; font-size: 14px; border-radius: 4px;">
                    RECIBO DE ${transactionLabel}
                </div>

                <!-- Receipt Details -->
                <div style="font-size: 11px; line-height: 1.6;">
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Fecha:</span>
                        <span style="text-align: right; max-width: 60%;">${formatDate(transactionDate)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Hora:</span>
                        <span style="text-align: right;">${formatTime(transactionDate)}</span>
                    </div>
                    ${transactionId ? `
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">N° Trans:</span>
                        <span style="text-align: right;">${transactionId}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Asociado:</span>
                        <span style="text-align: right;">${member.member_code || member.memberCode || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                        <span style="font-weight: bold; color: #333;">Nombre:</span>
                        <span style="text-align: right; max-width: 60%; word-break: break-word;">${member.full_name || member.fullName || 'N/A'}</span>
                    </div>
                </div>

                <!-- Amount Section -->
                <div style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px;">
                        <span>Saldo Anterior:</span>
                        <span style="font-family: 'Courier New', monospace;">${formatCurrency(previousBalance)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px;">
                        <span>${isDeposit ? 'Depósito:' : 'Retiro:'}</span>
                        <span style="font-family: 'Courier New', monospace; color: ${isDeposit ? '#16a34a' : '#dc2626'};">
                            ${isDeposit ? '+' : '-'}${formatCurrency(amount)}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-top: 2px solid #000; margin-top: 5px; padding-top: 8px; font-weight: bold; font-size: 13px;">
                        <span>Nuevo Saldo:</span>
                        <span style="font-family: 'Courier New', monospace;">${formatCurrency(newBalance)}</span>
                    </div>
                </div>

                ${description ? `
                <div style="margin: 10px 0; padding: 8px; background: #fafafa; border-left: 3px solid #666; font-size: 10px;">
                    <div style="font-weight: bold; margin-bottom: 3px;">Nota:</div>
                    <div>${description}</div>
                </div>
                ` : ''}

                <!-- Signature -->
                <div style="margin-top: 20px; padding-top: 10px;">
                    <div style="border-top: 1px solid #000; width: 80%; margin: 30px auto 5px;"></div>
                    <div style="text-align: center; font-size: 9px; color: #666;">Firma del Asociado</div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 9px; color: #666;">
                    <div style="font-size: 11px; font-weight: bold; color: #000; margin-bottom: 5px;">¡Gracias por su confianza!</div>
                    <div>Documento generado el ${printDate}</div>
                    <div>COOPESUMA R.L.</div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Create HTML for affiliation receipt
 */
const createAffiliationReceiptHTML = (data) => {
    const {
        member = {},
        amount = 500,
        receiptNumber = '',
        date = new Date(),
        fiscalYear = new Date().getFullYear()
    } = data;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    const formatDate = (dateValue) => {
        return new Date(dateValue).toLocaleDateString('es-CR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateValue) => {
        return new Date(dateValue).toLocaleTimeString('es-CR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const printDate = new Date().toLocaleString('es-CR');

    return `
        <div style="max-width: 300px; margin: 0 auto; background: white; padding: 10px; color: #000;">
            <div style="border: 2px dashed #000; padding: 15px;">
                <!-- Header -->
                <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
                    <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">COOPESUMA R.L.</h1>
                    <div style="font-size: 11px; color: #666;">Escuela Los Chiles, Aguas Zarcas</div>
                    <div style="font-size: 11px; color: #666;">Cooperativa Estudiantil</div>
                </div>

                <!-- Transaction Type -->
                <div style="text-align: center; padding: 8px; margin: 10px 0; background: #2563eb; color: white; font-weight: bold; font-size: 14px; border-radius: 4px;">
                    RECIBO DE AFILIACION
                </div>

                <!-- Receipt Details -->
                <div style="font-size: 11px; line-height: 1.6;">
                    ${receiptNumber ? `
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Recibo No:</span>
                        <span style="text-align: right;">${receiptNumber}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Fecha:</span>
                        <span style="text-align: right; max-width: 60%;">${formatDate(date)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                        <span style="font-weight: bold; color: #333;">Hora:</span>
                        <span style="text-align: right;">${formatTime(date)}</span>
                    </div>
                </div>

                <!-- Member Info -->
                <div style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Nombre:</span>
                        <span style="text-align: right; max-width: 60%;">${member.full_name || member.fullName || ''}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Cédula:</span>
                        <span style="text-align: right;">${member.identification || ''}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                        <span style="font-weight: bold; color: #333;">Código:</span>
                        <span style="text-align: right;">${member.member_code || member.memberCode || ''}</span>
                    </div>
                </div>

                <!-- Amount Section -->
                <div style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Concepto:</span>
                        <span style="text-align: right;">Cuota de Afiliación</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-top: 2px solid #000; margin-top: 5px; padding-top: 8px; font-weight: bold; font-size: 13px;">
                        <span>TOTAL:</span>
                        <span style="font-family: 'Courier New', monospace;">${formatCurrency(amount)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                        <span style="font-weight: bold; color: #333;">Año Fiscal:</span>
                        <span style="text-align: right;">${fiscalYear}</span>
                    </div>
                </div>

                <!-- Signature -->
                <div style="margin-top: 20px; padding-top: 10px;">
                    <div style="border-top: 1px solid #000; width: 200px; margin: 20px auto 5px;"></div>
                    <div style="text-align: center; font-size: 10px; color: #666;">Firma del Tesorero/Autorizado</div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 10px; color: #666;">
                    <div>Impreso: ${printDate}</div>
                    <div style="margin-top: 5px;">Sistema de Gestión CoopeSuma</div>
                    <div style="margin-top: 8px; font-size: 9px;">¡Bienvenido a la familia CoopeSuma!</div>
                </div>
            </div>
        </div>
    `;
};

/**
 * Create HTML for liquidation receipt
 */
const createLiquidationReceiptHTML = (data) => {
    const {
        member = {},
        liquidationType = 'periodic',
        totalAmount = 0,
        notes = '',
        liquidationDate = new Date(),
        liquidationId = '',
        receiptNumber = ''
    } = data;

    const typeLabel = liquidationType === 'periodic' ? 'PERIODICA' : 'POR RETIRO';
    const typeColor = liquidationType === 'periodic' ? '#2563eb' : '#dc2626';

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('es-CR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const printDate = new Date().toLocaleString('es-CR');

    return `
        <div style="max-width: 300px; margin: 0 auto; background: white; padding: 10px; color: #000;">
            <div style="border: 2px dashed #000; padding: 15px;">
                <!-- Header -->
                <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
                    <h1 style="font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">COOPESUMA R.L.</h1>
                    <div style="font-size: 11px; color: #666;">Cooperativa de Ahorro</div>
                    <div style="font-size: 11px; color: #666;">Sistema de Gestión</div>
                </div>

                <!-- Transaction Type -->
                <div style="text-align: center; padding: 8px; margin: 10px 0; background: ${typeColor}; color: white; font-weight: bold; font-size: 14px; border-radius: 4px;">
                    RECIBO DE LIQUIDACION ${typeLabel}
                </div>

                <!-- Receipt Details -->
                <div style="font-size: 11px; line-height: 1.6;">
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Fecha:</span>
                        <span style="text-align: right; max-width: 60%;">${formatDate(liquidationDate)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Hora:</span>
                        <span style="text-align: right;">${formatTime(liquidationDate)}</span>
                    </div>
                    ${receiptNumber ? `
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Recibo No:</span>
                        <span style="text-align: right;">${receiptNumber}</span>
                    </div>
                    ` : ''}
                    ${liquidationId ? `
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Liquidación:</span>
                        <span style="text-align: right;">#${liquidationId}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #ccc;">
                        <span style="font-weight: bold; color: #333;">Asociado:</span>
                        <span style="text-align: right;">${member.memberCode || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                        <span style="font-weight: bold; color: #333;">Nombre:</span>
                        <span style="text-align: right; max-width: 60%; word-break: break-word;">${member.fullName || 'N/A'}</span>
                    </div>
                </div>

                <!-- Amount Section -->
                <div style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; border-top: 2px solid #000; margin-top: 5px; padding-top: 8px; font-weight: bold; font-size: 13px;">
                        <span>Total Liquidado:</span>
                        <span style="font-family: 'Courier New', monospace; color: #16a34a;">${formatCurrency(totalAmount)}</span>
                    </div>
                    <div style="margin-top: 8px; font-size: 10px; text-align: center; color: #666;">(Cuenta de Ahorros)</div>
                </div>

                ${notes ? `
                <div style="margin: 10px 0; padding: 8px; background: #fafafa; border-left: 3px solid #666; font-size: 10px;">
                    <div style="font-weight: bold; margin-bottom: 3px;">Notas:</div>
                    <div>${notes}</div>
                </div>
                ` : ''}

                <!-- Info Banner -->
                <div style="margin: 15px 0; padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; font-size: 10px; text-align: center;">
                    <strong>${liquidationType === 'periodic' ? 'Liquidación Periódica' : 'Liquidación por Retiro'}</strong><br />
                    ${liquidationType === 'periodic' ? 'El asociado continúa activo en la cooperativa' : 'El asociado se retira de la cooperativa'}
                </div>

                <!-- Signature -->
                <div style="margin-top: 20px; padding-top: 10px;">
                    <div style="border-top: 1px solid #000; width: 80%; margin: 30px auto 5px;"></div>
                    <div style="text-align: center; font-size: 9px; color: #666;">Firma del Asociado</div>
                </div>

                <!-- Footer -->
                <div style="text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 15px; font-size: 9px; color: #666;">
                    <div style="font-size: 11px; font-weight: bold; color: #000; margin-bottom: 5px;">¡Gracias por su confianza!</div>
                    <div>Documento generado el ${printDate}</div>
                    <div>COOPESUMA R.L.</div>
                </div>
            </div>
        </div>
    `;
};
