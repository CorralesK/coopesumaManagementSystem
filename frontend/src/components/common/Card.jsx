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
        sm: 'p-4',
        normal: 'p-6 sm:p-7 lg:p-8',
        lg: 'p-8 sm:p-9 lg:p-10'
    };

    return (
        <div className={`bg-white rounded-lg shadow-md ${className}`}>
            {title && (
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                </div>
            )}

            <div className={paddingClasses[padding]}>
                {children}
            </div>

            {footer && (
                <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 rounded-b-lg">
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
