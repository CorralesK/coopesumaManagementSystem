/**
 * Loading Component
 * Reusable loading spinner component
 */

import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({
    size = 'md',
    message = 'Cargando...',
    fullScreen = false
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center">
            <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
            {message && (
                <p className="mt-4 text-gray-600">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            {spinner}
        </div>
    );
};

Loading.propTypes = {
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    message: PropTypes.string,
    fullScreen: PropTypes.bool
};

export default Loading;
