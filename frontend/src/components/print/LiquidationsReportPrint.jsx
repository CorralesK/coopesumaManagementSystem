/**
 * LiquidationsReportPrint Component
 * Componente de reporte de liquidaciones para impresion
 */

import React from 'react';
import PropTypes from 'prop-types';

const LiquidationsReportPrint = ({ liquidations = [], stats = {}, dateRange = {} }) => {
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const printDate = new Date().toLocaleString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="print-liquidations-report" style={{ fontFamily: "'Times New Roman', Times, serif", color: '#000', lineHeight: 1.6 }}>
            <style>{`
                .print-liquidations-report {
                    background: white;
                    padding: 20px;
                    min-height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .print-liquidations-report .document-header {
                    text-align: center;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #000;
                }
                .print-liquidations-report .document-header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin: 0 0 8px 0;
                }
                .print-liquidations-report .document-header .subtitle {
                    font-size: 14px;
                    font-weight: normal;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .print-liquidations-report .period-info {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 12px;
                }
                .print-liquidations-report .stats-section {
                    margin-bottom: 25px;
                    padding: 15px;
                    border: 1px solid #000;
                }
                .print-liquidations-report .stats-section h2 {
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin: 0 0 15px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #000;
                }
                .print-liquidations-report .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 10px;
                }
                .print-liquidations-report .stat-item {
                    text-align: center;
                    padding: 8px;
                    border: 1px solid #ccc;
                }
                .print-liquidations-report .stat-item .label {
                    font-size: 9px;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .print-liquidations-report .stat-item .value {
                    font-size: 12px;
                    font-weight: bold;
                }
                .print-liquidations-report .liquidations-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 2px solid #000;
                    font-size: 9px;
                }
                .print-liquidations-report .liquidations-table th {
                    padding: 8px 4px;
                    text-align: left;
                    font-size: 9px;
                    font-weight: bold;
                    text-transform: uppercase;
                    border: 1px solid #000;
                    border-bottom: 2px solid #000;
                    background: #f5f5f5;
                }
                .print-liquidations-report .liquidations-table th.text-right {
                    text-align: right;
                }
                .print-liquidations-report .liquidations-table td {
                    padding: 6px 4px;
                    font-size: 9px;
                    border: 1px solid #000;
                }
                .print-liquidations-report .liquidations-table td.text-right {
                    text-align: right;
                }
                .print-liquidations-report .liquidations-table td.text-center {
                    text-align: center;
                }
                .print-liquidations-report .content-wrapper {
                    flex: 1;
                }
                .print-liquidations-report .footer {
                    margin-top: auto;
                    padding-top: 15px;
                    border-top: 1px solid #000;
                    font-size: 9px;
                    text-align: center;
                }
                .print-liquidations-report .totals-row {
                    font-weight: bold;
                    background: #f5f5f5;
                }
                .print-liquidations-report .no-data {
                    text-align: center;
                    padding: 40px;
                    font-style: italic;
                    font-size: 12px;
                }
                @media print {
                    .print-liquidations-report {
                        padding: 0 !important;
                        min-height: 100vh !important;
                    }
                    .print-liquidations-report .liquidations-table th,
                    .print-liquidations-report .totals-row {
                        background: #f5f5f5 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="content-wrapper">
                <div className="document-header">
                    <h1>COOPESUMA R.L.</h1>
                    <div className="subtitle">Reporte de Liquidaciones</div>
                </div>

                <div className="period-info">
                    <strong>Periodo:</strong> {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                </div>

                <div className="stats-section">
                    <h2>Resumen Estadistico</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="label">Total Liquidaciones</div>
                            <div className="value">{stats.total || 0}</div>
                        </div>
                        <div className="stat-item">
                            <div className="label">Periodicas</div>
                            <div className="value">{stats.periodic || 0}</div>
                        </div>
                        <div className="stat-item">
                            <div className="label">Por Retiro</div>
                            <div className="value">{stats.exit || 0}</div>
                        </div>
                        <div className="stat-item">
                            <div className="label">Monto Total</div>
                            <div className="value">{formatCurrency(stats.totalAmount)}</div>
                        </div>
                    </div>
                </div>

                {liquidations.length > 0 ? (
                    <table className="liquidations-table">
                        <thead>
                            <tr>
                                <th style={{ width: '12%' }}>Fecha</th>
                                <th style={{ width: '25%' }}>Miembro</th>
                                <th style={{ width: '10%' }}>Tipo</th>
                                <th className="text-right" style={{ width: '13%' }}>Ahorros</th>
                                <th className="text-right" style={{ width: '13%' }}>Aportaciones</th>
                                <th className="text-right" style={{ width: '13%' }}>Excedentes</th>
                                <th className="text-right" style={{ width: '14%' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liquidations.map((liq, index) => (
                                <tr key={liq.liquidationId || index}>
                                    <td>{new Date(liq.liquidationDate || liq.createdAt).toLocaleDateString('es-CR')}</td>
                                    <td>{liq.memberName || 'N/A'}</td>
                                    <td className="text-center">{liq.liquidationType === 'periodic' ? 'Periodica' : 'Retiro'}</td>
                                    <td className="text-right">{formatCurrency(liq.totalSavings)}</td>
                                    <td className="text-right">{formatCurrency(liq.totalContributions)}</td>
                                    <td className="text-right">{formatCurrency(liq.totalSurplus)}</td>
                                    <td className="text-right">{formatCurrency(liq.totalAmount)}</td>
                                </tr>
                            ))}
                            <tr className="totals-row">
                                <td colSpan="3" style={{ textAlign: 'right' }}>TOTALES:</td>
                                <td className="text-right">{formatCurrency(stats.totalSavings)}</td>
                                <td className="text-right">{formatCurrency(stats.totalContributions)}</td>
                                <td className="text-right">{formatCurrency(stats.totalSurplus)}</td>
                                <td className="text-right">{formatCurrency(stats.totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <div className="no-data">
                        No hay liquidaciones en el periodo seleccionado.
                    </div>
                )}
            </div>

            <div className="footer">
                Documento generado el {printDate} - COOPESUMA R.L.
            </div>
        </div>
    );
};

LiquidationsReportPrint.propTypes = {
    liquidations: PropTypes.arrayOf(PropTypes.shape({
        liquidationId: PropTypes.number,
        memberName: PropTypes.string,
        liquidationType: PropTypes.string,
        totalSavings: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        totalContributions: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        totalSurplus: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        totalAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        liquidationDate: PropTypes.string,
        createdAt: PropTypes.string
    })),
    stats: PropTypes.shape({
        total: PropTypes.number,
        periodic: PropTypes.number,
        exit: PropTypes.number,
        totalAmount: PropTypes.number,
        totalSavings: PropTypes.number,
        totalContributions: PropTypes.number,
        totalSurplus: PropTypes.number
    }),
    dateRange: PropTypes.shape({
        startDate: PropTypes.string,
        endDate: PropTypes.string
    })
};

export default LiquidationsReportPrint;
