/**
 * @file MemberSavingsHistory.jsx
 * @description Component displaying member's savings transaction history (deposits and withdrawals)
 * @module components/members
 */

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSavingsTransactions } from '../../hooks/useSavings';
import Loading from '../common/Loading';
import Button from '../common/Button';
import ClearFiltersButton from '../common/ClearFiltersButton';
import Pagination from '../common/Pagination';
import { formatCurrency } from '../../utils/formatters';

/**
 * MemberSavingsHistory Component
 * Displays a member's savings transaction history with filtering and pagination
 */
const MemberSavingsHistory = ({ memberId, currentBalance, lastLiquidationDate }) => {
    const { transactions, loading, error, refetch } = useSavingsTransactions(memberId);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterMonth, setFilterMonth] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'deposit', 'withdrawal'
    const itemsPerPage = 10;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatMonthYear = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long'
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
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    const handleFilterChange = (newFilterType, newFilterMonth) => {
        if (newFilterType !== undefined) setFilterType(newFilterType);
        if (newFilterMonth !== undefined) setFilterMonth(newFilterMonth);
        setCurrentPage(1);
    };

    if (loading) {
        return <Loading message="Cargando historial de ahorros..." />;
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={refetch} variant="outline" size="sm">
                    Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Total Savings Summary */}
            <div className="p-4">
                <p className="text-xs text-gray-600 mb-1">Total Ahorrado</p>
                <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(currentBalance || 0)}
                </p>
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Transacción</label>
                    <select
                        value={filterType}
                        onChange={(e) => handleFilterChange(e.target.value, undefined)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Todas</option>
                        <option value="deposit">Depósitos</option>
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
                onClick={() => {
                    setFilterType('all');
                    setFilterMonth('');
                    setCurrentPage(1);
                }}
            />

            {/* Transactions List */}
            {!transactions || transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">No hay movimientos registrados</p>
                </div>
            ) : filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">No se encontraron movimientos con los filtros aplicados</p>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        {paginatedTransactions.map((transaction, index) => (
                            <div
                                key={transaction.transactionId || index}
                                className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100"
                            >
                                {/* Amount */}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900 font-semibold">
                                        {transaction.transactionType === 'deposit' ? '+' : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                </div>

                                {/* Date */}
                                <div className="text-right">
                                    <p className="text-sm text-gray-900">
                                        {formatDate(transaction.transactionDate || transaction.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}

                    {/* Results Info */}
                    <div className="text-center text-sm text-gray-600">
                        Mostrando {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length} movimientos
                    </div>
                </>
            )}
        </div>
    );
};

MemberSavingsHistory.propTypes = {
    memberId: PropTypes.number.isRequired,
    currentBalance: PropTypes.number,
    lastLiquidationDate: PropTypes.string
};

export default MemberSavingsHistory;