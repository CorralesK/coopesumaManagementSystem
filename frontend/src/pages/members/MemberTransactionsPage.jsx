/**
 * @file MemberTransactionsPage.jsx
 * @description Page for members to view their complete savings transaction history
 * @module pages/members
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Pagination from '../../components/common/Pagination';
import ClearFiltersButton from '../../components/common/ClearFiltersButton';
import { formatCurrency } from '../../utils/formatters';

const ITEMS_PER_PAGE = 10;

/**
 * MemberTransactionsPage Component
 * Displays complete savings transaction history for logged-in members
 */
const MemberTransactionsPage = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filterType, setFilterType] = useState('all'); // 'all', 'deposit', 'withdrawal'
    const [filterMonth, setFilterMonth] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // First get the member ID from dashboard
            const dashboardResponse = await api.get('/members/me/dashboard');
            const memberId = dashboardResponse.data.member.memberId;

            // Then get the savings transactions
            const response = await api.get(`/savings/${memberId}/transactions`);
            const data = response.data;

            setTransactions(data.transactions || []);
            setCurrentBalance(data.currentBalance || 0);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err.message || 'Error al cargar las transacciones');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Get unique months from transactions
    const availableMonths = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        const months = new Set();
        transactions.forEach(transaction => {
            const date = new Date(transaction.transactionDate || transaction.createdAt);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(monthYear);
        });
        return Array.from(months).sort().reverse();
    }, [transactions]);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];

        return transactions.filter(transaction => {
            // Filter by type
            if (filterType !== 'all') {
                if (filterType === 'deposit' && transaction.transactionType !== 'deposit') return false;
                if (filterType === 'withdrawal' && transaction.transactionType !== 'withdrawal') return false;
            }

            // Filter by month
            if (filterMonth) {
                const date = new Date(transaction.transactionDate || transaction.createdAt);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (monthYear !== filterMonth) return false;
            }

            return true;
        });
    }, [transactions, filterType, filterMonth]);

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    const handleFilterChange = (newFilterType, newFilterMonth) => {
        if (newFilterType !== undefined) setFilterType(newFilterType);
        if (newFilterMonth !== undefined) setFilterMonth(newFilterMonth);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilterType('all');
        setFilterMonth('');
        setCurrentPage(1);
    };

    if (loading) {
        return <Loading message="Cargando historial de transacciones..." />;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Alert type="error" message={error} />
                <div className="mt-4 text-center">
                    <Button onClick={fetchData} variant="primary">
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/my-dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historial de Ahorros</h1>
                    <p className="text-gray-600 mt-1">Todas tus transacciones de ahorro</p>
                </div>
            </div>

            {/* Current Balance */}
            <Card padding="lg">
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 mb-1">Saldo Actual</p>
                    <p className="text-3xl sm:text-4xl font-bold text-primary-600">
                        {formatCurrency(currentBalance)}
                    </p>
                </div>
            </Card>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Type Filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tipo de Transaccion
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => handleFilterChange(e.target.value, undefined)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Todas</option>
                            <option value="deposit">Depositos</option>
                            <option value="withdrawal">Retiros</option>
                        </select>
                    </div>

                    {/* Month Filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Mes</label>
                        <select
                            value={filterMonth}
                            onChange={(e) => handleFilterChange(undefined, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Todos los meses</option>
                            {availableMonths.map(month => {
                                const [year, monthNum] = month.split('-');
                                const date = new Date(year, parseInt(monthNum) - 1, 1);
                                return (
                                    <option key={month} value={month}>
                                        {date.toLocaleDateString('es-CR', { year: 'numeric', month: 'long' })}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Clear Filters Button */}
                <ClearFiltersButton
                    show={filterType !== 'all' || filterMonth !== ''}
                    onClick={clearFilters}
                />
            </Card>

            {/* Transactions List */}
            <Card padding="none">
                {!transactions || transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900">No hay transacciones</p>
                        <p className="text-sm mt-1">Aun no tienes movimientos registrados</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900">Sin resultados</p>
                        <p className="text-sm mt-1">No se encontraron transacciones con los filtros aplicados</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {paginatedTransactions.map((transaction, index) => (
                                <div
                                    key={transaction.transactionId || index}
                                    className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            transaction.transactionType === 'deposit'
                                                ? 'bg-green-100'
                                                : 'bg-red-100'
                                        }`}>
                                            {transaction.transactionType === 'deposit' ? (
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {transaction.transactionType === 'deposit' ? 'Deposito' : 'Retiro'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(transaction.transactionDate || transaction.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-base font-semibold ${
                                        transaction.transactionType === 'deposit'
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}>
                                        {transaction.transactionType === 'deposit' ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-200">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}

                        {/* Results Info */}
                        <div className="text-center text-sm text-gray-600 py-3 border-t border-gray-200">
                            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length} transacciones
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};

export default MemberTransactionsPage;