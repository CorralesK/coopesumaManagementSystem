/**
 * PDF Utilities
 * Helper functions for PDF generation using PDFKit
 *
 * @module utils/pdfUtils
 */

const PDFDocument = require('pdfkit');
const logger = require('./logger');

/**
 * Format date for display in PDF
 *
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    const d = new Date(date);
    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

/**
 * Format time for display in PDF
 *
 * @param {string} time - Time in HH:MM:SS format
 * @returns {string} Formatted time string
 */
const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
};

/**
 * Create attendance report PDF with signature spaces
 *
 * @param {Object} assemblyData - Assembly information
 * @param {Array} attendeeRecords - List of attendees
 * @param {Object} stats - Attendance statistics
 * @returns {PDFDocument} PDF document stream
 */
const createAttendanceReport = (assemblyData, attendeeRecords, stats) => {
    try {
        // Create PDF document
        const doc = new PDFDocument({
            size: 'LETTER',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });

        const pageWidth = doc.page.width - 100; // Account for margins

        // Header
        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('CoopeSuma - Reporte de Asistencia', { align: 'center' })
            .moveDown(0.5);

        // Assembly Information
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Asamblea: ', { continued: true })
            .font('Helvetica')
            .text(assemblyData.title)
            .moveDown(0.3);

        doc
            .font('Helvetica-Bold')
            .text('Fecha: ', { continued: true })
            .font('Helvetica')
            .text(formatDate(assemblyData.scheduled_date))
            .moveDown(0.3);

        if (assemblyData.start_time && assemblyData.end_time) {
            doc
                .font('Helvetica-Bold')
                .text('Hora: ', { continued: true })
                .font('Helvetica')
                .text(`${formatTime(assemblyData.start_time)} - ${formatTime(assemblyData.end_time)}`)
                .moveDown(0.3);
        }

        if (assemblyData.location) {
            doc
                .font('Helvetica-Bold')
                .text('Lugar: ', { continued: true })
                .font('Helvetica')
                .text(assemblyData.location)
                .moveDown(0.3);
        }

        // Statistics
        const attendanceRate = stats.totalMembers > 0
            ? ((stats.totalAttendees / stats.totalMembers) * 100).toFixed(1)
            : 0;

        doc
            .font('Helvetica-Bold')
            .text('Total Asistentes: ', { continued: true })
            .font('Helvetica')
            .text(`${stats.totalAttendees} / ${stats.totalMembers} (${attendanceRate}%)`)
            .moveDown(1);

        // Table Header
        const tableTop = doc.y;
        const col1X = 50;  // #
        const col2X = 80;  // Nombre
        const col3X = 280; // Identificación
        const col4X = 400; // Grado
        const col5X = 460; // Sección
        const col6X = 520; // Firma

        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('#', col1X, tableTop)
            .text('Nombre', col2X, tableTop)
            .text('Identificación', col3X, tableTop)
            .text('Grado', col4X, tableTop)
            .text('Sección', col5X, tableTop)
            .text('Firma', col6X, tableTop);

        // Draw header line
        doc
            .moveTo(50, tableTop + 15)
            .lineTo(doc.page.width - 50, tableTop + 15)
            .stroke();

        let currentY = tableTop + 25;
        const rowHeight = 30;

        // Table Rows with signature spaces
        attendeeRecords.forEach((attendee, index) => {
            // Check if we need a new page
            if (currentY + rowHeight > doc.page.height - 70) {
                doc.addPage();
                currentY = 50;

                // Repeat header on new page
                doc
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .text('#', col1X, currentY)
                    .text('Nombre', col2X, currentY)
                    .text('Identificación', col3X, currentY)
                    .text('Calidad', col4X, currentY)
                    .text('Nivel', col5X, currentY)
                    .text('Firma', col6X, currentY);

                doc
                    .moveTo(50, currentY + 15)
                    .lineTo(doc.page.width - 50, currentY + 15)
                    .stroke();

                currentY += 25;
            }

            // Row number
            doc
                .fontSize(9)
                .font('Helvetica')
                .text(index + 1, col1X, currentY);

            // Member name (truncate if too long)
            const fullName = attendee.full_name.length > 30
                ? attendee.full_name.substring(0, 27) + '...'
                : attendee.full_name;
            doc.text(fullName, col2X, currentY);

            // Identification
            doc.text(attendee.identification, col3X, currentY);

            // Quality
            const qualityText = attendee.quality_name || attendee.quality_code || '-';
            doc.text(qualityText, col4X, currentY, { width: 60, align: 'center' });

            // Level
            const levelText = attendee.level_name || attendee.level_code || '-';
            doc.text(levelText, col5X, currentY, { width: 40, align: 'center' });

            // Signature space (empty box)
            doc
                .rect(col6X, currentY - 5, 60, 20)
                .stroke();

            // Draw row separator
            currentY += rowHeight;
            doc
                .moveTo(50, currentY - 10)
                .lineTo(doc.page.width - 50, currentY - 10)
                .strokeOpacity(0.3)
                .stroke()
                .strokeOpacity(1);
        });

        // Footer with generation info
        doc
            .moveDown(2)
            .fontSize(8)
            .font('Helvetica')
            .text(
                `Reporte generado el ${formatDate(new Date())}`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );

        return doc;
    } catch (error) {
        logger.error('Error creating attendance report PDF:', error);
        throw error;
    }
};

