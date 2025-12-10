/**
 * Savings Inventory Page
 * Professional view of savings inventory (similar to Excel but modernized)
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSavingsInventoryByYear } from '../../hooks/useSavingsInventory';
import { formatCurrency, normalizeText } from '../../utils/formatters';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

const MONTHS = [
    { key: 'january', label: 'Ene', fullName: 'Enero' },
    { key: 'february', label: 'Feb', fullName: 'Febrero' },
    { key: 'march', label: 'Mar', fullName: 'Marzo' },
    { key: 'april', label: 'Abr', fullName: 'Abril' },
    { key: 'may', label: 'May', fullName: 'Mayo' },
    { key: 'june', label: 'Jun', fullName: 'Junio' },
    { key: 'july', label: 'Jul', fullName: 'Julio' },
    { key: 'august', label: 'Ago', fullName: 'Agosto' },
    { key: 'september', label: 'Sep', fullName: 'Septiembre' },
    { key: 'october', label: 'Oct', fullName: 'Octubre' },
    { key: 'november', label: 'Nov', fullName: 'Noviembre' },
    { key: 'december', label: 'Dic', fullName: 'Diciembre' }
];

const SavingsInventoryPage = () => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();
    const [fiscalYear, setFiscalYear] = useState(currentYear);
    const [searchTerm, setSearchTerm] = useState('');

    // Use custom hook
    const { data: inventory, loading, error } = useSavingsInventoryByYear(fiscalYear);

    const handleMemberClick = (memberId) => {
        navigate(`/members/${memberId}/savings`);
    };

    const handleMonthClick = (month) => {
        const monthNumber = MONTHS.findIndex(m => m.key === month) + 1;
        navigate(`/savings/inventory/${fiscalYear}/${monthNumber}`);
    };

    const filteredMembers = inventory?.members?.filter(member => {
        const normalizedSearch = normalizeText(searchTerm);
        return normalizeText(member.fullName).includes(normalizedSearch) ||
            normalizeText(member.memberCode).includes(normalizedSearch);
    }) || [];

    if (loading) {
        return <Loading message="Cargando inventario de ahorros..." />;
    }

    return (
        <div className="max-w-full mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Inventario de Ahorros</h1>
                        <p className="text-gray-600 mt-1">Vista consolidada por año fiscal</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/savings"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            ← Volver
                        </Link>
                    </div>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <label className="font-medium text-gray-700">Año Fiscal:</label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFiscalYear(prev => prev - 1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-2xl font-bold text-primary-600 min-w-[100px] text-center">
                            {fiscalYear}
                        </span>
                        <button
                            onClick={() => setFiscalYear(prev => prev + 1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={fiscalYear >= currentYear}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="flex-1 ml-8">
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
            </div>

            {error && (
                <Alert type="error" message={error} />
            )}

            {/* Summary Cards */}
            {inventory && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Miembros</p>
                        <p className="text-2xl font-bold text-gray-900">{inventory.totalMembers}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Año Anterior</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(inventory.totals?.previousYearBalance || 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Ahorrado {fiscalYear}</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(inventory.totals?.totalSaved || 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Intereses</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(inventory.totals?.interests || 0)}
                        </p>
                    </div>
                </div>
            )}

            {/* Inventory Table */}
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
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
                                    Año Ant.
                                </th>
                                {MONTHS.map(month => (
                                    <th
                                        key={month.key}
                                        className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-primary-800 transition-colors"
                                        onClick={() => handleMonthClick(month.key)}
                                        title={`Ver detalle de ${month.fullName}`}
                                    >
                                        {month.label}
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
                                    Intereses
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider bg-green-600">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map((member, idx) => (
                                <tr
                                    key={member.memberId}
                                    className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-sm sticky left-0 bg-inherit z-10">
                                        <button
                                            onClick={() => handleMemberClick(member.memberId)}
                                            className="font-medium text-primary-600 hover:text-primary-800 hover:underline"
                                        >
                                            {member.memberCode}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm sticky bg-inherit z-10" style={{ left: '120px' }}>
                                        <button
                                            onClick={() => handleMemberClick(member.memberId)}
                                            className="font-medium text-gray-900 hover:text-primary-600 hover:underline text-left"
                                        >
                                            {member.fullName}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-600 font-medium">
                                        {formatCurrency(member.previousYearBalance || 0)}
                                    </td>
                                    {MONTHS.map(month => (
                                        <td
                                            key={month.key}
                                            className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                                                parseFloat(member[month.key]) > 0
                                                    ? 'text-green-600'
                                                    : parseFloat(member[month.key]) < 0
                                                    ? 'text-red-600'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            {parseFloat(member[month.key]) !== 0
                                                ? formatCurrency(member[month.key] || 0)
                                                : '—'}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-purple-600 font-medium">
                                        {formatCurrency(member.interests || 0)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-700 bg-green-50">
                                        {formatCurrency(member.totalSaved || 0)}
                                    </td>
                                </tr>
                            ))}

                            {/* Totals Row */}
                            {inventory?.totals && (
                                <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold border-t-2 border-gray-400">
                                    <td colSpan="2" className="px-4 py-3 text-sm sticky left-0 bg-gradient-to-r from-gray-100 to-gray-200 z-10">
                                        TOTALES
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-700">
                                        {formatCurrency(inventory.totals.previousYearBalance)}
                                    </td>
                                    {MONTHS.map(month => (
                                        <td
                                            key={month.key}
                                            className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900"
                                        >
                                            {formatCurrency(inventory.totals[month.key] || 0)}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-purple-700">
                                        {formatCurrency(inventory.totals.interests)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-800 bg-green-100">
                                        {formatCurrency(inventory.totals.totalSaved)}
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
                            <p className="text-lg font-medium">No se encontraron resultados</p>
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
                        <p className="font-medium mb-1">Instrucciones:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                            <li>Haga clic en el <strong>código o nombre del asociado</strong> para ver su dashboard personal</li>
                            <li>Haga clic en el <strong>nombre del mes</strong> para ver el detalle mensual con recibos</li>
                            <li>Los valores en <span className="text-green-600 font-medium">verde</span> son depósitos, en <span className="text-red-600 font-medium">rojo</span> son retiros</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavingsInventoryPage;