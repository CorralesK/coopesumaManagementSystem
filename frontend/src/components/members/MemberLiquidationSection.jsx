/**
 * @file MemberLiquidationSection.jsx
 * @description Component for member liquidation operations (savings only)
 * @module components/members
 */

import { useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useLiquidationOperations } from '../../hooks/useLiquidations';
import Button from '../common/Button';
import Modal from '../common/Modal';
import PrintModal from '../common/PrintModal';
import Alert from '../common/Alert';
import Loading from '../common/Loading';
import LiquidationReceiptPrint from '../print/LiquidationReceiptPrint';

/**
 * MemberLiquidationSection Component
 * Handles member liquidation with preview and confirmation
 * Currently only liquidates savings account
 */
const MemberLiquidationSection = forwardRef(({ member, onLiquidationComplete, onError }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [liquidationData, setLiquidationData] = useState({
        liquidationType: 'periodic',
        memberContinues: true,
        notes: ''
    });
    const [preview, setPreview] = useState(null);

    // Print modal state
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

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
    const handleOpenModal = async (forcedType = null) => {
        try {
            const response = await getPreview(member.memberId);
            setPreview(response.data);

            // If forced type is provided, set it and skip to confirmation
            if (forcedType) {
                setLiquidationData({
                    liquidationType: forcedType,
                    memberContinues: forcedType === 'periodic',
                    notes: ''
                });
                // For exit type (delete action), go directly to confirmation modal
                if (forcedType === 'exit') {
                    setShowConfirmModal(true);
                } else {
                    setShowModal(true);
                }
            } else {
                setShowModal(true);
            }
        } catch (err) {
            // Error will be available in the error state from the hook
            // Pass to parent if callback provided
            if (onError) {
                setTimeout(() => {
                    if (error) onError(error);
                }, 100);
            }
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
        // Save current data before any state changes
        const currentLiquidationType = liquidationData.liquidationType;
        const currentNotes = liquidationData.notes;
        const currentSavingsBalance = preview?.savingsBalance || 0;

        try {
            const response = await execute({
                memberIds: [member.memberId],
                liquidationType: currentLiquidationType,
                memberContinues: liquidationData.memberContinues,
                notes: currentNotes || null
            });

            // Prepare receipt data
            const liquidationResult = response?.data?.[0];
            const receiptInfo = {
                member: { ...member },
                liquidationType: currentLiquidationType,
                savingsAmount: currentSavingsBalance,
                totalAmount: currentSavingsBalance,
                notes: currentNotes,
                liquidationDate: new Date(),
                liquidationId: liquidationResult?.liquidationId || '',
                receiptNumber: liquidationResult?.receiptNumber || ''
            };

            // Close confirmation modals
            setShowConfirmModal(false);
            setShowModal(false);

            // Set receipt data and show print modal BEFORE notifying parent
            setReceiptData(receiptInfo);
            setShowPrintModal(true);

            // Reset form data
            setLiquidationData({
                liquidationType: 'periodic',
                memberContinues: true,
                notes: ''
            });
            clearState();

            // Notify parent component with a delay to ensure print modal is rendered
            if (onLiquidationComplete) {
                setTimeout(() => {
                    onLiquidationComplete();
                }, 500);
            }
        } catch (err) {
            // Error handled by hook
        }
    };

    const formatCurrency = (amount) => {
        return `₡${Number(amount || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

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

            {/* Error Alert - Only show if no onError callback provided */}
            {error && !onError && (
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
                title="Liquidación de Ahorros"
                size="lg"
            >
                {loading ? (
                    <Loading message="Cargando..." />
                ) : preview ? (
                    <div className="space-y-6">
                        {/* Member Info */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>Miembro:</strong> {member.fullName} ({member.memberCode})
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                                <strong>{member.lastLiquidationDate ? 'Última liquidación:' : 'Fecha afiliación:'}</strong>{' '}
                                {member.lastLiquidationDate
                                    ? new Date(member.lastLiquidationDate).toLocaleDateString('es-CR')
                                    : new Date(member.affiliationDate).toLocaleDateString('es-CR')
                                }
                            </p>
                        </div>

                        {/* Savings Balance */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Saldo a Liquidar
                            </label>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(preview.savingsBalance)}
                            </div>
                            {preview.savingsBalance === 0 && (
                                <p className="mt-2 text-sm text-yellow-600">
                                    El miembro no tiene saldo. Se generará un recibo con monto ₡0.00 como comprobante.
                                </p>
                            )}
                        </div>

                        {/* Liquidation Type */}
                        <div>
                            <label htmlFor="liquidationType" className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Liquidación <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="liquidationType"
                                name="liquidationType"
                                value={liquidationData.liquidationType}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="periodic">Liquidación Periódica</option>
                                <option value="exit">Liquidación por Retiro</option>
                            </select>
                            {liquidationData.liquidationType && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {liquidationData.liquidationType === 'periodic'
                                        ? 'El miembro continúa activo. Esta liquidación se realiza cada 6 años.'
                                        : 'El miembro deja la cooperativa. Se desactivará el miembro y su usuario.'
                                    }
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                Nota (Opcional)
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={liquidationData.notes}
                                onChange={(e) => setLiquidationData({ ...liquidationData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Descripción de la liquidación..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowModal(false);
                                    clearState();
                                }}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleContinueToConfirm}
                                variant="primary"
                                className="w-full sm:w-auto"
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
                <div className="space-y-6">
                    {/* Error Alert in Confirmation Modal */}
                    {error && (
                        <Alert type="error" message={error} onClose={clearState} />
                    )}

                    {/* Member Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <strong>Miembro:</strong> {member.fullName} ({member.memberCode})
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                            <strong>Tipo de liquidación:</strong>{' '}
                            <span className={`font-medium px-2 py-1 rounded text-xs ${
                                liquidationData.liquidationType === 'periodic'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {liquidationData.liquidationType === 'periodic' ? 'Periódica' : 'Por Retiro'}
                            </span>
                        </p>
                        {liquidationData.notes && (
                            <p className="text-sm text-gray-700 mt-1">
                                <strong>Notas:</strong> {liquidationData.notes}
                            </p>
                        )}
                    </div>

                    {/* Amount to Liquidate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total a Liquidar (Ahorros)
                        </label>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(preview?.savingsBalance || 0)}
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-orange-700">
                                Esta acción liquidará la cuenta de ahorros de <span className="font-bold">{member.fullName}</span>.
                                {liquidationData.liquidationType === 'exit' && ' El miembro y su cuenta de usuario serán marcados como INACTIVOS.'}
                                {' '}<span className="font-semibold">Esta operación NO se puede deshacer.</span>
                            </p>
                        </div>
                    </div>

                    {/* Receipt Info */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-blue-700">
                                Se generará un recibo automáticamente al completar la liquidación.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={() => setShowConfirmModal(false)}
                            variant="outline"
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleExecute}
                            variant="primary"
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            {loading ? 'Ejecutando...' : 'Confirmar Liquidación'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Print Receipt Modal */}
            <PrintModal
                isOpen={showPrintModal}
                onClose={() => {
                    setShowPrintModal(false);
                    setReceiptData(null);
                }}
                title="Recibo de Liquidación"
                printTitle={`Recibo Liquidación - ${member?.fullName || ''}`}
                size="md"
                paperSize="80mm 200mm"
            >
                {receiptData && (
                    <LiquidationReceiptPrint
                        member={receiptData.member}
                        liquidationType={receiptData.liquidationType}
                        savingsAmount={receiptData.savingsAmount}
                        totalAmount={receiptData.totalAmount}
                        notes={receiptData.notes}
                        liquidationDate={receiptData.liquidationDate}
                        liquidationId={receiptData.liquidationId}
                        receiptNumber={receiptData.receiptNumber}
                    />
                )}
            </PrintModal>
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
    onLiquidationComplete: PropTypes.func,
    onError: PropTypes.func
};

export default MemberLiquidationSection;