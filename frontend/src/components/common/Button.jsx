/**
 * Button Component
 * Reusable button component with different variants and sizes
 */

import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    className = ''
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variantClasses = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 border-2 border-transparent',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 border-2 border-transparent',
        success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 border-2 border-transparent',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 border-2 border-transparent',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400 border-2 border-transparent',
        outline: 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        'outline-gray': 'bg-white border-2 border-gray-500 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 border-2 border-transparent'
    };

    const sizeClasses = {
        sm: 'px-6 h-9 text-sm',
        md: 'px-8 h-10 text-base',
        lg: 'px-10 h-12 text-lg'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={combinedClasses}
        >
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'outline', 'outline-gray', 'ghost']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    disabled: PropTypes.bool,
    fullWidth: PropTypes.bool,
    className: PropTypes.string
};

export default Button;
