/**
 * @file MemberCard.jsx
 * @description Professional student ID card component with QR code
 * @module components/members
 */

import React from 'react';
import PropTypes from 'prop-types';
import CoopesumaLogo from '../../assets/logos/CoopesumaLogo.png';

/**
 * MemberCard Component
 * Renders a professional student ID card (85.6mm x 54mm - credit card size)
 *
 * @param {Object} props - Component props
 * @param {Object} props.member - Member data
 * @param {string} props.member.fullName - Member's full name
 * @param {string} props.member.identification - Member's ID number
 * @param {string} props.member.qualityName - Member's quality (Estudiante/Funcionario)
 * @param {string} props.member.levelName - Member's level (optional)
 * @param {string} props.member.photoUrl - Member's photo URL
 * @param {string} props.member.qrCodeDataUrl - QR code data URL
 * @param {string} props.cooperativeName - Cooperative trade name (optional, defaults to 'Coopesuma')
 * @param {boolean} props.showCutLines - Whether to show cutting guide lines (default: false)
 */
const MemberCard = ({ member, cooperativeName = 'Coopesuma', showCutLines = false }) => {
    return (
        <div className={`member-card-container ${showCutLines ? 'with-cut-lines' : ''}`}>
            {/* ID Card */}
            <div className="member-card">
                {/* Header */}
                <div className="card-header">
                    <img src={CoopesumaLogo} alt="COOPESUMA" className="header-logo" />
                    <span className="header-title">COOPESUMA</span>
                </div>

                {/* Main Content */}
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

                    {/* Member Information */}
                    <div className="card-info">
                        <p className="member-name">{member.fullName}</p>
                        <p className="member-detail">
                            <span className="detail-label">Cedula:</span> <span className="detail-value">{member.identification}</span>
                        </p>
                        {member.memberCode && (
                            <p className="member-detail">
                                <span className="detail-label">N° Asociado:</span> <span className="detail-value">{member.memberCode}</span>
                            </p>
                        )}
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

            {/* CSS Styles */}
            <style>{`
                .member-card-container {
                    position: relative;
                    page-break-inside: avoid;
                }

                .with-cut-lines {
                    border: 1px dashed #cbd5e0;
                    padding: 5mm;
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
                    background: white;
                    padding: 2mm 3mm;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2mm;
                    border-bottom: 1px solid #e5e7eb;
                }

                .header-logo {
                    height: 8mm;
                    width: auto;
                    object-fit: contain;
                }

                .header-title {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #2563eb;
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
                    gap: 0.5mm;
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

                .detail-value {
                    color: #2563eb;
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

                /* Print Styles */
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    .member-card {
                        box-shadow: none;
                    }

                    .card-header {
                        background: white !important;
                    }

                    .with-cut-lines {
                        border-color: #cbd5e0;
                    }

                    @page {
                        margin: 0;
                    }
                }
            `}</style>
        </div>
    );
};

MemberCard.propTypes = {
    member: PropTypes.shape({
        fullName: PropTypes.string.isRequired,
        identification: PropTypes.string.isRequired,
        memberCode: PropTypes.string,
        qualityName: PropTypes.string,
        levelName: PropTypes.string,
        photoUrl: PropTypes.string,
        qrCodeDataUrl: PropTypes.string
    }).isRequired,
    cooperativeName: PropTypes.string,
    showCutLines: PropTypes.bool
};

export default MemberCard;
