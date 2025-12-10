/**
 * @file MemberLiquidationHistory.jsx
 * @description Component displaying member's liquidation history
 * @module components/members
 */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLiquidationHistory } from '../../hooks/useLiquidations';
import Loading from '../common/Loading';
import Button from '../common/Button';
import Pagination from '../common/Pagination';

/**
 * MemberLiquidationHistory Component
 * Displays a member's liquidation history with pagination
 */
const MemberLiquidationHistory = ({ memberId }) => {
    const { history, loading, error, refetch } = useLiquidationHistory({ memberId });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        refetch();
    }, [memberId, refetch]);

    useEffect(() => {
        // Reset to page 1 when history changes
        setCurrentPage(1);
    }, [history]);

    const formatCurrency = (amount) => {
        return `₡${Number(amount || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return <Loading message="Cargando historial de liquidaciones..." />;
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

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">No hay liquidaciones registradas</p>
            </div>
        );
    }

    // Calculate pagination
    const totalPages = Math.ceil(history.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHistory = history.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                {paginatedHistory.map((liquidation, index) => (
                    <div
                        key={liquidation.liquidationId || index}
                        className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100"
                    >
                        {/* Amount */}
                        <div className="flex-1">
                            <p className="text-sm text-gray-900 font-semibold">
                                {formatCurrency(liquidation.totalAmount)}
                            </p>
                        </div>

                        {/* Date */}
                        <div className="text-right">
                            <p className="text-sm text-gray-900">
                                {formatDate(liquidation.liquidationDate || liquidation.createdAt)}
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
                Mostrando {startIndex + 1}-{Math.min(endIndex, history.length)} de {history.length} liquidaciones
            </div>
        </div>
    );
};

MemberLiquidationHistory.propTypes = {
    memberId: PropTypes.number.isRequired
};

export default MemberLiquidationHistory;