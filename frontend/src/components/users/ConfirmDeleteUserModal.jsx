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
const ConfirmDeleteUserModal = ({ isOpen, onClose, onConfirm, userName, isLoading }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirmar Eliminación"
            size="md"
            closeOnOverlayClick={!isLoading}
        >
            <div className="space-y-4">
                {/* Icono de advertencia */}
                <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Mensaje de advertencia */}
                <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        ¿Está seguro que desea eliminar este usuario?
                    </h4>
                    <p className="text-gray-600 mb-4">
                        <strong className="text-gray-900">{userName}</strong>
                    </p>
                </div>

                {/* Advertencia importante */}
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">
                                <strong>Advertencia:</strong> Esta acción no se puede deshacer.
                                El usuario será desactivado permanentemente y no podrá acceder al sistema.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
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
                        onClick={onConfirm}
                        variant="danger"
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
                            'Sí, Eliminar Usuario'
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
    isLoading: PropTypes.bool
};

ConfirmDeleteUserModal.defaultProps = {
    isLoading: false
};

export default ConfirmDeleteUserModal;