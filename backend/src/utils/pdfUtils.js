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

module.exports = {
    createAttendanceReport,
    createAttendanceStatsReport,
    formatDate,
    formatTime
};
