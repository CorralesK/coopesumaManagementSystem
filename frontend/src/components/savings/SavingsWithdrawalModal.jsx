/**
 * @file SavingsWithdrawalModal.jsx
 * @description Modal for registering savings withdrawals
 * @module components/savings
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

const SavingsWithdrawalModal = ({ isOpen, onClose, member, onSubmit, isSubmitting }) => {
    const [formData, setFormData] = useState({
        amount: '',
        receiptNumber: '',
        description: ''
    });
    const [formErrors, setFormErrors] = useState({});

    // Reset form when modal opens/closes or member changes
    useEffect(() => {
        if (isOpen && member) {
            setFormData({
                amount: '',
                receiptNumber: '',
                description: ''
            });
            setFormErrors({});
        }
    }, [isOpen, member]);

    const validateForm = () => {
        const errors = {};

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            errors.amount = 'El monto debe ser mayor a cero';
        }

        if (!formData.receiptNumber || formData.receiptNumber.trim() === '') {
            errors.receiptNumber = 'El número de recibo es requerido';
        }

        const currentBalance = parseFloat(member?.currentBalance || 0);
        const withdrawalAmount = parseFloat(formData.amount || 0);

        if (withdrawalAmount > currentBalance) {
            errors.amount = `Saldo insuficiente. Saldo disponible: ${formatCurrency(currentBalance)}`;
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const withdrawalData = {
            memberId: member.memberId,
            amount: parseFloat(formData.amount),
            receiptNumber: formData.receiptNumber.trim(),
            description: formData.description || `Retiro de ahorros - ${member.fullName}`,
            transactionDate: new Date().toISOString()
        };

        try {
            await onSubmit(withdrawalData);
            onClose();
        } catch (error) {
            // Error is handled by parent component
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    if (!member) return null;

    const currentBalance = parseFloat(member.currentBalance || 0);
    const withdrawalAmount = parseFloat(formData.amount || 0);
    const newBalance = currentBalance - withdrawalAmount;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Retiro de Ahorros"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Member Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Miembro:</span>
                            <span className="text-sm text-gray-900 font-semibold">{member.fullName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Código:</span>
                            <span className="text-sm text-gray-900">{member.memberCode}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Saldo actual:</span>
                            <span className="text-sm text-green-600 font-bold">
                                {formatCurrency(currentBalance)}
                            </span>
                        </div>
                        {formData.amount && withdrawalAmount > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-yellow-300">
                                <span className="text-sm font-medium text-gray-700">Nuevo saldo:</span>
                                <span className={`text-sm font-bold ${newBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {formatCurrency(newBalance)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Amount Input */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Monto del Retiro <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 font-medium">₡</span>
                        </div>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            step="0.01"
                            min="0.01"
                            max={currentBalance}
                            value={formData.amount}
                            onChange={handleChange}
                            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                formErrors.amount ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    {formErrors.amount && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.amount}</p>
                    )}
                </div>

                {/* Receipt Number Input */}
                <div>
                    <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Recibo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="receiptNumber"
                        name="receiptNumber"
                        value={formData.receiptNumber}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            formErrors.receiptNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: RET-2024-001"
                        disabled={isSubmitting}
                        required
                    />
                    {formErrors.receiptNumber && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.receiptNumber}</p>
                    )}
                </div>

                {/* Description Input */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Nota (Opcional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Descripción del retiro..."
                        disabled={isSubmitting}
                    />
                </div>

                {/* Warning */}
                {currentBalance === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm text-red-800">
                                Este miembro no tiene saldo disponible para retiros.
                            </p>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="outline"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="danger"
                        disabled={isSubmitting || currentBalance === 0}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Registrar Retiro
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

SavingsWithdrawalModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    member: PropTypes.shape({
        memberId: PropTypes.number.isRequired,
        fullName: PropTypes.string.isRequired,
        memberCode: PropTypes.string,
        currentBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    onSubmit: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool
};

export default SavingsWithdrawalModal;