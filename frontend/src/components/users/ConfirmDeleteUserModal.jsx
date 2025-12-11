/**
 * @file ConfirmDeleteUserModal.jsx
 * @description Modal de confirmación para eliminar (desactivar) usuarios
 * @module components/users
 */

import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Button from '../common/Button';

/**
 * ConfirmDeleteUserModal Component
 * Modal de confirmación con advertencia para eliminar usuarios
 */
const ConfirmDeleteUserModal = ({ isOpen, onClose, onConfirm, userName, isLoading, isMember = false, onContinueToLiquidation }) => {
    const handleConfirmClick = () => {
        if (isMember && onContinueToLiquidation) {
            onContinueToLiquidation();
        } else {
            onConfirm();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Eliminar Usuario"
            size="lg"
            closeOnOverlayClick={!isLoading}
        >
            <div className="space-y-6">
                {/* User Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <strong>Usuario:</strong> {userName}
                    </p>
                </div>

                {/* Warning Message */}
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-red-700">
                            <p className="font-semibold mb-2">¿Estás seguro de que deseas ELIMINAR a {userName}?</p>
                            {isMember ? (
                                <p>Esta acción iniciará el proceso de liquidación por retiro del miembro.</p>
                            ) : (
                                <p>El usuario será desactivado permanentemente y no podrá acceder al sistema.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info about the process */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <div className="flex">
                        <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-blue-700">
                            <p className="font-semibold mb-1">El proceso incluye:</p>
                            {isMember ? (
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Liquidación de la cuenta de ahorros</li>
                                    <li>Desactivación del miembro y su usuario</li>
                                    <li>Generación de recibo de liquidación</li>
                                </ul>
                            ) : (
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Desactivación del usuario</li>
                                    <li>No podrá acceder al sistema</li>
                                </ul>
                            )}
                            <p className="mt-2 font-semibold text-red-700">Esta acción NO se puede deshacer.</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-4">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="outline"
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirmClick}
                        variant="primary"
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Eliminando...
                            </>
                        ) : (
                            'Continuar'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

ConfirmDeleteUserModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    userName: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
    isMember: PropTypes.bool,
    onContinueToLiquidation: PropTypes.func
};

ConfirmDeleteUserModal.defaultProps = {
    isLoading: false,
    isMember: false,
    onContinueToLiquidation: null
};

export default ConfirmDeleteUserModal;