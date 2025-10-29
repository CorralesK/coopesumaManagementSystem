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
    headerAction,
    className = '',
    padding = 'normal'
}) => {
    const paddingClasses = {
        none: 'py-4',
        sm: 'p-4',
        normal: 'p-5',
        lg: 'p-8 sm:p-9 lg:p-10'
    };

    return (
        <div className={`bg-white rounded-lg ${className}`}>
            {title && (
                <div className="px-5 py-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    {headerAction && (
                        <div className="flex-shrink-0">
                            {headerAction}
                        </div>
                    )}
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
    headerAction: PropTypes.node,
    className: PropTypes.string,
    padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg'])
};

export default Card;
