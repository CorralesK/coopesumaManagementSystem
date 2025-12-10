/**
 * Input Component
 * Reusable input component with label and error handling
 */

import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    onClear,
    placeholder = '',
    error = '',
    required = false,
    disabled = false,
    className = '',
    ...rest
}) => {
    const showClearButton = onClear && value && !disabled;

    const inputClasses = `mt-1.5 block w-full px-4 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors text-base
        ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
        }
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        ${showClearButton ? 'pr-10' : ''}
        ${className}`;

    return (
        <div className="mb-5">
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={inputClasses}
                    {...rest}
                />
                {showClearButton && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        tabIndex={-1}
                        title="Limpiar"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600 px-1">{error}</p>
            )}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onClear: PropTypes.func,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string
};

export default Input;
