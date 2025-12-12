/**
 * AttendanceListPrint Component
 * Componente de lista de asistencia para impresión
 */

import React from 'react';
import PropTypes from 'prop-types';

const AttendanceListPrint = ({ attendees = [], assembly = {}, title = 'Lista de Asistencia' }) => {
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

    return (
        <div className="print-attendance-list" style={{ fontFamily: "'Times New Roman', Times, serif", color: '#000', lineHeight: 1.6 }}>
            <style>{`
                .print-attendance-list {
                    background: white;
                    padding: 20px;
                }
                .print-attendance-list .document-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #000;
                }
                .print-attendance-list .document-header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin: 0 0 8px 0;
                }
                .print-attendance-list .document-header .subtitle {
                    font-size: 14px;
                    font-weight: normal;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .print-attendance-list .assembly-info {
                    margin-bottom: 25px;
                }
                .print-attendance-list .assembly-info h2 {
                    font-size: 14px;
                    font-weight: bold;
                    margin: 0 0 12px 0;
                    text-transform: uppercase;
                }
                .print-attendance-list .info-row {
                    display: flex;
                    margin-bottom: 6px;
                    font-size: 12px;
                }
                .print-attendance-list .info-row .label {
                    font-weight: bold;
                    width: 150px;
                    flex-shrink: 0;
                }
                .print-attendance-list .attendees-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                    border: 2px solid #000;
                }
                .print-attendance-list .attendees-table th {
                    padding: 10px 8px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                    border: 1px solid #000;
                    border-bottom: 2px solid #000;
                    background: #f5f5f5;
                }
                .print-attendance-list .attendees-table th:first-child {
                    width: 50px;
                    text-align: center;
                }
                .print-attendance-list .attendees-table th:nth-child(3) {
                    width: 120px;
                }
                .print-attendance-list .attendees-table th:last-child {
                    width: 150px;
                    text-align: center;
                }
                .print-attendance-list .attendees-table td {
                    padding: 10px 8px;
                    font-size: 11px;
                    border: 1px solid #000;
                    min-height: 40px;
                }
                .print-attendance-list .attendees-table td:first-child {
                    text-align: center;
                    font-weight: bold;
                }
                .print-attendance-list .attendees-table td:last-child {
                    text-align: center;
                }
                .print-attendance-list .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #000;
                    font-size: 9px;
                    text-align: center;
                }
                .print-attendance-list .no-data {
                    text-align: center;
                    padding: 40px;
                    font-style: italic;
                    font-size: 12px;
                }
                @media print {
                    .print-attendance-list {
                        padding: 0 !important;
                    }
                    .print-attendance-list .attendees-table th {
                        background: #f5f5f5 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="document-header">
                <h1>COOPESUMA R.L.</h1>
                <div className="subtitle">{title}</div>
            </div>

            <div className="assembly-info">
                <h2>Informacion de la Asamblea</h2>
                <div className="info-row">
                    <span className="label">Nombre:</span>
                    <span className="value">{assembly.title || 'N/A'}</span>
                </div>
                <div className="info-row">
                    <span className="label">Fecha Programada:</span>
                    <span className="value">{formatDate(assembly.scheduledDate)}</span>
                </div>
                {assembly.startTime && (
                    <div className="info-row">
                        <span className="label">Hora de Inicio:</span>
                        <span className="value">{assembly.startTime.substring(0, 5)}</span>
                    </div>
                )}
                {assembly.endTime && (
                    <div className="info-row">
                        <span className="label">Hora de Finalizacion:</span>
                        <span className="value">{assembly.endTime.substring(0, 5)}</span>
                    </div>
                )}
                <div className="info-row">
                    <span className="label">Total Asistentes:</span>
                    <span className="value">{attendees.length}</span>
                </div>
            </div>

            {attendees.length > 0 ? (
                <div className="attendees-section">
                    <table className="attendees-table">
                        <thead>
                            <tr>
                                <th>N</th>
                                <th>Nombre Completo</th>
                                <th>Cedula</th>
                                <th>Firma</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendees.map((attendee, index) => (
                                <tr key={attendee.memberId || index}>
                                    <td>{index + 1}</td>
                                    <td>{attendee.fullName || 'N/A'}</td>
                                    <td>{attendee.identification || 'N/A'}</td>
                                    <td>&nbsp;</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="no-data">
                    No hay asistentes registrados para esta asamblea.
                </div>
            )}

            <div className="footer">
                Documento generado el {printDate} - COOPESUMA R.L.
            </div>
        </div>
    );
};

AttendanceListPrint.propTypes = {
    attendees: PropTypes.arrayOf(PropTypes.shape({
        memberId: PropTypes.number,
        fullName: PropTypes.string,
        identification: PropTypes.string
    })),
    assembly: PropTypes.shape({
        title: PropTypes.string,
        scheduledDate: PropTypes.string,
        startTime: PropTypes.string,
        endTime: PropTypes.string
    }),
    title: PropTypes.string
};

export default AttendanceListPrint;
