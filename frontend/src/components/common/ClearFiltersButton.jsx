/**
 * @file ClearFiltersButton.jsx
 * @description Reusable button component for clearing filters
 * @module components/common
 */

import PropTypes from 'prop-types';
import Button from './Button';

/**
 * ClearFiltersButton Component
 * Displays a button with an icon to clear active filters
 */
const ClearFiltersButton = ({ onClick, show = true }) => {
    if (!show) return null;

    return (
        <Button
            onClick={onClick}
            variant="outline"
            size="sm"
        >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar Filtros
        </Button>
    );
};

ClearFiltersButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    show: PropTypes.bool
};

export default ClearFiltersButton;