/**
 * Create attendance statistics report PDF
 *
 * @param {Object} assemblyData - Assembly information
 * @param {Object} stats - Attendance statistics
 * @param {Array} statsByQualityLevel - Statistics by quality and level
 * @returns {PDFDocument} PDF document stream
 */
const createAttendanceStatsReport = (assemblyData, stats, statsByQualityLevel) => {
    try {
        const doc = new PDFDocument({
            size: 'LETTER',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });

        // Header
        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('CoopeSuma - Estadísticas de Asistencia', { align: 'center' })
            .moveDown(1);

        // Assembly Information
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Asamblea: ', { continued: true })
            .font('Helvetica')
            .text(assemblyData.title)
            .moveDown(0.5);

        doc
            .font('Helvetica-Bold')
            .text('Fecha: ', { continued: true })
            .font('Helvetica')
            .text(formatDate(assemblyData.scheduled_date))
            .moveDown(1.5);

        // Overall Statistics
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Resumen General')
            .moveDown(0.5);

        const attendanceRate = stats.totalMembers > 0
            ? ((stats.totalAttendees / stats.totalMembers) * 100).toFixed(1)
            : 0;

        doc
            .fontSize(11)
            .font('Helvetica')
            .text(`Total de miembros activos: ${stats.totalMembers}`)
            .text(`Total de asistentes: ${stats.totalAttendees}`)
            .text(`Porcentaje de asistencia: ${attendanceRate}%`)
            .text(`Registros por QR: ${stats.qrRegistrations}`)
            .text(`Registros manuales: ${stats.manualRegistrations}`)
            .moveDown(1.5);

        // Statistics by Grade
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('Asistencia por Grado')
            .moveDown(0.5);

        const tableTop = doc.y;
        const col1X = 50;
        const col2X = 150;
        const col3X = 300;
        const col4X = 450;

        doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text('Calidad/Nivel', col1X, tableTop)
            .text('Total Miembros', col2X, tableTop)
            .text('Asistieron', col3X, tableTop)
            .text('Porcentaje', col4X, tableTop);

        doc
            .moveTo(50, tableTop + 20)
            .lineTo(doc.page.width - 50, tableTop + 20)
            .stroke();

        let currentY = tableTop + 30;

        statsByQualityLevel.forEach((stats) => {
            // Format the quality/level text
            const qualityLevelText = stats.level_name
                ? `${stats.quality_name} - ${stats.level_name}`
                : stats.quality_name;

            doc
                .fontSize(10)
                .font('Helvetica')
                .text(qualityLevelText, col1X, currentY)
                .text(stats.total_members.toString(), col2X, currentY)
                .text(stats.attended.toString(), col3X, currentY)
                .text(`${stats.attendance_rate}%`, col4X, currentY);

            currentY += 25;
        });

        // Footer
        doc
            .fontSize(8)
            .font('Helvetica')
            .text(
                `Reporte generado el ${formatDate(new Date())}`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );

        return doc;
    } catch (error) {
        logger.error('Error creating attendance stats report PDF:', error);
        throw error;
    }
};

/**
 * Format currency for display in PDF
 *
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
    // Format number with thousands separator and 2 decimals, then add CRC prefix
    // Using manual formatting to avoid encoding issues with colon symbol in PDFs
    const num = Number(amount || 0).toLocaleString('es-CR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `CRC ${num}`;
};

/**
 * Create liquidations report PDF
 * Matches the HTML design used for desktop printing
 *
 * @param {Array} liquidations - List of liquidations
 * @param {Object} stats - Statistics object { total, periodic, exit, totalSavings }
 * @param {Object} dateRange - Date range { startDate, endDate }
 * @returns {PDFDocument} PDF document stream
 */
