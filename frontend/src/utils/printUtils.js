/**
 * @file printUtils.js
 * @description Utility functions for printing documents
 * @module utils/printUtils
 */

import api from '../services/api';

/**
 * Check if the current device is mobile
 * @returns {boolean} True if mobile device
 */
const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * Download PDF from backend endpoint
 * @param {string} endpoint - API endpoint path
 * @param {string} filename - Filename for the PDF
 */
const downloadPDFFromBackend = async (endpoint, filename) => {
    // Get the base URL from the api instance
    const baseURL = api.defaults.baseURL;
    const token = localStorage.getItem('token');
    const fullURL = `${baseURL}${endpoint}`;

    // Log the URL for debugging
    console.log('=== PDF Download Debug Info ===');
    console.log('Base URL:', baseURL);
    console.log('Endpoint:', endpoint);
    console.log('Full URL:', fullURL);
    console.log('Token present:', !!token);

    try {
        // Use fetch directly for better control over the response
        const response = await fetch(fullURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.text();
                console.error('Server error response:', errorData);
                // Try to parse as JSON for better error message
                try {
                    const jsonError = JSON.parse(errorData);
                    errorMessage = jsonError.message || jsonError.error || errorMessage;
                } catch {
                    if (errorData) errorMessage = errorData;
                }
            } catch (e) {
                console.error('Could not read error response:', e);
            }
            throw new Error(errorMessage);
        }

        const blob = await response.blob();
        console.log('Blob received - type:', blob.type, 'size:', blob.size);

        // Verify the blob is actually a PDF
        if (blob.size < 100) {
            console.error('Invalid PDF response - blob too small:', blob.size);
            throw new Error('El servidor devolvió un PDF vacío o inválido');
        }

        const url = window.URL.createObjectURL(blob);

        // For iOS Safari, we need to open in a new window
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            console.log('iOS detected - opening in new window');
            window.open(url, '_blank');
        } else {
            console.log('Android/other - triggering download');
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Cleanup after a delay
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
        console.log('=== PDF Download Complete ===');
    } catch (error) {
        console.error('=== PDF Download Error ===');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);

        // Show more detailed error to user
        const errorDetails = `URL: ${fullURL}\nError: ${error.message}`;
        alert(`Error al descargar el PDF:\n\n${errorDetails}\n\nRevisa la consola del navegador para más detalles.`);
    }
};

/**
 * Print attendance list with proper formatting
 * @param {Object} options - Print options
 * @param {Array} options.attendees - List of attendees
 * @param {Object} options.assembly - Assembly information
 * @param {string} options.title - Document title
 */
