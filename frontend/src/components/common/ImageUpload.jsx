/**
 * ImageUpload Component
 * Reusable image upload component with preview
 * Supports camera capture on mobile devices
 */

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

const ImageUpload = ({
    label,
    name,
    value, // Can be a File object or URL string (for existing images)
    onChange,
    error = '',
    required = false,
    disabled = false,
    className = '',
    maxSizeMB = 5
}) => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    // Generate preview URL from file or use existing URL
    const displayUrl = previewUrl || (typeof value === 'string' ? value : null);

    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            alert('Solo se permiten imágenes (JPEG, PNG, WebP)');
            return;
        }

        // Validate file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            alert(`La imagen no debe superar ${maxSizeMB}MB`);
            return;
        }

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Pass file to parent
        onChange({ target: { name, value: file, type: 'file' } });
    };

    const handleInputChange = (e) => {
        const file = e.target.files?.[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        handleFileSelect(file);
    };

    const handleClear = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onChange({ target: { name, value: null, type: 'file' } });
    };

    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const containerClasses = `
        relative border-2 border-dashed rounded-lg p-4 cursor-pointer
        transition-colors duration-200 flex items-center justify-center
        ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
        ${error ? 'border-red-500' : ''}
        ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-primary-400 hover:bg-gray-50'}
        ${className}
    `;

    return (
        <div className="mb-5">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                className={containerClasses}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    name={name}
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="hidden"
                />

                {displayUrl ? (
                    <div className="relative">
                        <img
                            src={displayUrl}
                            alt="Vista previa"
                            className="mx-auto max-h-48 rounded-lg object-contain"
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClear();
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                                title="Eliminar imagen"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="py-6 text-center w-full flex flex-col items-center justify-center">
                        <svg
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-primary-600">Clic para seleccionar</span>
                            {' '}o arrastra una imagen
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            PNG, JPG, WebP hasta {maxSizeMB}MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600 px-1">{error}</p>
            )}
        </div>
    );
};

ImageUpload.propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    maxSizeMB: PropTypes.number
};

export default ImageUpload;
