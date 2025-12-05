/**
 * Pagination Component
 * Reusable pagination controls
 */

import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    className = ''
}) => {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handleFirst = () => {
        if (currentPage !== 1) {
            onPageChange(1);
        }
    };

    const handleLast = () => {
        if (currentPage !== totalPages) {
            onPageChange(totalPages);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate range around current page
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust if we're near the beginning
            if (currentPage <= 3) {
                end = Math.min(4, totalPages - 1);
            }

            // Adjust if we're near the end
            if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 3);
            }

            // Add ellipsis if needed
            if (start > 2) {
                pages.push('...');
            }

            // Add pages around current
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Add ellipsis if needed
            if (end < totalPages - 1) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className={`flex items-center justify-between bg-white px-2 py-2 sm:px-3 border-t border-gray-200 ${className}`}>
            {/* Mobile View */}
            <div className="flex flex-1 justify-between items-center sm:hidden">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center text-xs font-medium rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                >
                    Anterior
                </button>
                <span className="text-xs text-gray-700">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center text-xs font-medium rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                >
                    Siguiente
                </button>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs text-gray-700">
                        Página <span className="font-semibold text-gray-900">{currentPage}</span> de{' '}
                        <span className="font-semibold text-gray-900">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex gap-0.5" aria-label="Pagination">
                        {/* First Page Button */}
                        <button
                            onClick={handleFirst}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                            title="Primera página"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Previous Button */}
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                            title="Página anterior"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                                <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center text-xs font-semibold rounded transition-colors ${
                                        currentPage === page
                                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                                            : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                            title="Página siguiente"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {/* Last Page Button */}
                        <button
                            onClick={handleLast}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                            title="Última página"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.21 14.77a.75.75 0 01.02-1.06L14.168 10 10.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02zm-6 0a.75.75 0 01.02-1.06L8.168 10 4.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    className: PropTypes.string
};

export default Pagination;