export const printAttendanceList = ({ attendees = [], assembly = {}, title = 'Lista de Asistencia' }) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Por favor, permite las ventanas emergentes para imprimir.');
        return;
    }

    // Format the date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get current date and time for print timestamp
    const printDate = new Date().toLocaleString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Generate HTML content for printing
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                @media print {
                    @page {
                        size: letter;
                        margin: 1.5cm 2cm;
                    }

                    /* Remove default headers and footers from browser print */
                    @page :first {
                        margin-top: 1.5cm;
                    }

                    @page :left {
                        margin-left: 2cm;
                        margin-right: 2cm;
                    }

                    @page :right {
                        margin-left: 2cm;
                        margin-right: 2cm;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    /* Hide default browser print headers/footers */
                    html {
                        margin: 0;
                    }
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Times New Roman', Times, serif;
                    padding: 20px;
                    background: white;
                    color: #000;
                    line-height: 1.6;
                }

                .document-header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #000;
                }

                .document-header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                }

                .document-header .subtitle {
                    font-size: 14px;
                    font-weight: normal;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .assembly-info {
                    margin-bottom: 30px;
                    padding: 15px 0;
                }

                .assembly-info h2 {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                }

                .info-row {
                    display: flex;
                    margin-bottom: 8px;
                    font-size: 12px;
                }

                .info-row .label {
                    font-weight: bold;
                    width: 150px;
                    flex-shrink: 0;
                }

                .info-row .value {
                    flex: 1;
                }

                .attendees-section {
                    margin-top: 30px;
                }

                .attendees-section h3 {
                    font-size: 13px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 15px;
                    text-align: center;
                }

                .attendees-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 40px;
                    border: 2px solid #000;
                }

                .attendees-table thead {
                    background: #fff;
                    color: #000;
                }

                .attendees-table th {
                    padding: 10px 8px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                    border: 1px solid #000;
                    border-bottom: 2px solid #000;
                }

                .attendees-table th:first-child {
                    width: 50px;
                    text-align: center;
                }

                .attendees-table th:nth-child(3) {
                    width: 120px;
                }

                .attendees-table th:last-child {
                    width: 150px;
                    text-align: center;
                }

                .attendees-table tbody tr {
                    border-bottom: 1px solid #000;
                }

                .attendees-table td {
                    padding: 10px 8px;
                    font-size: 11px;
                    border: 1px solid #000;
                    min-height: 40px;
                }

                .attendees-table td:first-child {
                    text-align: center;
                    font-weight: bold;
                }

                .attendees-table td:last-child {
                    text-align: center;
                    background: #fff;
                }

                .footer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 15px 0;
                    border-top: 1px solid #000;
                    font-size: 9px;
                    text-align: center;
                    background: white;
                }

                .no-data {
                    text-align: center;
                    padding: 40px;
                    font-style: italic;
                    font-size: 12px;
                }

                @media print {
                    .no-print {
                        display: none;
                    }

                    body {
                        padding: 0;
                    }

                    .attendees-table thead {
                        background: #fff !important;
                        color: #000 !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="document-header">
                <h1>COOPESUMA R.L.</h1>
                <div class="subtitle">${title}</div>
            </div>

            <div class="assembly-info">
                <h2>Información de la Asamblea</h2>
                <div class="info-row">
                    <span class="label">Nombre de la Asamblea:</span>
                    <span class="value">${assembly.title || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Fecha Programada:</span>
                    <span class="value">${assembly.scheduledDate ? formatDate(assembly.scheduledDate) : 'N/A'}</span>
                </div>
                ${assembly.startTime ? `
                <div class="info-row">
                    <span class="label">Hora de Inicio:</span>
                    <span class="value">${assembly.startTime.substring(0, 5)}</span>
                </div>
                ` : ''}
                ${assembly.endTime ? `
                <div class="info-row">
                    <span class="label">Hora de Finalización:</span>
                    <span class="value">${assembly.endTime.substring(0, 5)}</span>
                </div>
                ` : ''}
            </div>

            ${attendees.length > 0 ? `
                <div class="attendees-section">
                    <h3>Registro de Asistencia</h3>
                    <table class="attendees-table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Nombre Completo</th>
                                <th>Cédula</th>
                                <th>Firma</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${attendees.map((attendee, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${attendee.fullName || 'N/A'}</td>
                                    <td>${attendee.identification || 'N/A'}</td>
                                    <td>&nbsp;</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `
                <div class="no-data">
                    No hay asistentes registrados para esta asamblea.
                </div>
            `}

            <div class="footer">
                Documento generado el ${printDate} - COOPESUMA R.L.
            </div>

            <script>
                // Auto-print when the page loads
                window.onload = function() {
                    window.print();
                    // Close the window after printing (optional)
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `;

    // Write content to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

/**
 * Print savings transaction receipt
 * @param {Object} options - Print options
 * @param {string} options.transactionType - 'deposit' or 'withdrawal'
 * @param {Object} options.member - Member information
 * @param {number} options.amount - Transaction amount
 * @param {number} options.previousBalance - Balance before transaction
 * @param {number} options.newBalance - Balance after transaction
 * @param {string} options.description - Transaction description/note
 * @param {Date} options.transactionDate - Transaction date
 * @param {string} options.transactionId - Transaction ID (optional)
 */
export const printSavingsReceipt = ({
    transactionType = 'deposit',
    member = {},
    amount = 0,
    previousBalance = 0,
    newBalance = 0,
    description = '',
    transactionDate = new Date(),
    transactionId = ''
}) => {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Por favor, permite las ventanas emergentes para imprimir.');
        return;
    }

    const isDeposit = transactionType === 'deposit';
    const transactionLabel = isDeposit ? 'DEPÓSITO' : 'RETIRO';
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

    const printDate = new Date().toLocaleString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recibo de ${transactionLabel} - COOPESUMA</title>
            <style>
                @media print {
                    @page {
                        size: 80mm 200mm;
                        margin: 5mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Courier New', monospace;
                    padding: 10px;
                    background: white;
                    color: #000;
                    max-width: 300px;
                    margin: 0 auto;
                }

                .receipt {
                    border: 2px dashed #000;
                    padding: 15px;
                }

                .receipt-header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }

                .receipt-header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .receipt-header .subtitle {
                    font-size: 11px;
                    color: #666;
                }

                .transaction-type {
                    text-align: center;
                    padding: 8px;
                    margin: 10px 0;
                    background: ${transactionColor};
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    border-radius: 4px;
                }

                .receipt-body {
                    font-size: 11px;
                    line-height: 1.6;
                }

                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    border-bottom: 1px dotted #ccc;
                }

                .receipt-row:last-child {
                    border-bottom: none;
                }

                .receipt-row .label {
                    font-weight: bold;
                    color: #333;
                }

                .receipt-row .value {
                    text-align: right;
                    max-width: 60%;
                    word-break: break-word;
                }

                .amount-section {
                    background: #f5f5f5;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 4px;
                }

                .amount-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    font-size: 11px;
                }

                .amount-row.total {
                    border-top: 2px solid #000;
                    margin-top: 5px;
                    padding-top: 8px;
                    font-weight: bold;
                    font-size: 13px;
                }

                .amount-row .amount {
                    font-family: 'Courier New', monospace;
                }

                .amount-row .amount.positive {
                    color: #16a34a;
                }

                .amount-row .amount.negative {
                    color: #dc2626;
                }

                .description-section {
                    margin: 10px 0;
                    padding: 8px;
                    background: #fafafa;
                    border-left: 3px solid #666;
                    font-size: 10px;
                }

                .description-section .label {
                    font-weight: bold;
                    margin-bottom: 3px;
                }

                .receipt-footer {
                    text-align: center;
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                    margin-top: 15px;
                    font-size: 9px;
                    color: #666;
                }

                .receipt-footer .thank-you {
                    font-size: 11px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 5px;
                }

                .signature-section {
                    margin-top: 20px;
                    padding-top: 10px;
                }

                .signature-line {
                    border-top: 1px solid #000;
                    width: 80%;
                    margin: 30px auto 5px;
                }

                .signature-label {
                    text-align: center;
                    font-size: 9px;
                    color: #666;
                }

                @media print {
                    .no-print {
                        display: none;
                    }
                    body {
                        padding: 0;
                    }
                    .receipt {
                        border: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="receipt-header">
                    <h1>COOPESUMA R.L.</h1>
                    <div class="subtitle">Cooperativa de Ahorro</div>
                    <div class="subtitle">Sistema de Gestión</div>
                </div>

                <div class="transaction-type">
                    RECIBO DE ${transactionLabel}
                </div>

                <div class="receipt-body">
                    <div class="receipt-row">
                        <span class="label">Fecha:</span>
                        <span class="value">${formatDate(transactionDate)}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Hora:</span>
                        <span class="value">${formatTime(transactionDate)}</span>
                    </div>
                    ${transactionId ? `
                    <div class="receipt-row">
                        <span class="label">N° Trans:</span>
                        <span class="value">${transactionId}</span>
                    </div>
                    ` : ''}
                    <div class="receipt-row">
                        <span class="label">Asociado:</span>
                        <span class="value">${member.member_code || member.memberCode || 'N/A'}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Nombre:</span>
                        <span class="value">${member.full_name || member.fullName || 'N/A'}</span>
                    </div>
                </div>

                <div class="amount-section">
                    <div class="amount-row">
                        <span>Saldo Anterior:</span>
                        <span class="amount">${formatCurrency(previousBalance)}</span>
                    </div>
                    <div class="amount-row">
                        <span>${isDeposit ? 'Depósito:' : 'Retiro:'}</span>
                        <span class="amount ${isDeposit ? 'positive' : 'negative'}">
                            ${isDeposit ? '+' : '-'}${formatCurrency(amount)}
                        </span>
                    </div>
                    <div class="amount-row total">
                        <span>Nuevo Saldo:</span>
                        <span class="amount">${formatCurrency(newBalance)}</span>
                    </div>
                </div>

                ${description ? `
                <div class="description-section">
                    <div class="label">Nota:</div>
                    <div>${description}</div>
                </div>
                ` : ''}

                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-label">Firma del Asociado</div>
                </div>

                <div class="receipt-footer">
                    <div class="thank-you">¡Gracias por su confianza!</div>
                    <div>Documento generado el ${printDate}</div>
                    <div>COOPESUMA R.L.</div>
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

/**
 * Print affiliation receipt
 * @param {Object} options - Print options
 * @param {Object} options.member - Member information (fullName, memberCode, identification)
 * @param {number} options.amount - Affiliation fee amount
 * @param {string} options.receiptNumber - Receipt number
 * @param {Date} options.date - Transaction date
 * @param {number} options.fiscalYear - Fiscal year
 */
export const printAffiliationReceipt = ({
    member = {},
    amount = 500,
    receiptNumber = '',
    date = new Date(),
    fiscalYear = new Date().getFullYear()
}) => {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Por favor, permite las ventanas emergentes para imprimir.');
        return;
    }

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

    const printDate = new Date().toLocaleString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recibo de Afiliación - COOPESUMA</title>
            <style>
                @media print {
                    @page {
                        size: 80mm 200mm;
                        margin: 5mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Courier New', monospace;
                    padding: 10px;
                    background: white;
                    color: #000;
                    max-width: 300px;
                    margin: 0 auto;
                }

                .receipt {
                    border: 2px dashed #000;
                    padding: 15px;
                }

                .receipt-header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }

                .receipt-header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .receipt-header .subtitle {
                    font-size: 11px;
                    color: #666;
                }

                .transaction-type {
                    text-align: center;
                    padding: 8px;
                    margin: 10px 0;
                    background: #2563eb;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    border-radius: 4px;
                }

                .receipt-body {
                    font-size: 11px;
                    line-height: 1.6;
                }

                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    border-bottom: 1px dotted #ccc;
                }

                .receipt-row:last-child {
                    border-bottom: none;
                }

                .receipt-row .label {
                    font-weight: bold;
                    color: #333;
                }

                .receipt-row .value {
                    text-align: right;
                    max-width: 60%;
                    word-break: break-word;
                }

                .amount-section {
                    background: #f5f5f5;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 4px;
                }

                .amount-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    font-size: 11px;
                }

                .amount-row.total {
                    border-top: 2px solid #000;
                    margin-top: 5px;
                    padding-top: 8px;
                    font-weight: bold;
                    font-size: 13px;
                }

                .amount-row .amount {
                    font-family: 'Courier New', monospace;
                }

                .footer-section {
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px dashed #000;
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                }

                .signature-line {
                    margin-top: 20px;
                    border-top: 1px solid #000;
                    width: 200px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .signature-label {
                    text-align: center;
                    font-size: 10px;
                    margin-top: 5px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="receipt-header">
                    <h1>COOPESUMA R.L.</h1>
                    <div class="subtitle">Escuela Los Chiles, Aguas Zarcas</div>
                    <div class="subtitle">Cooperativa Estudiantil</div>
                </div>

                <div class="transaction-type">
                    RECIBO DE AFILIACIÓN
                </div>

                <div class="receipt-body">
                    <div class="receipt-row">
                        <span class="label">Recibo No:</span>
                        <span class="value">${receiptNumber}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Fecha:</span>
                        <span class="value">${formatDate(date)}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Hora:</span>
                        <span class="value">${formatTime(date)}</span>
                    </div>
                </div>

                <div class="amount-section">
                    <div class="receipt-row">
                        <span class="label">Nombre:</span>
                        <span class="value">${member.full_name || member.fullName || ''}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Cédula:</span>
                        <span class="value">${member.identification || ''}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Código:</span>
                        <span class="value">${member.member_code || member.memberCode || ''}</span>
                    </div>
                </div>

                <div class="amount-section">
                    <div class="receipt-row">
                        <span class="label">Concepto:</span>
                        <span class="value">Cuota de Afiliación</span>
                    </div>
                    <div class="amount-row total">
                        <span class="label">TOTAL:</span>
                        <span class="amount">${formatCurrency(amount)}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Año Fiscal:</span>
                        <span class="value">${fiscalYear}</span>
                    </div>
                </div>

                <div class="signature-line"></div>
                <div class="signature-label">Firma del Tesorero/Autorizado</div>

                <div class="footer-section">
                    <div>Impreso: ${printDate}</div>
                    <div style="margin-top: 5px;">Sistema de Gestión CoopeSuma</div>
                    <div style="margin-top: 8px; font-size: 9px;">¡Bienvenido a la familia CoopeSuma!</div>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 250);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

/**
 * Download attendance list as PDF (alternative method)
 * Note: This requires backend support or a PDF library
 * @param {Object} options - Download options
 */
export const downloadAttendanceListAsPDF = async ({ attendees, assembly }) => {
    // This would typically call a backend endpoint to generate a PDF
    console.warn('PDF download requires backend implementation');
    // Example:
    // const response = await generateAttendanceReport(assembly.assemblyId, { format: 'pdf' });
    // const blob = new Blob([response.data], { type: 'application/pdf' });
    // const url = window.URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = `asistencia-${assembly.title}.pdf`;
    // link.click();
};

/**
 * Print member ID cards with proper formatting
 * @param {Object} options - Print options
 * @param {Array} options.members - List of members with QR codes
 * @param {string} options.cooperativeName - Cooperative name
 */
export const printMemberCards = ({ members = [], cooperativeName = 'Coopesuma' }) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Por favor, permite las ventanas emergentes para imprimir.');
        return;
    }

    // Get current date and time for print timestamp
    const printDate = new Date().toLocaleString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Generate member cards HTML
    const memberCardsHtml = members.map(member => `
        <div class="carnet-wrapper">
            <div class="member-card">
                <!-- Header -->
                <div class="card-header">
                    <h1 class="card-title">${cooperativeName}</h1>
                </div>

                <!-- Main Content -->
                <div class="card-body">
                    <!-- Photo -->
                    <div class="card-photo">
                        ${member.photoUrl ? `
                            <img
                                src="${member.photoUrl}"
                                alt="${member.fullName}"
                                class="photo-img"
                            />
                        ` : `
                            <div class="photo-placeholder">
                                <svg class="placeholder-icon" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        `}
                    </div>

                    <!-- Member Information -->
                    <div class="card-info">
                        <p class="member-name">${member.fullName}</p>
                        <p class="member-detail">
                            <span class="detail-label">Cédula:</span> ${member.identification}
                        </p>
                    </div>

                    <!-- QR Code -->
                    <div class="card-qr">
                        ${member.qrCodeDataUrl ? `
                            <img
                                src="${member.qrCodeDataUrl}"
                                alt="QR ${member.fullName}"
                                class="qr-img"
                            />
                        ` : `
                            <div class="qr-placeholder">
                                <p>No QR</p>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Footer -->
                <div class="card-footer">
                    <p class="footer-text">Cooperativa Estudiantil</p>
                </div>
            </div>
        </div>
    `).join('');

    // Generate HTML content for printing
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Carnets Estudiantiles - ${cooperativeName}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Arial', sans-serif;
                    background: white;
                    padding: 10mm;
                }

                .carnets-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10mm;
                    width: 100%;
                }

                .carnet-wrapper {
                    page-break-inside: avoid;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .member-card {
                    width: 100mm;
                    height: 63mm;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* Header */
                .card-header {
                    background: #2563eb;
                    padding: 1mm 3mm;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .card-title {
                    font-size: 16pt;
                    font-weight: bold;
                    color: white;
                    margin: 0;
                    line-height: 1;
                    font-family: 'Arial', sans-serif;
                }

                /* Body */
                .card-body {
                    flex: 1;
                    display: flex;
                    padding: 3mm 4mm;
                    gap: 3mm;
                    align-items: center;
                }

                /* Photo */
                .card-photo {
                    width: 24mm;
                    height: 30mm;
                    flex-shrink: 0;
                }

                .photo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                }

                .photo-placeholder {
                    width: 100%;
                    height: 100%;
                    background: #f3f4f6;
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .placeholder-icon {
                    width: 12mm;
                    height: 12mm;
                    color: #9ca3af;
                }

                /* Member Info */
                .card-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 1mm;
                    min-width: 0;
                }

                .member-name {
                    font-size: 11pt;
                    font-weight: bold;
                    color: #1f2937;
                    margin: 0;
                    line-height: 1.2;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-family: 'Arial', sans-serif;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .member-detail {
                    font-size: 9pt;
                    color: #4b5563;
                    margin: 0;
                    line-height: 1.3;
                    font-family: 'Arial', sans-serif;
                }

                .detail-label {
                    font-weight: 600;
                    color: #374151;
                }

                /* QR Code */
                .card-qr {
                    width: 30mm;
                    height: 30mm;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .qr-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .qr-placeholder {
                    width: 100%;
                    height: 100%;
                    background: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8pt;
                    color: #9ca3af;
                }

                /* Footer */
                .card-footer {
                    background: white;
                    padding: 2mm 4mm;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }

                .footer-text {
                    font-size: 7pt;
                    color: #64748b;
                    margin: 0;
                    font-family: 'Arial', sans-serif;
                }

                .print-info {
                    text-align: center;
                    margin-top: 20mm;
                    padding-top: 10mm;
                    border-top: 1px solid #e5e7eb;
                    font-size: 9pt;
                    color: #6b7280;
                    page-break-before: avoid;
                }

                @media print {
                    @page {
                        size: Letter portrait;
                        margin: 10mm;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    body {
                        padding: 0;
                    }

                    .member-card {
                        box-shadow: none;
                    }

                    .card-header {
                        background: #2563eb !important;
                    }

                    /* Force page break after every 4 cards (2 rows) */
                    .carnet-wrapper:nth-child(4n) {
                        page-break-after: always;
                    }

                    .print-info {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="carnets-grid">
                ${memberCardsHtml}
            </div>

            <div class="print-info">
                Documento generado el ${printDate} - ${cooperativeName} R.L.<br>
                Total de carnets: ${members.length}
            </div>

            <script>
                // Auto-print when the page loads
                window.onload = function() {
                    window.print();
                    // Close the window after printing (optional)
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `;

    // Write content to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

/**
 * Print liquidation receipt
 * Generates HTML receipt and opens print dialog
 * @param {Object} options - Print options
 * @param {Object} options.member - Member information (fullName, memberCode, identification)
 * @param {string} options.liquidationType - Type: 'periodic' or 'exit'
 * @param {number} options.savingsAmount - Savings amount liquidated
 * @param {number} options.totalAmount - Total amount liquidated
 * @param {string} options.notes - Optional notes
 * @param {Date} options.liquidationDate - Liquidation date
 * @param {number} options.liquidationId - Liquidation ID
 * @param {string} options.receiptNumber - Receipt number (optional)
 */
/**
 * Print liquidations report with proper pagination
 * Opens a new window with HTML that properly handles multi-page tables
 * @param {Object} options - Print options
 * @param {Array} options.liquidations - List of liquidations
 * @param {Object} options.stats - Statistics object
 * @param {Object} options.dateRange - Date range { startDate, endDate }
 */
export const printLiquidationsReport = async ({
    liquidations = [],
    stats = {},
    dateRange = {}
}) => {
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const printDate = new Date().toLocaleString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Generate table rows
    const tableRows = liquidations.map((liq, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${new Date(liq.liquidationDate || liq.createdAt).toLocaleDateString('es-CR')}</td>
            <td>${liq.memberName || 'N/A'}</td>
            <td style="text-align: center;">${liq.liquidationType === 'periodic' ? 'Periodica' : 'Retiro'}</td>
            <td style="text-align: right;">${formatCurrency(liq.totalSavings)}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Liquidaciones</title>
            <style>
                @media print {
                    @page {
                        size: letter portrait;
                        margin: 15mm 20mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    thead {
                        display: table-header-group;
                    }
                    tfoot {
                        display: table-footer-group;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Times New Roman', Times, serif;
                    background: white;
                    color: #000;
                    line-height: 1.4;
                    padding: 20px;
                }

                .document-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #000;
                }

                .document-header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                }

                .document-header .subtitle {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .period-info {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 12px;
                }

                .stats-section {
                    margin-bottom: 20px;
                    padding: 12px;
                    border: 1px solid #000;
                }

                .stats-section h2 {
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #000;
                }

                .stats-grid {
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                }

                .stat-item {
                    text-align: center;
                    padding: 8px 15px;
                    border: 1px solid #ccc;
                    min-width: 120px;
                }

                .stat-item .label {
                    font-size: 9px;
                    text-transform: uppercase;
                    margin-bottom: 3px;
                }

                .stat-item .value {
                    font-size: 12px;
                    font-weight: bold;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10px;
                }

                thead th {
                    padding: 8px 5px;
                    text-align: left;
                    font-weight: bold;
                    text-transform: uppercase;
                    border: 1px solid #000;
                    border-bottom: 2px solid #000;
                    background: #f5f5f5;
                }

                tbody td {
                    padding: 6px 5px;
                    border: 1px solid #000;
                }

                tbody tr:nth-child(even) {
                    background: #fafafa;
                }

                tfoot td {
                    padding: 8px 5px;
                    font-weight: bold;
                    border: 1px solid #000;
                    background: #f0f0f0;
                }

                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #000;
                    font-size: 9px;
                    text-align: center;
                }

                .no-data {
                    text-align: center;
                    padding: 40px;
                    font-style: italic;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="document-header">
                <h1>COOPESUMA R.L.</h1>
                <div class="subtitle">Reporte de Liquidaciones</div>
            </div>

            <div class="period-info">
                <strong>Periodo:</strong> ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}
            </div>

            <div class="stats-section">
                <h2>Resumen</h2>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="label">Total Liquidaciones</div>
                        <div class="value">${stats.total || 0}</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Periodicas</div>
                        <div class="value">${stats.periodic || 0}</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Por Retiro</div>
                        <div class="value">${stats.exit || 0}</div>
                    </div>
                    <div class="stat-item">
                        <div class="label">Monto Total</div>
                        <div class="value">${formatCurrency(stats.totalSavings || stats.totalAmount)}</div>
                    </div>
                </div>
            </div>

            ${liquidations.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th style="width: 8%; text-align: center;">N</th>
                            <th style="width: 15%;">Fecha</th>
                            <th style="width: 42%;">Miembro</th>
                            <th style="width: 15%; text-align: center;">Tipo</th>
                            <th style="width: 20%; text-align: right;">Monto Ahorros</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" style="text-align: right;">TOTAL:</td>
                            <td style="text-align: right;">${formatCurrency(stats.totalSavings || stats.totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            ` : `
                <div class="no-data">
                    No hay liquidaciones en el periodo seleccionado.
                </div>
            `}

            <div class="footer">
                Documento generado el ${printDate} - COOPESUMA R.L.
            </div>
        </body>
        </html>
    `;

    // Check if mobile device - download PDF from backend instead of printing
    if (isMobileDevice()) {
        await downloadPDFFromBackend(
            `/reports/liquidations/pdf?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
            `liquidaciones_${dateRange.startDate}_${dateRange.endDate}.pdf`
        );
    } else {
        // Desktop: open print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor, permite las ventanas emergentes para imprimir.');
            return;
        }

        const printHtml = htmlContent.replace('</body>', `
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>`);

        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
    }
};

/**
 * Print attendance list report with proper pagination
 * Opens a new window with HTML that properly handles multi-page tables
 * @param {Object} options - Print options
 * @param {Array} options.attendees - List of attendees
 * @param {Object} options.assembly - Assembly information
 * @param {string} options.title - Document title
 */
export const printAttendanceListReport = async ({ attendees = [], assembly = {}, title = 'Lista de Asistencia' }) => {
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-CR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const printDate = new Date().toLocaleString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Generate table rows
    const tableRows = attendees.map((attendee, index) => `
        <tr>
            <td style="text-align: center; font-weight: bold;">${index + 1}</td>
            <td>${attendee.fullName || 'N/A'}</td>
            <td>${attendee.identification || 'N/A'}</td>
            <td></td>
        </tr>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                @media print {
                    @page {
                        size: letter portrait;
                        margin: 15mm 20mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    thead {
                        display: table-header-group;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Times New Roman', Times, serif;
                    background: white;
                    color: #000;
                    line-height: 1.4;
                    padding: 20px;
                }

                .document-header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #000;
                }

                .document-header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                }

                .document-header .subtitle {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .assembly-info {
                    margin-bottom: 25px;
                    padding: 15px 0;
                }

                .assembly-info h2 {
                    font-size: 13px;
                    font-weight: bold;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                }

                .info-row {
                    display: flex;
                    margin-bottom: 6px;
                    font-size: 11px;
                }

                .info-row .label {
                    font-weight: bold;
                    width: 150px;
                    flex-shrink: 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }

                thead th {
                    padding: 10px 8px;
                    text-align: left;
                    font-weight: bold;
                    text-transform: uppercase;
                    border: 1px solid #000;
                    border-bottom: 2px solid #000;
                    background: #f5f5f5;
                }

                tbody td {
                    padding: 10px 8px;
                    border: 1px solid #000;
                    min-height: 35px;
                }

                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #000;
                    font-size: 9px;
                    text-align: center;
                }

                .summary {
                    margin-top: 20px;
                    padding: 10px;
                    background: #f5f5f5;
                    border: 1px solid #000;
                    font-size: 11px;
                    text-align: center;
                }

                .no-data {
                    text-align: center;
                    padding: 40px;
                    font-style: italic;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="document-header">
                <h1>COOPESUMA R.L.</h1>
                <div class="subtitle">${title}</div>
            </div>

            <div class="assembly-info">
                <h2>Informacion de la Asamblea</h2>
                <div class="info-row">
                    <span class="label">Nombre:</span>
                    <span>${assembly.title || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Fecha Programada:</span>
                    <span>${formatDate(assembly.scheduledDate)}</span>
                </div>
                ${assembly.startTime ? `
                <div class="info-row">
                    <span class="label">Hora de Inicio:</span>
                    <span>${assembly.startTime.substring(0, 5)}</span>
                </div>
                ` : ''}
                ${assembly.endTime ? `
                <div class="info-row">
                    <span class="label">Hora de Finalizacion:</span>
                    <span>${assembly.endTime.substring(0, 5)}</span>
                </div>
                ` : ''}
            </div>

            ${attendees.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th style="width: 8%; text-align: center;">N</th>
                            <th style="width: 42%;">Nombre Completo</th>
                            <th style="width: 20%;">Cedula</th>
                            <th style="width: 30%; text-align: center;">Firma</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>

                <div class="summary">
                    <strong>Total de Asistentes: ${attendees.length}</strong>
                </div>
            ` : `
                <div class="no-data">
                    No hay asistentes registrados para esta asamblea.
                </div>
            `}

            <div class="footer">
                Documento generado el ${printDate} - COOPESUMA R.L.
            </div>
        </body>
        </html>
    `;

    // Check if mobile device - download PDF from backend instead of printing
    if (isMobileDevice()) {
        const assemblyId = assembly.assemblyId || assembly.assembly_id;
        const assemblyDate = assembly.scheduledDate ? new Date(assembly.scheduledDate).toISOString().split('T')[0] : 'asamblea';
        await downloadPDFFromBackend(
            `/reports/attendance-list/${assemblyId}/pdf`,
            `asistencia_${assemblyDate}.pdf`
        );
    } else {
        // Desktop: open print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor, permite las ventanas emergentes para imprimir.');
            return;
        }

        const printHtml = htmlContent.replace('</body>', `
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>`);

        printWindow.document.open();
        printWindow.document.write(printHtml);
        printWindow.document.close();
    }
};

export const printLiquidationReceipt = ({
    member = {},
    liquidationType = 'periodic',
    savingsAmount = 0,
    totalAmount = 0,
    notes = '',
    liquidationDate = new Date(),
    liquidationId = '',
    receiptNumber = ''
}) => {
    try {
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            alert('Por favor, permite las ventanas emergentes para imprimir.');
            return;
        }

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

        const printDate = new Date().toLocaleString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const typeLabel = liquidationType === 'periodic' ? 'PERIÓDICA' : 'POR RETIRO';
        const typeColor = liquidationType === 'periodic' ? '#2563eb' : '#dc2626';

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recibo de Liquidación - COOPESUMA</title>
            <style>
                @media print {
                    @page {
                        size: 80mm 200mm;
                        margin: 5mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Courier New', monospace;
                    padding: 10px;
                    background: white;
                    color: #000;
                    max-width: 300px;
                    margin: 0 auto;
                }

                .receipt {
                    border: 2px dashed #000;
                    padding: 15px;
                }

                .receipt-header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }

                .receipt-header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .receipt-header .subtitle {
                    font-size: 11px;
                    color: #666;
                }

                .transaction-type {
                    text-align: center;
                    padding: 8px;
                    margin: 10px 0;
                    background: ${typeColor};
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    border-radius: 4px;
                }

                .receipt-body {
                    font-size: 11px;
                    line-height: 1.6;
                }

                .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    border-bottom: 1px dotted #ccc;
                }

                .receipt-row:last-child {
                    border-bottom: none;
                }

                .receipt-row .label {
                    font-weight: bold;
                    color: #333;
                }

                .receipt-row .value {
                    text-align: right;
                    max-width: 60%;
                    word-break: break-word;
                }

                .amount-section {
                    background: #f5f5f5;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 4px;
                }

                .amount-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    font-size: 11px;
                }

                .amount-row.total {
                    border-top: 2px solid #000;
                    margin-top: 5px;
                    padding-top: 8px;
                    font-weight: bold;
                    font-size: 13px;
                }

                .amount-row .amount {
                    font-family: 'Courier New', monospace;
                    color: #16a34a;
                    font-weight: bold;
                }

                .description-section {
                    margin: 10px 0;
                    padding: 8px;
                    background: #fafafa;
                    border-left: 3px solid #666;
                    font-size: 10px;
                }

                .description-section .label {
                    font-weight: bold;
                    margin-bottom: 3px;
                }

                .receipt-footer {
                    text-align: center;
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                    margin-top: 15px;
                    font-size: 9px;
                    color: #666;
                }

                .receipt-footer .thank-you {
                    font-size: 11px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 5px;
                }

                .signature-section {
                    margin-top: 20px;
                    padding-top: 10px;
                }

                .signature-line {
                    border-top: 1px solid #000;
                    width: 80%;
                    margin: 30px auto 5px;
                }

                .signature-label {
                    text-align: center;
                    font-size: 9px;
                    color: #666;
                }

                @media print {
                    .no-print {
                        display: none;
                    }
                    body {
                        padding: 0;
                    }
                    .receipt {
                        border: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="receipt-header">
                    <h1>COOPESUMA R.L.</h1>
                    <div class="subtitle">Cooperativa de Ahorro</div>
                    <div class="subtitle">Sistema de Gestión</div>
                </div>

                <div class="transaction-type">
                    RECIBO DE LIQUIDACIÓN ${typeLabel}
                </div>

                <div class="receipt-body">
                    <div class="receipt-row">
                        <span class="label">Fecha:</span>
                        <span class="value">${formatDate(liquidationDate)}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Hora:</span>
                        <span class="value">${formatTime(liquidationDate)}</span>
                    </div>
                    ${receiptNumber ? `
                    <div class="receipt-row">
                        <span class="label">Recibo No:</span>
                        <span class="value">${receiptNumber}</span>
                    </div>
                    ` : ''}
                    ${liquidationId ? `
                    <div class="receipt-row">
                        <span class="label">Liquidación:</span>
                        <span class="value">#${liquidationId}</span>
                    </div>
                    ` : ''}
                    <div class="receipt-row">
                        <span class="label">Asociado:</span>
                        <span class="value">${member.memberCode || 'N/A'}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Nombre:</span>
                        <span class="value">${member.fullName || 'N/A'}</span>
                    </div>
                </div>

                <div class="amount-section">
                    <div class="amount-row total">
                        <span>Total Liquidado:</span>
                        <span class="amount">${formatCurrency(totalAmount)}</span>
                    </div>
                    <div style="margin-top: 8px; font-size: 10px; text-align: center; color: #666;">
                        (Cuenta de Ahorros)
                    </div>
                </div>

                ${notes ? `
                <div class="description-section">
                    <div class="label">Notas:</div>
                    <div>${notes}</div>
                </div>
                ` : ''}

                <div style="margin: 15px 0; padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; font-size: 10px; text-align: center;">
                    <strong>${liquidationType === 'periodic' ? 'Liquidación Periódica' : 'Liquidación por Retiro'}</strong><br>
                    ${liquidationType === 'periodic'
                        ? 'El asociado continúa activo en la cooperativa'
                        : 'El asociado se retira de la cooperativa'}
                </div>

                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-label">Firma del Asociado</div>
                </div>

                <div class="receipt-footer">
                    <div class="thank-you">¡Gracias por su confianza!</div>
                    <div>Documento generado el ${printDate}</div>
                    <div>COOPESUMA R.L.</div>
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    } catch (error) {
        console.error('Error printing liquidation receipt:', error);
        alert('Error al imprimir el recibo de liquidación: ' + error.message);
    }
};
