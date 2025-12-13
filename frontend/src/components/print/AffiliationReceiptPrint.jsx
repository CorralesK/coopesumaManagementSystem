/**
 * AffiliationReceiptPrint Component
 * Componente de recibo de afiliacion para impresion
 */

import React from 'react';
import PropTypes from 'prop-types';

const AffiliationReceiptPrint = ({
    member = {},
    amount = 500,
    receiptNumber = '',
    date = new Date(),
    fiscalYear = new Date().getFullYear()
}) => {
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

    const printDate = new Date().toLocaleString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="affiliation-receipt-print" style={{ fontFamily: "'Courier New', monospace", maxWidth: '300px', margin: '0 auto' }}>
            <style>{`
                .affiliation-receipt-print {
                    background: white;
                    padding: 10px;
                    color: #000;
                }
                .affiliation-receipt-print .receipt {
                    border: 2px dashed #000;
                    padding: 15px;
                }
                .affiliation-receipt-print .receipt-header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .affiliation-receipt-print .receipt-header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 0 0 5px 0;
                }
                .affiliation-receipt-print .receipt-header .subtitle {
                    font-size: 11px;
                    color: #666;
                }
                .affiliation-receipt-print .transaction-type {
                    text-align: center;
                    padding: 8px;
                    margin: 10px 0;
                    background: #2563eb;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    border-radius: 4px;
                }
                .affiliation-receipt-print .receipt-body {
                    font-size: 11px;
                    line-height: 1.6;
                }
                .affiliation-receipt-print .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    border-bottom: 1px dotted #ccc;
                }
                .affiliation-receipt-print .receipt-row:last-child {
                    border-bottom: none;
                }
                .affiliation-receipt-print .receipt-row .label {
                    font-weight: bold;
                    color: #333;
                }
                .affiliation-receipt-print .receipt-row .value {
                    text-align: right;
                    max-width: 60%;
                    word-break: break-word;
                }
                .affiliation-receipt-print .amount-section {
                    background: #f5f5f5;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 4px;
                }
                .affiliation-receipt-print .amount-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    font-size: 11px;
                }
                .affiliation-receipt-print .amount-row.total {
                    border-top: 2px solid #000;
                    margin-top: 5px;
                    padding-top: 8px;
                    font-weight: bold;
                    font-size: 13px;
                }
                .affiliation-receipt-print .amount-row .amount {
                    font-family: 'Courier New', monospace;
                }
                .affiliation-receipt-print .receipt-footer {
                    text-align: center;
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                    margin-top: 15px;
                    font-size: 10px;
                    color: #666;
                }
                .affiliation-receipt-print .signature-section {
                    margin-top: 20px;
                    padding-top: 10px;
                }
                .affiliation-receipt-print .signature-line {
                    border-top: 1px solid #000;
                    width: 200px;
                    margin: 20px auto 5px;
                }
                .affiliation-receipt-print .signature-label {
                    text-align: center;
                    font-size: 10px;
                    color: #666;
                }
                @media print {
                    .affiliation-receipt-print {
                        padding: 0 !important;
                        page-break-after: avoid !important;
                        page-break-before: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    .affiliation-receipt-print .receipt {
                        border: none !important;
                        page-break-inside: avoid !important;
                    }
                    .affiliation-receipt-print .amount-section,
                    .affiliation-receipt-print .transaction-type {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="receipt">
                <div className="receipt-header">
                    <h1>COOPESUMA R.L.</h1>
                    <div className="subtitle">Escuela Los Chiles, Aguas Zarcas</div>
                    <div className="subtitle">Cooperativa Estudiantil</div>
                </div>

                <div className="transaction-type">
                    RECIBO DE AFILIACION
                </div>

                <div className="receipt-body">
                    <div className="receipt-row">
                        <span className="label">Recibo No:</span>
                        <span className="value">{receiptNumber}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="label">Fecha:</span>
                        <span className="value">{formatDate(date)}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="label">Hora:</span>
                        <span className="value">{formatTime(date)}</span>
                    </div>
                </div>

                <div className="amount-section">
                    <div className="receipt-row">
                        <span className="label">Nombre:</span>
                        <span className="value">{member.full_name || member.fullName || ''}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="label">Cedula:</span>
                        <span className="value">{member.identification || ''}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="label">Codigo:</span>
                        <span className="value">{member.member_code || member.memberCode || ''}</span>
                    </div>
                </div>

                <div className="amount-section">
                    <div className="receipt-row">
                        <span className="label">Concepto:</span>
                        <span className="value">Cuota de Afiliacion</span>
                    </div>
                    <div className="amount-row total">
                        <span className="label">TOTAL:</span>
                        <span className="amount">{formatCurrency(amount)}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="label">Ano Fiscal:</span>
                        <span className="value">{fiscalYear}</span>
                    </div>
                </div>

                <div className="signature-section">
                    <div className="signature-line"></div>
                    <div className="signature-label">Firma del Tesorero/Autorizado</div>
                </div>

                <div className="receipt-footer">
                    <div>Impreso: {printDate}</div>
                    <div style={{ marginTop: '5px' }}>Sistema de Gestion CoopeSuma</div>
                    <div style={{ marginTop: '8px', fontSize: '9px' }}>Bienvenido a la familia CoopeSuma!</div>
                </div>
            </div>
        </div>
    );
};

AffiliationReceiptPrint.propTypes = {
    member: PropTypes.shape({
        full_name: PropTypes.string,
        fullName: PropTypes.string,
        identification: PropTypes.string,
        member_code: PropTypes.string,
        memberCode: PropTypes.string
    }),
    amount: PropTypes.number,
    receiptNumber: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    fiscalYear: PropTypes.number
};

export default AffiliationReceiptPrint;
