/**
 * LiquidationReceiptPrint Component
 * Componente de recibo de liquidacion para impresion
 */

import React from 'react';
import PropTypes from 'prop-types';

const LiquidationReceiptPrint = ({
    member = {},
    liquidationType = 'periodic',
    savingsAmount = 0,
    totalAmount = 0,
    notes = '',
    liquidationDate = new Date(),
    liquidationId = '',
    receiptNumber = ''
}) => {
    const typeLabel = liquidationType === 'periodic' ? 'PERIODICA' : 'POR RETIRO';
    const typeColor = liquidationType === 'periodic' ? '#2563eb' : '#dc2626';

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

    return (
        <div className="liquidation-receipt-print" style={{ fontFamily: "'Courier New', monospace", maxWidth: '300px', margin: '0 auto' }}>
            <style>{`
                .liquidation-receipt-print {
                    background: white;
                    padding: 10px;
                    color: #000;
                }
                .liquidation-receipt-print .receipt {
                    border: 2px dashed #000;
                    padding: 15px;
                }
                .liquidation-receipt-print .receipt-header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .liquidation-receipt-print .receipt-header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 0 0 5px 0;
                }
                .liquidation-receipt-print .receipt-header .subtitle {
                    font-size: 11px;
                    color: #666;
                }
                .liquidation-receipt-print .transaction-type {
                    text-align: center;
                    padding: 8px;
                    margin: 10px 0;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    border-radius: 4px;
                }
                .liquidation-receipt-print .receipt-body {
                    font-size: 11px;
                    line-height: 1.6;
                }
                .liquidation-receipt-print .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    border-bottom: 1px dotted #ccc;
                }
                .liquidation-receipt-print .receipt-row:last-child {
                    border-bottom: none;
                }
                .liquidation-receipt-print .receipt-row .label {
                    font-weight: bold;
                    color: #333;
                }
                .liquidation-receipt-print .receipt-row .value {
                    text-align: right;
                    max-width: 60%;
                    word-break: break-word;
                }
                .liquidation-receipt-print .amount-section {
                    background: #f5f5f5;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 4px;
                }
                .liquidation-receipt-print .amount-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    font-size: 11px;
                }
                .liquidation-receipt-print .amount-row.total {
                    border-top: 2px solid #000;
                    margin-top: 5px;
                    padding-top: 8px;
                    font-weight: bold;
                    font-size: 13px;
                }
                .liquidation-receipt-print .amount-row .amount {
                    font-family: 'Courier New', monospace;
                    color: #16a34a;
                    font-weight: bold;
                }
                .liquidation-receipt-print .description-section {
                    margin: 10px 0;
                    padding: 8px;
                    background: #fafafa;
                    border-left: 3px solid #666;
                    font-size: 10px;
                }
                .liquidation-receipt-print .description-section .desc-label {
                    font-weight: bold;
                    margin-bottom: 3px;
                }
                .liquidation-receipt-print .info-banner {
                    margin: 15px 0;
                    padding: 10px;
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 4px;
                    font-size: 10px;
                    text-align: center;
                }
                .liquidation-receipt-print .receipt-footer {
                    text-align: center;
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                    margin-top: 15px;
                    font-size: 9px;
                    color: #666;
                }
                .liquidation-receipt-print .receipt-footer .thank-you {
                    font-size: 11px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 5px;
                }
                .liquidation-receipt-print .signature-section {
                    margin-top: 20px;
                    padding-top: 10px;
                }
                .liquidation-receipt-print .signature-line {
                    border-top: 1px solid #000;
                    width: 80%;
                    margin: 30px auto 5px;
                }
                .liquidation-receipt-print .signature-label {
                    text-align: center;
                    font-size: 9px;
                    color: #666;
                }
                @media print {
                    .liquidation-receipt-print {
                        padding: 0 !important;
                    }
                    .liquidation-receipt-print .receipt {
                        border: none !important;
                    }
                    .liquidation-receipt-print .amount-section,
                    .liquidation-receipt-print .transaction-type,
                    .liquidation-receipt-print .info-banner {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="receipt">
                <div className="receipt-header">
                    <h1>COOPESUMA R.L.</h1>
                    <div className="subtitle">Cooperativa de Ahorro</div>
                    <div className="subtitle">Sistema de Gestion</div>
                </div>

                <div className="transaction-type" style={{ backgroundColor: typeColor }}>
                    RECIBO DE LIQUIDACION {typeLabel}
                </div>

                <div className="receipt-body">
                    <div className="receipt-row">
                        <span className="label">Fecha:</span>
                        <span className="value">{formatDate(liquidationDate)}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="label">Hora:</span>
                        <span className="value">{formatTime(liquidationDate)}</span>
                    </div>
                    {receiptNumber && (
                        <div className="receipt-row">
                            <span className="label">Recibo No:</span>
                            <span className="value">{receiptNumber}</span>
                        </div>
                    )}
                    {liquidationId && (
                        <div className="receipt-row">
                            <span className="label">Liquidacion:</span>
                            <span className="value">#{liquidationId}</span>
                        </div>
                    )}
                    <div className="receipt-row">
                        <span className="label">Asociado:</span>
                        <span className="value">{member.memberCode || 'N/A'}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="label">Nombre:</span>
                        <span className="value">{member.fullName || 'N/A'}</span>
                    </div>
                </div>

                <div className="amount-section">
                    <div className="amount-row total">
                        <span>Total Liquidado:</span>
                        <span className="amount">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '10px', textAlign: 'center', color: '#666' }}>
                        (Cuenta de Ahorros)
                    </div>
                </div>

                {notes && (
                    <div className="description-section">
                        <div className="desc-label">Notas:</div>
                        <div>{notes}</div>
                    </div>
                )}

                <div className="info-banner">
                    <strong>{liquidationType === 'periodic' ? 'Liquidacion Periodica' : 'Liquidacion por Retiro'}</strong><br />
                    {liquidationType === 'periodic'
                        ? 'El asociado continua activo en la cooperativa'
                        : 'El asociado se retira de la cooperativa'}
                </div>

                <div className="signature-section">
                    <div className="signature-line"></div>
                    <div className="signature-label">Firma del Asociado</div>
                </div>

                <div className="receipt-footer">
                    <div className="thank-you">Gracias por su confianza!</div>
                    <div>Documento generado el {printDate}</div>
                    <div>COOPESUMA R.L.</div>
                </div>
            </div>
        </div>
    );
};

LiquidationReceiptPrint.propTypes = {
    member: PropTypes.shape({
        memberCode: PropTypes.string,
        fullName: PropTypes.string
    }),
    liquidationType: PropTypes.oneOf(['periodic', 'exit']),
    savingsAmount: PropTypes.number,
    totalAmount: PropTypes.number,
    notes: PropTypes.string,
    liquidationDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    liquidationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    receiptNumber: PropTypes.string
};

export default LiquidationReceiptPrint;
