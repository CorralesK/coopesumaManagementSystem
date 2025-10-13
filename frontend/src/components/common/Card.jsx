/**
 * Card Component
 * Reusable card container component
 */

import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
    title,
    children,
    footer,
    className = '',
    padding = 'normal'
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        normal: 'p-6',
        lg: 'p-8'
    };

    return (
        <div className={`bg-white rounded-lg shadow-md ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
            )}

            <div className={paddingClasses[padding]}>
                {children}
            </div>

            {footer && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    {footer}
                </div>
            )}
        </div>
    );
};

Card.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    footer: PropTypes.node,
    className: PropTypes.string,
    padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg'])
};

export default Card;
