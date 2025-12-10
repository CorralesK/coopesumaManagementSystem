/**
 * Savings Monthly Detail Page
 * Shows detailed view for a specific month with RECIBO-AHORRO columns
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSavingsInventoryByMonth } from '../../services/savingsService';
import { formatCurrency, normalizeText } from '../../utils/formatters';
import Alert from '../../components/common/Alert';

const MONTH_NAMES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const SavingsMonthlyDetailPage = () => {
    const { fiscalYear, month } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMonthlyData();
    }, [fiscalYear, month]);

    const fetchMonthlyData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getSavingsInventoryByMonth(parseInt(fiscalYear), parseInt(month));
            setData(response.data.data);
        } catch (err) {
            console.error('Error fetching monthly data:', err);
            setError(err.response?.data?.message || 'Error al cargar datos del mes');
        } finally {
            setLoading(false);
        }
    };

    const handleMemberClick = (memberId) => {
        navigate(`/members/${memberId}/savings`);
    };

    const filteredMembers = data?.members?.filter(member => {
        const normalizedSearch = normalizeText(searchTerm);
        return normalizeText(member.full_name).includes(normalizedSearch) ||
            normalizeText(member.member_code).includes(normalizedSearch);
    }) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-gray-600">Cargando datos del mes...</p>
                </div>
            </div>
        );
    }

    const monthName = MONTH_NAMES[parseInt(month)];

    return (
        <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Inventario de Ahorros - {monthName} {fiscalYear}
                        </h1>
                        <p className="text-gray-600 mt-1">Detalle de transacciones del mes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/savings/inventory/${fiscalYear}`}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            ← Volver al Inventario Anual
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre o código..."
                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                title="Limpiar"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <Alert type="error" message={error} onClose={() => setError(null)} />
            )}

            {/* Summary Cards */}
            {data && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Depósitos</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(data.totals?.deposits || 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Retiros</p>
                        <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(data.totals?.withdrawals || 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Neto del Mes</p>
                        <p className={`text-2xl font-bold ${data.totals?.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {formatCurrency(data.totals?.net || 0)}
                        </p>
                    </div>
                </div>
            )}

            {/* Monthly Detail Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider sticky left-0 bg-primary-600 z-10">
                                    Asociado
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider sticky left-0 bg-primary-600 z-10" style={{ left: '120px' }}>
                                    Nombre
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider bg-blue-700" colSpan="2">
                                    Transacciones
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider bg-green-600">
                                    Total Mes
                                </th>
                            </tr>
                            <tr className="border-t border-white/20">
                                <th className="px-4 py-2"></th>
                                <th className="px-4 py-2"></th>
                                <th className="px-4 py-2 text-center text-xs font-bold uppercase tracking-wider bg-blue-600">
                                    Recibo
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-bold uppercase tracking-wider bg-blue-800">
                                    Ahorro
                                </th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map((member, idx) => {
                                const totalMonth = member.transactions.reduce((sum, t) => {
                                    return sum + (t.transaction_type === 'deposit' ? t.amount : -t.amount);
                                }, 0);

                                return (
                                    <tr
                                        key={member.member_id}
                                        className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-sm sticky left-0 bg-inherit z-10">
                                            <button
                                                onClick={() => handleMemberClick(member.member_id)}
                                                className="font-medium text-primary-600 hover:text-primary-800 hover:underline"
                                            >
                                                {member.member_code}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm sticky bg-inherit z-10" style={{ left: '120px' }}>
                                            <button
                                                onClick={() => handleMemberClick(member.member_id)}
                                                className="font-medium text-gray-900 hover:text-primary-600 hover:underline text-left"
                                            >
                                                {member.full_name}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {member.transactions.length > 0 ? (
                                                <div className="space-y-1">
                                                    {member.transactions.map((trans, tIdx) => (
                                                        <div key={tIdx} className="text-center text-xs text-gray-600">
                                                            {trans.receipt_number || '—'}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-400">—</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {member.transactions.length > 0 ? (
                                                <div className="space-y-1">
                                                    {member.transactions.map((trans, tIdx) => (
                                                        <div
                                                            key={tIdx}
                                                            className={`text-right font-medium ${
                                                                trans.transaction_type === 'deposit'
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                            }`}
                                                        >
                                                            {trans.transaction_type === 'withdrawal' && '-'}
                                                            {formatCurrency(trans.amount)}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-400">₡0</div>
                                            )}
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${
                                            totalMonth > 0 ? 'text-green-700 bg-green-50' :
                                            totalMonth < 0 ? 'text-red-700 bg-red-50' :
                                            'text-gray-400 bg-gray-50'
                                        }`}>
                                            {totalMonth !== 0 ? formatCurrency(totalMonth) : '—'}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Totals Row */}
                            {data?.totals && (
                                <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold border-t-2 border-gray-400">
                                    <td colSpan="2" className="px-4 py-3 text-sm sticky left-0 bg-gradient-to-r from-gray-100 to-gray-200 z-10">
                                        TOTALES
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-600">
                                        {filteredMembers.reduce((sum, m) => sum + m.transactions.length, 0)} transacciones
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                                        Depósitos: {formatCurrency(data.totals.deposits)}<br/>
                                        <span className="text-red-600">Retiros: -{formatCurrency(data.totals.withdrawals)}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-800 bg-blue-100">
                                        {formatCurrency(data.totals.net)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {filteredMembers.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-lg font-medium">No se encontraron transacciones para este mes</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">Información:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                            <li>Cada fila muestra todas las transacciones del miembro en el mes</li>
                            <li>Los <span className="text-green-600 font-medium">depósitos</span> se muestran en verde con número de recibo</li>
                            <li>Los <span className="text-red-600 font-medium">retiros</span> se muestran en rojo precedidos por el signo menos (-)</li>
                            <li>Haga clic en el código o nombre para ver el dashboard del miembro</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavingsMonthlyDetailPage;