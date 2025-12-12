/**
 * BatchMemberCardsPrint Component
 * Componente para impresion de carnets de miembros en lote
 */

import React from 'react';
import PropTypes from 'prop-types';

const BatchMemberCardsPrint = ({
    members = [],
    cooperativeName = 'Coopesuma'
}) => {
    const printDate = new Date().toLocaleString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="batch-cards-print">
            <style>{`
                .batch-cards-print {
                    background: white;
                    padding: 5mm;
                    font-family: 'Arial', sans-serif;
                }
                .batch-cards-print .carnets-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 5mm;
                    width: 100%;
                    justify-items: center;
                }
                .batch-cards-print .carnet-wrapper {
                    page-break-inside: avoid;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .batch-cards-print .member-card {
                    width: 100mm;
                    height: 63mm;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .batch-cards-print .card-header {
                    background: #2563eb;
                    padding: 1mm 3mm;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .batch-cards-print .card-title {
                    font-size: 16pt;
                    font-weight: bold;
                    color: white;
                    margin: 0;
                    line-height: 1;
                }
                .batch-cards-print .card-body {
                    flex: 1;
                    display: flex;
                    padding: 3mm 4mm;
                    gap: 3mm;
                    align-items: center;
                }
                .batch-cards-print .card-photo {
                    width: 24mm;
                    height: 30mm;
                    flex-shrink: 0;
                }
                .batch-cards-print .photo-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                }
                .batch-cards-print .photo-placeholder {
                    width: 100%;
                    height: 100%;
                    background: #f3f4f6;
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .batch-cards-print .placeholder-icon {
                    width: 12mm;
                    height: 12mm;
                    color: #9ca3af;
                }
                .batch-cards-print .card-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 1mm;
                    min-width: 0;
                }
                .batch-cards-print .member-name {
                    font-size: 11pt;
                    font-weight: bold;
                    color: #1f2937;
                    margin: 0;
                    line-height: 1.2;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                .batch-cards-print .member-detail {
                    font-size: 9pt;
                    color: #4b5563;
                    margin: 0;
                    line-height: 1.3;
                }
                .batch-cards-print .detail-label {
                    font-weight: 600;
                    color: #374151;
                }
                .batch-cards-print .card-qr {
                    width: 30mm;
                    height: 30mm;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .batch-cards-print .qr-img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .batch-cards-print .qr-placeholder {
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
                .batch-cards-print .card-footer {
                    background: white;
                    padding: 2mm 4mm;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }
                .batch-cards-print .footer-text {
                    font-size: 7pt;
                    color: #64748b;
                    margin: 0;
                }
                .batch-cards-print .print-info {
                    text-align: center;
                    margin-top: 20mm;
                    padding-top: 10mm;
                    border-top: 1px solid #e5e7eb;
                    font-size: 9pt;
                    color: #6b7280;
                }
                @media print {
                    .batch-cards-print {
                        padding: 5mm !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .batch-cards-print .carnets-grid {
                        gap: 5mm !important;
                    }
                    .batch-cards-print .member-card {
                        box-shadow: none !important;
                        width: 100mm !important;
                        height: 63mm !important;
                    }
                    .batch-cards-print .card-header {
                        background: #2563eb !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .batch-cards-print .carnet-wrapper:nth-child(4n) {
                        page-break-after: always;
                    }
                    .batch-cards-print .print-info {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="carnets-grid">
                {members.map((member, index) => (
                    <div key={member.memberId || index} className="carnet-wrapper">
                        <div className="member-card">
                            {/* Header */}
                            <div className="card-header">
                                <h1 className="card-title">{cooperativeName}</h1>
                            </div>

                            {/* Body */}
                            <div className="card-body">
                                {/* Photo */}
                                <div className="card-photo">
                                    {member.photoUrl ? (
                                        <img
                                            src={member.photoUrl}
                                            alt={member.fullName}
                                            className="photo-img"
                                        />
                                    ) : (
                                        <div className="photo-placeholder">
                                            <svg className="placeholder-icon" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Member Info */}
                                <div className="card-info">
                                    <p className="member-name">{member.fullName}</p>
                                    <p className="member-detail">
                                        <span className="detail-label">Cedula:</span> {member.identification}
                                    </p>
                                </div>

                                {/* QR Code */}
                                <div className="card-qr">
                                    {member.qrCodeDataUrl ? (
                                        <img
                                            src={member.qrCodeDataUrl}
                                            alt={`QR ${member.fullName}`}
                                            className="qr-img"
                                        />
                                    ) : (
                                        <div className="qr-placeholder">
                                            <p>No QR</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="card-footer">
                                <p className="footer-text">Cooperativa Estudiantil</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="print-info">
                Documento generado el {printDate} - {cooperativeName} R.L.<br />
                Total de carnets: {members.length}
            </div>
        </div>
    );
};

BatchMemberCardsPrint.propTypes = {
    members: PropTypes.arrayOf(PropTypes.shape({
        memberId: PropTypes.number,
        fullName: PropTypes.string,
        identification: PropTypes.string,
        photoUrl: PropTypes.string,
        qrCodeDataUrl: PropTypes.string
    })),
    cooperativeName: PropTypes.string
};

export default BatchMemberCardsPrint;
