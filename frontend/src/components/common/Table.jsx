/**
 * Table Component
 * Reusable table component with sorting and pagination support
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const Table = ({
    columns = [],
    data = [],
    onRowClick,
    emptyMessage = 'No hay datos disponibles',
    className = '',
    isRowActive = () => false
}) => {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
                <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-base text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row, rowIndex) => {
                        const isActive = isRowActive(row);
                        return (
                            <tr
                                key={rowIndex}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gray-100 text-gray-900 shadow-md font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:font-semibold'
                                } ${onRowClick ? 'cursor-pointer' : ''}`}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-6 py-6 text-sm align-middle ${column.key === 'actions' ? 'text-center' : 'text-left'}`}
                                    >
                                        {column.key === 'actions' ? (
                                            <div className="flex items-center justify-center h-full">
                                                {column.render ? column.render(row) : row[column.key]}
                                            </div>
                                        ) : (
                                            column.render ? column.render(row) : row[column.key]
                                        )}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

Table.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            render: PropTypes.func
        })
    ).isRequired,
    data: PropTypes.array.isRequired,
    onRowClick: PropTypes.func,
    emptyMessage: PropTypes.string,
    className: PropTypes.string,
    isRowActive: PropTypes.func
};

export default Table;
