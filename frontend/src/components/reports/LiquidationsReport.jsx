/**
 * @file LiquidationsReport.jsx
 * @description Report component for liquidation operations by fiscal period
 * @module components/reports
 */

import React, { useState } from 'react';
import { getLiquidationHistory } from '../../services/liquidationService';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Alert from '../common/Alert';

/**
 * LiquidationsReport Component
 * Generates comprehensive liquidation reports by period
 */
const LiquidationsReport = () => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        liquidationType: ''
    });
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    const handleQuickFilter = (period) => {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'thisYear':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case 'lastYear':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear() - 1, 11, 31);
                break;
            default:
                return;
        }

        setFilters({
            ...filters,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
    };

    const generateReport = async () => {
        if (!filters.startDate || !filters.endDate) {
            setError('Debe seleccionar un rango de fechas');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const params = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                ...(filters.liquidationType && { liquidationType: filters.liquidationType })
            };

            const response = await getLiquidationHistory(params);
            const liquidations = response.data;

            // Calculate statistics
            const stats = {
                total: liquidations.length,
                periodic: liquidations.filter(l => l.liquidationType === 'periodic').length,
                exit: liquidations.filter(l => l.liquidationType === 'exit').length,
                totalAmount: liquidations.reduce((sum, l) => sum + (parseFloat(l.totalAmount) || 0), 0),
                totalSavings: liquidations.reduce((sum, l) => sum + (parseFloat(l.totalSavings) || 0), 0),
                totalContributions: liquidations.reduce((sum, l) => sum + (parseFloat(l.totalContributions) || 0), 0),
                totalSurplus: liquidations.reduce((sum, l) => sum + (parseFloat(l.totalSurplus) || 0), 0),
                membersContinuing: liquidations.filter(l => l.memberContinues).length,
                membersExiting: liquidations.filter(l => !l.memberContinues).length
            };

            setReport({ liquidations, stats });
        } catch (err) {
            setError(err.message || 'Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!report || !report.liquidations.length) return;

        const headers = [
            'Fecha',
            'Miembro',
            'Tipo',
            'Ahorros',
            'Aportaciones',
            'Excedentes',
            'Total',
            'Continúa',
            'Procesado Por',
            'Notas'
        ];

        const rows = report.liquidations.map(l => [
            new Date(l.liquidationDate || l.createdAt).toLocaleDateString('es-CR'),
            l.memberName || '',
            l.liquidationType === 'periodic' ? 'Periódica' : 'Por Retiro',
            l.totalSavings || 0,
            l.totalContributions || 0,
            l.totalSurplus || 0,
            l.totalAmount || 0,
            l.memberContinues ? 'Sí' : 'No',
            l.processedByName || '',
            l.notes || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `liquidaciones_${filters.startDate}_${filters.endDate}.csv`;
        link.click();
    };

    const formatCurrency = (amount) => {
        return `₡${Number(amount || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporte de Liquidaciones</h3>

                {/* Quick Filters */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Períodos Rápidos:</p>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => handleQuickFilter('thisMonth')} variant="outline" size="sm">
                            Este Mes
                        </Button>
                        <Button onClick={() => handleQuickFilter('lastMonth')} variant="outline" size="sm">
                            Mes Pasado
                        </Button>
                        <Button onClick={() => handleQuickFilter('thisYear')} variant="outline" size="sm">
                            Este Año
                        </Button>
                        <Button onClick={() => handleQuickFilter('lastYear')} variant="outline" size="sm">
                            Año Pasado
                        </Button>
                    </div>
                </div>

                {/* Custom Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Liquidación
                        </label>
                        <select
                            value={filters.liquidationType}
                            onChange={(e) => setFilters({ ...filters, liquidationType: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="">Todas</option>
                            <option value="periodic">Periódica</option>
                            <option value="exit">Por Retiro</option>
                        </select>
                    </div>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={generateReport}
                    variant="primary"
                    disabled={loading || !filters.startDate || !filters.endDate}
                    fullWidth
                >
                    {loading ? 'Generando...' : 'Generar Reporte'}
                </Button>

                {/* Error Alert */}
                {error && (
                    <div className="mt-4">
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && <Loading message="Generando reporte..." />}

            {/* Report Results */}
            {report && !loading && (
                <div className="space-y-6">
                    {/* Statistics */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">Resumen Estadístico</h4>
                            <Button onClick={exportToCSV} variant="outline" size="sm">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exportar CSV
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-600 mb-1">Total Liquidaciones</p>
                                <p className="text-2xl font-bold text-gray-900">{report.stats.total}</p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-700 mb-1">Periódicas</p>
                                <p className="text-2xl font-bold text-blue-900">{report.stats.periodic}</p>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-xs text-purple-700 mb-1">Por Retiro</p>
                                <p className="text-2xl font-bold text-purple-900">{report.stats.exit}</p>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs text-green-700 mb-1">Monto Total</p>
                                <p className="text-lg font-bold text-green-900">{formatCurrency(report.stats.totalAmount)}</p>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs text-green-700 mb-1">Total Ahorros</p>
                                <p className="text-lg font-bold text-green-900">{formatCurrency(report.stats.totalSavings)}</p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-700 mb-1">Total Aportaciones</p>
                                <p className="text-lg font-bold text-blue-900">{formatCurrency(report.stats.totalContributions)}</p>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-xs text-purple-700 mb-1">Total Excedentes</p>
                                <p className="text-lg font-bold text-purple-900">{formatCurrency(report.stats.totalSurplus)}</p>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-xs text-yellow-700 mb-1">Miembros Activos</p>
                                <p className="text-2xl font-bold text-yellow-900">{report.stats.membersContinuing}</p>
                            </div>
                        </div>
                    </div>

                    {/* Liquidations List */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-900">Detalle de Liquidaciones</h4>
                        </div>

                        {report.liquidations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No se encontraron liquidaciones en el período seleccionado
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miembro</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ahorros</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aportaciones</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Excedentes</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {report.liquidations.map((liq, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(liq.liquidationDate || liq.createdAt).toLocaleDateString('es-CR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {liq.memberName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        liq.liquidationType === 'periodic'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {liq.liquidationType === 'periodic' ? 'Periódica' : 'Por Retiro'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                                                    {formatCurrency(liq.totalSavings)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                                                    {formatCurrency(liq.totalContributions)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600">
                                                    {formatCurrency(liq.totalSurplus)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                                    {formatCurrency(liq.totalAmount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {liq.memberContinues ? (
                                                        <span className="inline-flex items-center text-green-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-red-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiquidationsReport;