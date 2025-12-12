/**
 * SavingsReceiptPrint Component
 * Componente de recibo de ahorro para impresión
 */

import React from 'react';
import PropTypes from 'prop-types';

const SavingsReceiptPrint = ({
    transactionType = 'deposit',
    member = {},
    amount = 0,
    previousBalance = 0,
    newBalance = 0,
    description = '',
    transactionDate = new Date(),
    transactionId = ''
}) => {
    const isDeposit = transactionType === 'deposit';
    const transactionLabel = isDeposit ? 'DEPOSITO' : 'RETIRO';
    const transactionColor = isDeposit ? '#16a34a' : '#dc2626';

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
        <div className="savings-receipt-print" style={{ fontFamily: "'Courier New', monospace", maxWidth: '300px', margin: '0 auto' }}>
            <style>{`
                .savings-receipt-print {
                    background: white;
                    padding: 10px;
                    color: #000;
                }
                .savings-receipt-print .receipt {
                    border: 2px dashed #000;
                    padding: 15px;
                }
                .savings-receipt-print .receipt-header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .savings-receipt-print .receipt-header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 0 0 5px 0;
                }
                .savings-receipt-print .receipt-header .subtitle {
                    font-size: 11px;
                    color: #666;
                }
                .savings-receipt-print .transaction-type {
                    text-align: center;
                    padding: 8px;
                    margin: 10px 0;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    border-radius: 4px;
                }
                .savings-receipt-print .receipt-body {
                    font-size: 11px;
                    line-height: 1.6;
                }
                .savings-receipt-print .receipt-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 3px 0;
                    border-bottom: 1px dotted #ccc;
                }
                .savings-receipt-print .receipt-row:last-child {
                    border-bottom: none;
                }
                .savings-receipt-print .receipt-row .label {
                    font-weight: bold;
                    color: #333;
                }
                .savings-receipt-print .receipt-row .value {
                    text-align: right;
                    max-width: 60%;
                    word-break: break-word;
                }
                .savings-receipt-print .amount-section {
                    background: #f5f5f5;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 4px;
                }
                .savings-receipt-print .amount-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    font-size: 11px;
                }
                .savings-receipt-print .amount-row.total {
                    border-top: 2px solid #000;
                    margin-top: 5px;
                    padding-top: 8px;
                    font-weight: bold;
                    font-size: 13px;
                }
                .savings-receipt-print .amount-row .amount {
                    font-family: 'Courier New', monospace;
                }
                .savings-receipt-print .amount-row .amount.positive {
                    color: #16a34a;
                }
                .savings-receipt-print .amount-row .amount.negative {
                    color: #dc2626;
                }
                .savings-receipt-print .description-section {
                    margin: 10px 0;
                    padding: 8px;
                    background: #fafafa;
                    border-left: 3px solid #666;
                    font-size: 10px;
                }
                .savings-receipt-print .description-section .desc-label {
                    font-weight: bold;
                    margin-bottom: 3px;
                }
                .savings-receipt-print .receipt-footer {
                    text-align: center;
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                    margin-top: 15px;
                    font-size: 9px;
                    color: #666;
                }
                .savings-receipt-print .receipt-footer .thank-you {
                    font-size: 11px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 5px;
                }
                .savings-receipt-print .signature-section {
                    margin-top: 20px;
                    padding-top: 10px;
                }
                .savings-receipt-print .signature-line {
                    border-top: 1px solid #000;
                    width: 80%;
                    margin: 30px auto 5px;
                }
                .savings-receipt-print .signature-label {
                    text-align: center;
                    font-size: 9px;
                    color: #666;
                }
                @media print {
                    .savings-receipt-print {
                        padding: 0 !important;
                    }
                    .savings-receipt-print .receipt {
                        border: none !important;
                    }
                    .savings-receipt-print .amount-section,
                    .savings-receipt-print .transaction-type {
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

                <div className="transaction-type" style={{ backgroundColor: transactionColor }}>
                    RECIBO DE {transactionLabel}
                </div>

                <div className="receipt-body">
                    <div className="receipt-row">
                        <span className="label">Fecha:</span>
                        <span className="value">{formatDate(transactionDate)}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="label">Hora:</span>
                        <span className="value">{formatTime(transactionDate)}</span>
                    </div>
                    {transactionId && (
                        <div className="receipt-row">
                            <span className="label">N Trans:</span>
                            <span className="value">{transactionId}</span>
                        </div>
                    )}
                    <div className="receipt-row">
                        <span className="label">Asociado:</span>
                        <span className="value">{member.member_code || member.memberCode || 'N/A'}</span>
                    </div>
                    <div className="receipt-row">
                        <span className="label">Nombre:</span>
                        <span className="value">{member.full_name || member.fullName || 'N/A'}</span>
                    </div>
                </div>

                <div className="amount-section">
                    <div className="amount-row">
                        <span>Saldo Anterior:</span>
                        <span className="amount">{formatCurrency(previousBalance)}</span>
                    </div>
                    <div className="amount-row">
                        <span>{isDeposit ? 'Deposito:' : 'Retiro:'}</span>
                        <span className={`amount ${isDeposit ? 'positive' : 'negative'}`}>
                            {isDeposit ? '+' : '-'}{formatCurrency(amount)}
                        </span>
                    </div>
                    <div className="amount-row total">
                        <span>Nuevo Saldo:</span>
                        <span className="amount">{formatCurrency(newBalance)}</span>
                    </div>
                </div>

                {description && (
                    <div className="description-section">
                        <div className="desc-label">Nota:</div>
                        <div>{description}</div>
                    </div>
                )}

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

SavingsReceiptPrint.propTypes = {
    transactionType: PropTypes.oneOf(['deposit', 'withdrawal']),
    member: PropTypes.shape({
        memberCode: PropTypes.string,
        member_code: PropTypes.string,
        fullName: PropTypes.string,
        full_name: PropTypes.string
    }),
    amount: PropTypes.number,
    previousBalance: PropTypes.number,
    newBalance: PropTypes.number,
    description: PropTypes.string,
    transactionDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    transactionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default SavingsReceiptPrint;