const createLiquidationsReport = (liquidations, stats, dateRange) => {
    try {
        const doc = new PDFDocument({
            size: 'LETTER',
            margins: {
                top: 40,
                bottom: 40,
                left: 50,
                right: 50
            }
        });

        const pageWidth = doc.page.width;
        const contentWidth = pageWidth - 100; // 50 margin each side

        // Header with border bottom
        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('COOPESUMA R.L.', { align: 'center' })
            .moveDown(0.2);

        doc
            .fontSize(14)
            .text('Reporte de Liquidaciones', { align: 'center' })
            .moveDown(0.5);

        // Header border
        doc
            .moveTo(50, doc.y)
            .lineTo(pageWidth - 50, doc.y)
            .lineWidth(2)
            .stroke();

        doc.moveDown(0.8);

        // Period info
        doc
            .fontSize(11)
            .font('Helvetica')
            .text(`Periodo: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, { align: 'center' })
            .moveDown(1);

        // Statistics box with border
        const statsBoxY = doc.y;
        const statsBoxHeight = 70;

        // Draw stats box border
        doc
            .lineWidth(1)
            .rect(50, statsBoxY, contentWidth, statsBoxHeight)
            .stroke();

        // Stats header
        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('RESUMEN', 60, statsBoxY + 8);

        // Stats header line
        doc
            .moveTo(50, statsBoxY + 22)
            .lineTo(pageWidth - 50, statsBoxY + 22)
            .stroke();

        // Stats values in a row
        const statY = statsBoxY + 32;
        const statWidth = contentWidth / 4;

        // Total Liquidaciones
        doc
            .fontSize(8)
            .font('Helvetica')
            .text('TOTAL LIQUIDACIONES', 55, statY, { width: statWidth - 10, align: 'center' })
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(stats.total.toString(), 55, statY + 15, { width: statWidth - 10, align: 'center' });

        // Periodicas
        doc
            .fontSize(8)
            .font('Helvetica')
            .text('PERIODICAS', 55 + statWidth, statY, { width: statWidth - 10, align: 'center' })
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(stats.periodic.toString(), 55 + statWidth, statY + 15, { width: statWidth - 10, align: 'center' });

        // Por Retiro
        doc
            .fontSize(8)
            .font('Helvetica')
            .text('POR RETIRO', 55 + statWidth * 2, statY, { width: statWidth - 10, align: 'center' })
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(stats.exit.toString(), 55 + statWidth * 2, statY + 15, { width: statWidth - 10, align: 'center' });

        // Monto Total
        doc
            .fontSize(8)
            .font('Helvetica')
            .text('MONTO TOTAL', 55 + statWidth * 3, statY, { width: statWidth - 10, align: 'center' })
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(formatCurrency(stats.totalSavings), 55 + statWidth * 3, statY + 15, { width: statWidth - 10, align: 'center' });

        doc.y = statsBoxY + statsBoxHeight + 15;

        if (liquidations.length === 0) {
            doc.moveDown(2);
            doc
                .fontSize(12)
                .font('Helvetica-Oblique')
                .text('No hay liquidaciones en el periodo seleccionado.', { align: 'center' });
        } else {
            // Table with full borders
            const colWidths = [35, 70, 220, 70, 95]; // N, Fecha, Miembro, Tipo, Monto
            const tableX = 50;
            const rowHeight = 18;
            const headerHeight = 22;

            // Function to draw table header
            const drawTableHeader = (y) => {
                // Header background
                doc
                    .fillColor('#f5f5f5')
                    .rect(tableX, y, contentWidth, headerHeight)
                    .fill()
                    .fillColor('#000000');

                // Header border
                doc
                    .lineWidth(1)
                    .rect(tableX, y, contentWidth, headerHeight)
                    .stroke();

                // Bottom border thicker
                doc
                    .lineWidth(2)
                    .moveTo(tableX, y + headerHeight)
                    .lineTo(tableX + contentWidth, y + headerHeight)
                    .stroke()
                    .lineWidth(1);

                // Column separators
                let colX = tableX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                    colX += colWidths[i];
                    doc
                        .moveTo(colX, y)
                        .lineTo(colX, y + headerHeight)
                        .stroke();
                }

                // Header text
                doc.fontSize(9).font('Helvetica-Bold');
                colX = tableX;
                doc.text('N°', colX + 5, y + 6, { width: colWidths[0] - 10, align: 'center' });
                colX += colWidths[0];
                doc.text('FECHA', colX + 5, y + 6, { width: colWidths[1] - 10 });
                colX += colWidths[1];
                doc.text('MIEMBRO', colX + 5, y + 6, { width: colWidths[2] - 10 });
                colX += colWidths[2];
                doc.text('TIPO', colX + 5, y + 6, { width: colWidths[3] - 10, align: 'center' });
                colX += colWidths[3];
                doc.text('MONTO', colX + 5, y + 6, { width: colWidths[4] - 10, align: 'right' });

                return y + headerHeight;
            };

            let currentY = drawTableHeader(doc.y);

            // Table rows
            liquidations.forEach((liq, index) => {
                // Check if we need a new page (leave space for footer)
                if (currentY + rowHeight > doc.page.height - 80) {
                    doc.addPage();
                    currentY = drawTableHeader(40);
                }

                // Alternate row background
                if (index % 2 === 1) {
                    doc
                        .fillColor('#fafafa')
                        .rect(tableX, currentY, contentWidth, rowHeight)
                        .fill()
                        .fillColor('#000000');
                }

                // Row border
                doc.rect(tableX, currentY, contentWidth, rowHeight).stroke();

                // Column separators
                let colX = tableX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                    colX += colWidths[i];
                    doc
                        .moveTo(colX, currentY)
                        .lineTo(colX, currentY + rowHeight)
                        .stroke();
                }

                // Row data
                const liquidationDate = new Date(liq.liquidationDate || liq.liquidation_date || liq.createdAt || liq.created_at);
                const dateStr = liquidationDate.toLocaleDateString('es-CR');
                const memberName = (liq.memberName || liq.member_name || 'N/A').substring(0, 38);
                const typeStr = (liq.liquidationType || liq.liquidation_type) === 'periodic' ? 'Periodica' : 'Retiro';
                const savingsAmount = formatCurrency(liq.totalSavings || liq.total_savings);

                doc.fontSize(9).font('Helvetica');
                colX = tableX;
                doc.text((index + 1).toString(), colX + 5, currentY + 5, { width: colWidths[0] - 10, align: 'center' });
                colX += colWidths[0];
                doc.text(dateStr, colX + 5, currentY + 5, { width: colWidths[1] - 10 });
                colX += colWidths[1];
                doc.text(memberName, colX + 5, currentY + 5, { width: colWidths[2] - 10 });
                colX += colWidths[2];
                doc.text(typeStr, colX + 5, currentY + 5, { width: colWidths[3] - 10, align: 'center' });
                colX += colWidths[3];
                doc.text(savingsAmount, colX + 5, currentY + 5, { width: colWidths[4] - 10, align: 'right' });

                currentY += rowHeight;
            });

            // Total footer row
            doc
                .fillColor('#f0f0f0')
                .rect(tableX, currentY, contentWidth, rowHeight + 2)
                .fill()
                .fillColor('#000000');

            doc.rect(tableX, currentY, contentWidth, rowHeight + 2).stroke();

            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('TOTAL:', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 5, { width: colWidths[3] - 10, align: 'right' })
                .text(formatCurrency(stats.totalSavings), tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 5, currentY + 5, { width: colWidths[4] - 10, align: 'right' });

            currentY += rowHeight + 2;
            doc.y = currentY;
        }

        doc.end();
        return doc;
    } catch (error) {
        logger.error('Error creating liquidations report PDF:', error);
        throw error;
    }
};

/**
 * Create simple attendance list report PDF (for reports page)
 * Matches the HTML design used for desktop printing
 *
 * @param {Array} attendees - List of attendees
 * @param {Object} assembly - Assembly information
 * @returns {PDFDocument} PDF document stream
 */
const createAttendanceListReport = (attendees, assembly) => {
    try {
        const doc = new PDFDocument({
            size: 'LETTER',
            margins: {
                top: 40,
                bottom: 40,
                left: 50,
                right: 50
            }
        });

        const pageWidth = doc.page.width;
        const contentWidth = pageWidth - 100; // 50 margin each side

        // Header with border bottom
        doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text('COOPESUMA R.L.', { align: 'center' })
            .moveDown(0.2);

        doc
            .fontSize(14)
            .text('Lista de Asistencia', { align: 'center' })
            .moveDown(0.5);

        // Header border
        doc
            .moveTo(50, doc.y)
            .lineTo(pageWidth - 50, doc.y)
            .lineWidth(2)
            .stroke();

        doc.moveDown(1);

        // Assembly Information section
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('INFORMACION DE LA ASAMBLEA')
            .moveDown(0.4);

        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Nombre: ', { continued: true })
            .font('Helvetica')
            .text(assembly.title || 'N/A')
            .moveDown(0.2);

        doc
            .font('Helvetica-Bold')
            .text('Fecha Programada: ', { continued: true })
            .font('Helvetica')
            .text(formatDate(assembly.scheduled_date || assembly.scheduledDate))
            .moveDown(0.2);

        if (assembly.start_time || assembly.startTime) {
            doc
                .font('Helvetica-Bold')
                .text('Hora de Inicio: ', { continued: true })
                .font('Helvetica')
                .text(formatTime(assembly.start_time || assembly.startTime))
                .moveDown(0.2);
        }

        if (assembly.end_time || assembly.endTime) {
            doc
                .font('Helvetica-Bold')
                .text('Hora de Finalizacion: ', { continued: true })
                .font('Helvetica')
                .text(formatTime(assembly.end_time || assembly.endTime))
                .moveDown(0.2);
        }

        doc.moveDown(1);

        if (attendees.length === 0) {
            doc
                .fontSize(12)
                .font('Helvetica-Oblique')
                .text('No hay asistentes registrados para esta asamblea.', { align: 'center' });
        } else {
            // Table with full borders
            const colWidths = [40, 230, 100, 120]; // N, Nombre, Cedula, Firma
            const tableX = 50;
            const rowHeight = 22;
            const headerHeight = 24;

            // Function to draw table header
            const drawTableHeader = (y) => {
                // Header background
                doc
                    .fillColor('#f5f5f5')
                    .rect(tableX, y, contentWidth, headerHeight)
                    .fill()
                    .fillColor('#000000');

                // Header border
                doc
                    .lineWidth(1)
                    .rect(tableX, y, contentWidth, headerHeight)
                    .stroke();

                // Bottom border thicker
                doc
                    .lineWidth(2)
                    .moveTo(tableX, y + headerHeight)
                    .lineTo(tableX + contentWidth, y + headerHeight)
                    .stroke()
                    .lineWidth(1);

                // Column separators
                let colX = tableX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                    colX += colWidths[i];
                    doc
                        .moveTo(colX, y)
                        .lineTo(colX, y + headerHeight)
                        .stroke();
                }

                // Header text
                doc.fontSize(10).font('Helvetica-Bold');
                colX = tableX;
                doc.text('N°', colX + 5, y + 7, { width: colWidths[0] - 10, align: 'center' });
                colX += colWidths[0];
                doc.text('NOMBRE COMPLETO', colX + 5, y + 7, { width: colWidths[1] - 10 });
                colX += colWidths[1];
                doc.text('CEDULA', colX + 5, y + 7, { width: colWidths[2] - 10 });
                colX += colWidths[2];
                doc.text('FIRMA', colX + 5, y + 7, { width: colWidths[3] - 10, align: 'center' });

                return y + headerHeight;
            };

            let currentY = drawTableHeader(doc.y);

            // Table rows
            attendees.forEach((attendee, index) => {
                // Check if we need a new page (leave space for summary and footer)
                if (currentY + rowHeight > doc.page.height - 100) {
                    doc.addPage();
                    currentY = drawTableHeader(40);
                }

                // Row border
                doc.rect(tableX, currentY, contentWidth, rowHeight).stroke();

                // Column separators
                let colX = tableX;
                for (let i = 0; i < colWidths.length - 1; i++) {
                    colX += colWidths[i];
                    doc
                        .moveTo(colX, currentY)
                        .lineTo(colX, currentY + rowHeight)
                        .stroke();
                }

                // Row data
                const fullName = (attendee.full_name || attendee.fullName || 'N/A').substring(0, 38);
                const identification = attendee.identification || 'N/A';

                doc.fontSize(9).font('Helvetica');
                colX = tableX;
                doc.text((index + 1).toString(), colX + 5, currentY + 6, { width: colWidths[0] - 10, align: 'center' });
                colX += colWidths[0];
                doc.text(fullName, colX + 5, currentY + 6, { width: colWidths[1] - 10 });
                colX += colWidths[1];
                doc.text(identification, colX + 5, currentY + 6, { width: colWidths[2] - 10 });
                // Firma column is left empty for signatures

                currentY += rowHeight;
            });

            doc.y = currentY;

            // Summary box
            doc.moveDown(1);
            const summaryY = doc.y;
            doc
                .fillColor('#f5f5f5')
                .rect(tableX, summaryY, contentWidth, 25)
                .fill()
                .fillColor('#000000');

            doc.rect(tableX, summaryY, contentWidth, 25).stroke();

            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .text(`Total de Asistentes: ${attendees.length}`, tableX, summaryY + 7, { width: contentWidth, align: 'center' });

            doc.y = summaryY + 25;
        }

        doc.end();
        return doc;
    } catch (error) {
        logger.error('Error creating attendance list report PDF:', error);
        throw error;
    }
};

module.exports = {
    createAttendanceReport,
    createAttendanceStatsReport,
    createLiquidationsReport,
    createAttendanceListReport,
    formatDate,
    formatTime,
    formatCurrency
};
