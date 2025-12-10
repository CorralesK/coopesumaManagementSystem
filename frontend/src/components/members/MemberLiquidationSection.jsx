/**
 * @file MemberLiquidationSection.jsx
 * @description Component for member liquidation operations
 * @module components/members
 */

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useLiquidationOperations } from '../../hooks/useLiquidations';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Alert from '../common/Alert';
import Loading from '../common/Loading';

/**
 * MemberLiquidationSection Component
 * Handles member liquidation with preview and confirmation
 */
const MemberLiquidationSection = forwardRef(({ member, onLiquidationComplete }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [liquidationData, setLiquidationData] = useState({
        liquidationType: 'periodic',
        memberContinues: true,
        notes: ''
    });
    const [preview, setPreview] = useState(null);

    const { loading, error, getPreview, execute, clearState } = useLiquidationOperations();

    // Calculate years since last liquidation
    const calculateYearsSince = () => {
        if (!member.lastLiquidationDate) {
            const affiliationDate = new Date(member.affiliationDate);
            const now = new Date();
            return Math.floor((now - affiliationDate) / (365.25 * 24 * 60 * 60 * 1000));
        }

        const lastLiquidation = new Date(member.lastLiquidationDate);
        const now = new Date();
        return Math.floor((now - lastLiquidation) / (365.25 * 24 * 60 * 60 * 1000));
    };

    const yearsSinceLastLiquidation = calculateYearsSince();
    const isPending = yearsSinceLastLiquidation >= 6;

    // Handle opening liquidation modal
    const handleOpenModal = async () => {
        try {
            const response = await getPreview(member.memberId);
            setPreview(response.data);
            setShowModal(true);
        } catch (err) {
            // Error handled by hook
        }
    };

    // Handle liquidation type change
    const handleTypeChange = (type) => {
        setLiquidationData({
            ...liquidationData,
            liquidationType: type,
            memberContinues: type === 'periodic'
        });
    };

    // Handle continue to confirmation
    const handleContinueToConfirm = () => {
        setShowModal(false);
        setShowConfirmModal(true);
    };

    // Handle execute liquidation
    const handleExecute = async () => {
        try {
            await execute({
                memberIds: [member.memberId],
                liquidationType: liquidationData.liquidationType,
                memberContinues: liquidationData.memberContinues,
                notes: liquidationData.notes || null
            });

            setShowConfirmModal(false);
            setShowModal(false);
            setLiquidationData({
                liquidationType: 'periodic',
                memberContinues: true,
                notes: ''
            });
            clearState();

            // Notify parent component
            if (onLiquidationComplete) {
                onLiquidationComplete();
            }
        } catch (err) {
            // Error handled by hook
        }
    };

    const formatCurrency = (amount) => {
        return `₡${Number(amount || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const totalBalance = (member.savingsBalance || 0) + (member.contributionsBalance || 0) + (member.surplusBalance || 0);

    // Expose handleOpenModal to parent component via ref
    useImperativeHandle(ref, () => ({
        openLiquidationModal: handleOpenModal
    }));

    return (
        <>
            {/* Liquidation Alert (if pending) */}
            {isPending && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Liquidación Pendiente
                            </h3>
                            <p className="mt-1 text-sm text-yellow-700">
                                Han pasado {yearsSinceLastLiquidation} años desde {member.lastLiquidationDate ? 'la última liquidación' : 'la afiliación'}.
                                Este miembro es elegible para liquidación periódica.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Liquidation Button - Hidden, triggered from parent */}
            <button
                ref={(el) => { if (el) el.dataset.liquidateButton = 'true'; }}
                onClick={handleOpenModal}
                className="hidden"
                disabled={loading || !member.isActive}
                aria-hidden="true"
            />

            {/* Error Alert */}
            {error && (
                <div className="mt-4">
                    <Alert type="error" message={error} onClose={clearState} />
                </div>
            )}

            {/* Preview Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    clearState();
                }}
                title="Vista Previa de Liquidación"
                size="md"
            >
                {loading ? (
                    <Loading message="Cargando preview..." />
                ) : preview ? (
                    <div className="space-y-6">
                        {/* Member Info */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-bold text-gray-900">{member.fullName}</h3>
                                <p className="text-sm text-gray-600">{member.memberCode}</p>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-300">
                                <p className="text-xs text-gray-600 text-center">
                                    {member.lastLiquidationDate
                                        ? `Última liquidación: ${new Date(member.lastLiquidationDate).toLocaleDateString('es-CR')}`
                                        : `Fecha de afiliación: ${new Date(member.affiliationDate).toLocaleDateString('es-CR')}`
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Balances */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Saldos a Liquidar</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                                    <p className="text-xs text-green-700 mb-1">Ahorros</p>
                                    <p className="text-base font-bold text-green-900">
                                        {formatCurrency(preview.savingsBalance)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                                    <p className="text-xs text-blue-700 mb-1">Aportaciones</p>
                                    <p className="text-base font-bold text-blue-900">
                                        {formatCurrency(preview.contributionsBalance)}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                                    <p className="text-xs text-purple-700 mb-1">Excedentes</p>
                                    <p className="text-base font-bold text-purple-900">
                                        {formatCurrency(preview.surplusBalance)}
                                    </p>
                                </div>
                                <div className="p-3 bg-primary-50 rounded-lg border-2 border-primary-300 text-center">
                                    <p className="text-xs text-primary-700 mb-1">Total</p>
                                    <p className="text-lg font-bold text-primary-900">
                                        {formatCurrency(preview.totalAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Liquidation Type */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Tipo de Liquidación</h4>
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{
                                    borderColor: liquidationData.liquidationType === 'periodic' ? 'rgb(var(--color-primary))' : '#d1d5db'
                                }}>
                                    <input
                                        type="radio"
                                        name="liquidationType"
                                        value="periodic"
                                        checked={liquidationData.liquidationType === 'periodic'}
                                        onChange={() => handleTypeChange('periodic')}
                                        className="mt-0.5 flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <span className="block text-sm font-medium text-gray-900">Liquidación Periódica</span>
                                        <span className="block text-xs text-gray-600 mt-1">El miembro continúa activo (cada 6 años)</span>
                                    </div>
                                </label>
                                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{
                                    borderColor: liquidationData.liquidationType === 'exit' ? 'rgb(var(--color-primary))' : '#d1d5db'
                                }}>
                                    <input
                                        type="radio"
                                        name="liquidationType"
                                        value="exit"
                                        checked={liquidationData.liquidationType === 'exit'}
                                        onChange={() => handleTypeChange('exit')}
                                        className="mt-0.5 flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <span className="block text-sm font-medium text-gray-900">Liquidación por Retiro</span>
                                        <span className="block text-xs text-gray-600 mt-1">El miembro sale y se marca como inactivo</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas (Opcional)
                            </label>
                            <textarea
                                value={liquidationData.notes}
                                onChange={(e) => setLiquidationData({ ...liquidationData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Agregar notas sobre esta liquidación..."
                            />
                        </div>

                        {/* Warning */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                            <p className="text-sm text-yellow-800">
                                {liquidationData.liquidationType === 'exit'
                                    ? 'Al ejecutar esta liquidación, el miembro será marcado como INACTIVO y todas sus cuentas se resetearán a ₡0.00'
                                    : 'Al ejecutar esta liquidación, todas las cuentas del miembro se resetearán a ₡0.00. Se generará un recibo automáticamente.'
                                }
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center space-x-3">
                            <Button
                                onClick={() => {
                                    setShowModal(false);
                                    clearState();
                                }}
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleContinueToConfirm}
                                variant="primary"
                            >
                                Continuar
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirmar Liquidación"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border-l-4 border-red-400">
                        <p className="text-sm text-red-800 font-medium">
                            Esta acción liquidará las cuentas del miembro <span className="font-bold">{member.fullName}</span>.
                            {liquidationData.liquidationType === 'exit' && (
                                <span className="block mt-2">El miembro será marcado como INACTIVO.</span>
                            )}
                        </p>
                        <p className="text-sm text-red-800 mt-2">
                            Esta operación NO se puede deshacer.
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tipo:</span>
                            <span className="font-semibold text-gray-900">
                                {liquidationData.liquidationType === 'periodic' ? 'Periódica' : 'Por Retiro'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total a liquidar:</span>
                            <span className="font-bold text-primary-600 text-lg">
                                {formatCurrency(preview?.totalAmount || 0)}
                            </span>
                        </div>
                        {liquidationData.notes && (
                            <div className="pt-2 border-t">
                                <span className="text-sm text-gray-600">Notas:</span>
                                <p className="text-sm text-gray-900 mt-1">{liquidationData.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Se generará un recibo automáticamente al completar la liquidación.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                        <Button
                            onClick={() => setShowConfirmModal(false)}
                            variant="outline"
                            disabled={loading}
                            fullWidth
                            className="sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleExecute}
                            variant="danger"
                            disabled={loading}
                            fullWidth
                            className="sm:w-auto"
                        >
                            {loading ? 'Ejecutando...' : 'Confirmar Liquidación'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
});

MemberLiquidationSection.propTypes = {
    member: PropTypes.shape({
        memberId: PropTypes.number.isRequired,
        fullName: PropTypes.string.isRequired,
        memberCode: PropTypes.string,
        affiliationDate: PropTypes.string.isRequired,
        lastLiquidationDate: PropTypes.string,
        isActive: PropTypes.bool.isRequired,
        savingsBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        contributionsBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        surplusBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }).isRequired,
    onLiquidationComplete: PropTypes.func
};

export default MemberLiquidationSection;