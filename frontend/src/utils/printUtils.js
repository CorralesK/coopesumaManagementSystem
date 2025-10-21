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
                        margin: 1.5cm;
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
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 20px;
                    background: white;
                    color: #333;
                }

                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #2563eb;
                }

                .header h1 {
                    color: #1e40af;
                    font-size: 28px;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .header .subtitle {
                    color: #64748b;
                    font-size: 16px;
                    margin-top: 5px;
                }

                .assembly-info {
                    background: #f1f5f9;
                    border-left: 4px solid #2563eb;
                    padding: 15px 20px;
                    margin-bottom: 25px;
                    border-radius: 4px;
                }

                .assembly-info h2 {
                    color: #1e40af;
                    font-size: 18px;
                    margin-bottom: 10px;
                }

                .assembly-info p {
                    color: #475569;
                    font-size: 14px;
                    margin: 5px 0;
                }

                .assembly-info strong {
                    color: #334155;
                }

                .stats {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 25px;
                    gap: 15px;
                }

                .stat-card {
                    flex: 1;
                    background: #eff6ff;
                    border: 2px solid #2563eb;
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                }

                .stat-card .label {
                    color: #1e40af;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 5px;
                }

                .stat-card .value {
                    color: #1e3a8a;
                    font-size: 32px;
                    font-weight: bold;
                }

                .attendees-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .attendees-table thead {
                    background: #1e40af;
                    color: white;
                }

                .attendees-table th {
                    padding: 12px 15px;
                    text-align: left;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .attendees-table th:first-child {
                    width: 60px;
                    text-align: center;
                }

                .attendees-table tbody tr {
                    border-bottom: 1px solid #e2e8f0;
                    transition: background-color 0.2s;
                }

                .attendees-table tbody tr:nth-child(even) {
                    background-color: #f8fafc;
                }

                .attendees-table tbody tr:hover {
                    background-color: #eff6ff;
                }

                .attendees-table td {
                    padding: 12px 15px;
                    font-size: 14px;
                    color: #334155;
                }

                .attendees-table td:first-child {
                    text-align: center;
                    font-weight: bold;
                    color: #1e40af;
                }

                .no-data {
                    text-align: center;
                    padding: 40px;
                    color: #94a3b8;
                    font-style: italic;
                }

                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #64748b;
                    font-size: 12px;
                }

                .footer .print-date {
                    font-weight: 600;
                }

                .footer .signature-section {
                    margin-top: 60px;
                    text-align: center;
                }

                .footer .signature-line {
                    border-top: 2px solid #334155;
                    width: 300px;
                    margin: 0 auto 10px auto;
                    padding-top: 10px;
                }

                @media print {
                    .no-print {
                        display: none;
                    }

                    body {
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${title}</h1>
            </div>

            <div class="assembly-info">
                <h2>${assembly.title || 'Asamblea'}</h2>
                <p><strong>Fecha:</strong> ${assembly.scheduledDate ? formatDate(assembly.scheduledDate) : 'N/A'}</p>
                ${assembly.description ? `<p><strong>Descripción:</strong> ${assembly.description}</p>` : ''}
            </div>

            ${attendees.length > 0 ? `
                <table class="attendees-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre Completo</th>
                            <th>Identificación</th>
                            <th>Firma</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attendees.map((attendee, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${attendee.fullName || 'N/A'}</td>
                                <td>${attendee.identification || 'N/A'}</td>
                                <td></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : `
                <div class="no-data">
                    No hay asistentes registrados para esta asamblea.
                </div>
            `}

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
