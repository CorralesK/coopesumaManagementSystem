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
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2
    }).format(amount || 0);
};

/**
 * Create liquidations report PDF
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
            .text('COOPESUMA R.L.', { align: 'center' })
            .moveDown(0.3);

        doc
            .fontSize(14)
            .text('Reporte de Liquidaciones', { align: 'center' })
            .moveDown(0.5);

        // Date range
        doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Periodo: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`, { align: 'center' })
            .moveDown(1);

        // Statistics summary
        doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text('Resumen:')
            .moveDown(0.3);

        doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Total de liquidaciones: ${stats.total}`)
            .text(`Liquidaciones periódicas: ${stats.periodic}`)
            .text(`Liquidaciones por retiro: ${stats.exit}`)
            .text(`Total en ahorros liquidados: ${formatCurrency(stats.totalSavings)}`)
            .moveDown(1);

        if (liquidations.length === 0) {
            doc
                .fontSize(12)
                .font('Helvetica-Oblique')
                .text('No hay liquidaciones en el periodo seleccionado.', { align: 'center' });
        } else {
            // Table Header
            const tableTop = doc.y;
            const col1X = 50;   // N°
            const col2X = 80;   // Fecha
            const col3X = 160;  // Asociado
            const col4X = 380;  // Tipo
            const col5X = 460;  // Monto

            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('N°', col1X, tableTop)
                .text('Fecha', col2X, tableTop)
                .text('Asociado', col3X, tableTop)
                .text('Tipo', col4X, tableTop)
                .text('Ahorros', col5X, tableTop);

            // Draw header line
            doc
                .moveTo(50, tableTop + 15)
                .lineTo(doc.page.width - 50, tableTop + 15)
                .stroke();

            let currentY = tableTop + 25;
            const rowHeight = 20;

            // Table Rows
            liquidations.forEach((liq, index) => {
                // Check if we need a new page
                if (currentY + rowHeight > doc.page.height - 70) {
                    doc.addPage();
                    currentY = 50;

                    // Repeat header on new page
                    doc
                        .fontSize(10)
                        .font('Helvetica-Bold')
                        .text('N°', col1X, currentY)
                        .text('Fecha', col2X, currentY)
                        .text('Asociado', col3X, currentY)
                        .text('Tipo', col4X, currentY)
                        .text('Ahorros', col5X, currentY);

                    doc
                        .moveTo(50, currentY + 15)
                        .lineTo(doc.page.width - 50, currentY + 15)
                        .stroke();

                    currentY += 25;
                }

                const liquidationDate = new Date(liq.liquidationDate || liq.liquidation_date || liq.createdAt || liq.created_at);
                const dateStr = liquidationDate.toLocaleDateString('es-CR');
                const memberName = (liq.memberName || liq.member_name || 'N/A').substring(0, 35);
                const typeStr = (liq.liquidationType || liq.liquidation_type) === 'periodic' ? 'Periódica' : 'Retiro';
                const savingsAmount = formatCurrency(liq.totalSavings || liq.total_savings);

                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .text((index + 1).toString(), col1X, currentY)
                    .text(dateStr, col2X, currentY)
                    .text(memberName, col3X, currentY)
                    .text(typeStr, col4X, currentY)
                    .text(savingsAmount, col5X, currentY);

                currentY += rowHeight;
            });

            // Total row
            currentY += 10;
            doc
                .moveTo(50, currentY)
                .lineTo(doc.page.width - 50, currentY)
                .stroke();

            currentY += 10;
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('TOTAL:', col4X, currentY)
                .text(formatCurrency(stats.totalSavings), col5X, currentY);
        }

        // Footer
        doc
            .fontSize(8)
            .font('Helvetica')
            .text(
                `Documento generado el ${formatDate(new Date())} - COOPESUMA R.L.`,
                50,
                doc.page.height - 40,
                { align: 'center' }
            );

        return doc;
    } catch (error) {
        logger.error('Error creating liquidations report PDF:', error);
        throw error;
    }
};

/**
 * Create simple attendance list report PDF (for reports page)
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
            .text('COOPESUMA R.L.', { align: 'center' })
            .moveDown(0.3);

        doc
            .fontSize(14)
            .text('Lista de Asistencia', { align: 'center' })
            .moveDown(1);

        // Assembly Information
        doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text('Información de la Asamblea')
            .moveDown(0.3);

        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Nombre: ', { continued: true })
            .font('Helvetica')
            .text(assembly.title || 'N/A')
            .moveDown(0.2);

        doc
            .font('Helvetica-Bold')
            .text('Fecha: ', { continued: true })
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

        doc.moveDown(1);

        if (attendees.length === 0) {
            doc
                .fontSize(12)
                .font('Helvetica-Oblique')
                .text('No hay asistentes registrados para esta asamblea.', { align: 'center' });
        } else {
            // Table Header
            const tableTop = doc.y;
            const col1X = 50;   // N°
            const col2X = 80;   // Nombre
            const col3X = 320;  // Cédula
            const col4X = 420;  // Firma

            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('N°', col1X, tableTop)
                .text('Nombre Completo', col2X, tableTop)
                .text('Cédula', col3X, tableTop)
                .text('Firma', col4X, tableTop);

            // Draw header line
            doc
                .moveTo(50, tableTop + 15)
                .lineTo(doc.page.width - 50, tableTop + 15)
                .stroke();

            let currentY = tableTop + 25;
            const rowHeight = 25;

            // Table Rows
            attendees.forEach((attendee, index) => {
                // Check if we need a new page
                if (currentY + rowHeight > doc.page.height - 70) {
                    doc.addPage();
                    currentY = 50;

                    // Repeat header on new page
                    doc
                        .fontSize(10)
                        .font('Helvetica-Bold')
                        .text('N°', col1X, currentY)
                        .text('Nombre Completo', col2X, currentY)
                        .text('Cédula', col3X, currentY)
                        .text('Firma', col4X, currentY);

                    doc
                        .moveTo(50, currentY + 15)
                        .lineTo(doc.page.width - 50, currentY + 15)
                        .stroke();

                    currentY += 25;
                }

                const fullName = (attendee.full_name || attendee.fullName || 'N/A').substring(0, 40);
                const identification = attendee.identification || 'N/A';

                doc
                    .fontSize(9)
                    .font('Helvetica')
                    .text((index + 1).toString(), col1X, currentY)
                    .text(fullName, col2X, currentY)
                    .text(identification, col3X, currentY);

                // Signature box
                doc
                    .rect(col4X, currentY - 3, 80, 18)
                    .stroke();

                currentY += rowHeight;
            });

            // Summary
            doc.moveDown(2);
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .text(`Total de Asistentes: ${attendees.length}`, { align: 'center' });
        }

        // Footer
        doc
            .fontSize(8)
            .font('Helvetica')
            .text(
                `Documento generado el ${formatDate(new Date())} - COOPESUMA R.L.`,
                50,
                doc.page.height - 40,
                { align: 'center' }
            );

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
