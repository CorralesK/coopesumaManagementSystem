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
                /* Hide everything except printable area */
                body * {
                    visibility: hidden !important;
                }

                /* The printable container needs to be visible and positioned correctly */
                [data-printable="${printableId}"],
                [data-printable="${printableId}"] * {
                    visibility: visible !important;
                }

                /* Position the printable content at the top of the page */
                [data-printable="${printableId}"] {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                }

                /* Make sure parent containers don't interfere */
                .print-modal-backdrop {
                    position: absolute !important;
                    inset: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    display: block !important;
                    overflow: visible !important;
                }

                .print-modal-wrapper {
                    position: absolute !important;
                    inset: 0 !important;
                    max-width: none !important;
                    max-height: none !important;
                    width: 100% !important;
                    height: auto !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    overflow: visible !important;
                }

                .print-modal-content {
                    position: absolute !important;
                    inset: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    overflow: visible !important;
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

                /* Hide modal UI elements completely */
                .print-modal-header,
                .print-modal-actions {
                    display: none !important;
                    visibility: hidden !important;
                    height: 0 !important;
                    overflow: hidden !important;
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

    // Responsive size classes - full width on mobile, constrained on larger screens
    const sizeClasses = {
        sm: 'max-w-full sm:max-w-md',
        md: 'max-w-full sm:max-w-lg',
        lg: 'max-w-full sm:max-w-2xl',
        xl: 'max-w-full sm:max-w-4xl',
        '2xl': 'max-w-full sm:max-w-6xl',
        full: 'max-w-full'
    };

    return (
        <div className="print-modal-backdrop fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm bg-white/30">
            <div className={`print-modal-wrapper bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all max-h-[95vh] sm:max-h-[90vh] flex flex-col`}>
                {/* Header - Hidden when printing */}
                <div className="print-modal-header flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-2">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none flex-shrink-0"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Printable Content */}
                <div className="print-modal-content flex-1 overflow-auto p-2 sm:p-4">
                    <div data-printable={printableId}>
                        {children}
                    </div>
                </div>

                {/* Actions - Hidden when printing */}
                <div className="print-modal-actions flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={handlePrint} className="w-full sm:w-auto">
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