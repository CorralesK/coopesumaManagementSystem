/**
 * @file printUtils.js
 * @description Utility functions for printing documents
 * @module utils/printUtils
 */

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
