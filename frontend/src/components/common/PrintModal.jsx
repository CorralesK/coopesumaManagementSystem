/**
 * PrintModal Component
 * Modal optimizado para impresión que funciona en móviles
 * Usa CSS @media print en lugar de window.open() para evitar bloqueo de popups
 */

import { useEffect, useId } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const PrintModal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'xl',
    printTitle = '',
    orientation = 'portrait',
    paperSize = 'letter'
}) => {
    const printableId = useId();

    // Close modal on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Inject print styles when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const styleId = `print-style-${printableId.replace(/:/g, '')}`;

        // Remove existing style if any
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        // Create print styles
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            @media print {
                /* Hide everything */
                body * {
                    visibility: hidden !important;
                }

                /* Hide modal backdrop and wrapper completely */
                .print-modal-backdrop,
                .print-modal-wrapper {
                    position: static !important;
                    overflow: visible !important;
                    background: transparent !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    max-height: none !important;
                    box-shadow: none !important;
                }

                /* Show only the printable container and its children */
                [data-printable="${printableId}"],
                [data-printable="${printableId}"] * {
                    visibility: visible !important;
                }

                /* Position printable content at top-left of page */
                [data-printable="${printableId}"] {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                    z-index: 99999 !important;
                }

                /* Page settings */
                @page {
                    size: ${paperSize} ${orientation};
                    margin: 5mm;
                }

                /* Ensure colors print */
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }

                /* Hide modal UI elements */
                .print-modal-header,
                .print-modal-actions {
                    display: none !important;
                    visibility: hidden !important;
                }

                /* Prevent page breaks inside cards */
                .member-card-container,
                .member-card,
                .carnet-wrapper {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
            }
        `;

        document.head.appendChild(style);

        return () => {
            const styleToRemove = document.getElementById(styleId);
            if (styleToRemove) {
                styleToRemove.remove();
            }
        };
    }, [isOpen, printableId, orientation, paperSize]);

    const handlePrint = () => {
        // Set document title for print
        const originalTitle = document.title;
        if (printTitle) {
            document.title = printTitle;
        }

        window.print();

        // Restore title after print dialog
        setTimeout(() => {
            document.title = originalTitle;
        }, 100);
    };

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
        full: 'max-w-full mx-4'
    };

    return (
        <div className="print-modal-backdrop fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 backdrop-blur-sm bg-white/30">
            <div className={`print-modal-wrapper bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all max-h-[90vh] flex flex-col`}>
                {/* Header - Hidden when printing */}
                <div className="print-modal-header flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Printable Content */}
                <div className="flex-1 overflow-auto p-4">
                    <div data-printable={printableId}>
                        {children}
                    </div>
                </div>

                {/* Actions - Hidden when printing */}
                <div className="print-modal-actions flex justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handlePrint}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir
                    </Button>
                </div>
            </div>
        </div>
    );
};

PrintModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', 'full']),
    printTitle: PropTypes.string,
    orientation: PropTypes.oneOf(['portrait', 'landscape']),
    paperSize: PropTypes.oneOf(['letter', 'legal', 'a4', '80mm 200mm'])
};

export default PrintModal;