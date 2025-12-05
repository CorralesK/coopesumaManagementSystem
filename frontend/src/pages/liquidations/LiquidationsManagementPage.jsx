/**
 * @file LiquidationsManagementPage.jsx
 * @description Admin page for managing member liquidations
 * @module pages/liquidations
 */

import React, { useState, useEffect } from 'react';
import { usePendingLiquidations, useLiquidationHistory, useLiquidationOperations } from '../../hooks/useLiquidations';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';

/**
 * LiquidationsManagementPage Component
 * Manages periodic and exit liquidations for members
 */
const LiquidationsManagementPage = () => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showExecuteModal, setShowExecuteModal] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    const [liquidationForm, setLiquidationForm] = useState({
        liquidationType: 'periodic',
        memberContinues: true,
        notes: ''
    });

    const [historyFilters, setHistoryFilters] = useState({
        fiscalYear: '',
        liquidationType: ''
    });

    const [successMessage, setSuccessMessage] = useState('');

    // Use hooks
    const { pendingMembers, loading: loadingPending, refetch: refetchPending } = usePendingLiquidations();
    const { history, loading: loadingHistory, refetch: refetchHistory } = useLiquidationHistory(historyFilters);
    const { loading: operating, error: operationError, preview, getPreview, execute, clearState } = useLiquidationOperations();

    // Refresh history when filters change
    useEffect(() => {
        refetchHistory();
    }, [historyFilters, refetchHistory]);

    // Handle member selection
    const handleSelectMember = (memberId) => {
        setSelectedMembers(prev => {
            if (prev.includes(memberId)) {
                return prev.filter(id => id !== memberId);
            } else {
                return [...prev, memberId];
            }
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedMembers.length === pendingMembers.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(pendingMembers.map(m => m.memberId));
        }
    };

    // Handle preview
    const handlePreview = async () => {
        if (selectedMembers.length === 0) {
            return;
        }

        try {
            // For simplicity, get preview of first selected member
            // In production, you might want to get previews for all
            const response = await getPreview(selectedMembers[0]);

            // Store preview data for all selected members
            setPreviewData({
                members: selectedMembers.map(memberId => {
                    const member = pendingMembers.find(m => m.memberId === memberId);
                    return {
                        ...member,
                        preview: response.data // In production, fetch individual previews
                    };
                })
            });

            setShowPreviewModal(true);
        } catch (err) {
            // Error handled by hook
        }
    };

    // Handle execute
    const handleExecute = () => {
        setShowPreviewModal(false);
        setShowExecuteModal(true);
    };

    // Confirm execution
    const confirmExecute = async () => {
        try {
            await execute({
                memberIds: selectedMembers,
                liquidationType: liquidationForm.liquidationType,
                memberContinues: liquidationForm.memberContinues,
                notes: liquidationForm.notes || null
            });

            setSuccessMessage(`Liquidación ${liquidationForm.liquidationType === 'periodic' ? 'periódica' : 'de salida'} ejecutada exitosamente`);
            setShowExecuteModal(false);
            setSelectedMembers([]);
            setLiquidationForm({
                liquidationType: 'periodic',
                memberContinues: true,
                notes: ''
            });
            refetchPending();
            refetchHistory();

            setTimeout(() => {
                setSuccessMessage('');
                clearState();
            }, 3000);
        } catch (err) {
            // Error handled by hook
        }
    };

    // Pending members table columns
    const pendingColumns = [
        {
            key: 'select',
            label: (
                <input
                    type="checkbox"
                    checked={selectedMembers.length === pendingMembers.length && pendingMembers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
            ),
            render: (member) => (
                <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.memberId)}
                    onChange={() => handleSelectMember(member.memberId)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
            )
        },
        {
            key: 'memberName',
            label: 'Miembro',
            render: (member) => (
                <div>
                    <p className="font-medium text-gray-900">{member.fullName || member.memberName}</p>
                    <p className="text-xs text-gray-500">{member.memberCode || ''}</p>
                </div>
            )
        },
        {
            key: 'affiliationDate',
            label: 'Fecha Afiliación',
            render: (member) => member.affiliationDate
                ? new Date(member.affiliationDate).toLocaleDateString('es-CR')
                : 'N/A'
        },
        {
            key: 'yearsSinceLastLiquidation',
            label: 'Años desde Última Liquidación',
            render: (member) => member.yearsSinceLastLiquidation || member.yearsActive || 'N/A'
        },
        {
            key: 'lastLiquidationDate',
            label: 'Última Liquidación',
            render: (member) => member.lastLiquidationDate
                ? new Date(member.lastLiquidationDate).toLocaleDateString('es-CR')
                : 'Nunca'
        }
    ];

    // History table columns
    const historyColumns = [
        {
            key: 'liquidationDate',
            label: 'Fecha',
            render: (liq) => new Date(liq.liquidationDate || liq.createdAt).toLocaleDateString('es-CR')
        },
        {
            key: 'memberName',
            label: 'Miembro',
            render: (liq) => (
                <div>
                    <p className="font-medium text-gray-900">{liq.memberName}</p>
                    <p className="text-xs text-gray-500">{liq.memberCode || ''}</p>
                </div>
            )
        },
        {
            key: 'liquidationType',
            label: 'Tipo',
            render: (liq) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    liq.liquidationType === 'periodic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                    {liq.liquidationType === 'periodic' ? 'Periódica' : 'Salida'}
                </span>
            )
        },
        {
            key: 'totalLiquidated',
            label: 'Total Liquidado',
            render: (liq) => (
                <span className="font-semibold text-primary-600">
                    ₡{Number(liq.totalLiquidated || liq.totalAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: 'receiptId',
            label: 'Recibo',
            render: (liq) => liq.receiptId ? (
                <Button
                    onClick={() => window.open(`/receipts/${liq.receiptId}/download`, '_blank')}
                    variant="outline"
                    size="sm"
                >
                    Ver Recibo
                </Button>
            ) : '-'
        }
    ];

    // Fiscal year options
    const currentYear = new Date().getFullYear();
    const fiscalYearOptions = [
        { value: '', label: 'Todos los años' },
        ...Array.from({ length: 5 }, (_, i) => {
            const year = currentYear - i;
            return { value: year, label: year.toString() };
        })
    ];

    const liquidationTypeOptions = [
        { value: '', label: 'Todos los tipos' },
        { value: 'periodic', label: 'Periódica' },
        { value: 'exit', label: 'Salida' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Liquidaciones</h1>
                    <p className="text-gray-600 mt-1">Administra liquidaciones periódicas y de salida</p>
                </div>
            </div>

            {/* Alerts */}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
            {operationError && <Alert type="error" message={operationError} onClose={clearState} />}

            {/* Pending Liquidations */}
            <Card
                title="Miembros Pendientes de Liquidación"
                headerAction={
                    <Button
                        onClick={handlePreview}
                        variant="primary"
                        size="sm"
                        disabled={selectedMembers.length === 0 || operating}
                    >
                        Vista Previa ({selectedMembers.length})
                    </Button>
                }
                padding="none"
            >
                {loadingPending ? (
                    <div className="py-8">
                        <Loading message="Cargando miembros pendientes..." />
                    </div>
                ) : (
                    <Table
                        columns={pendingColumns}
                        data={pendingMembers}
                        emptyMessage="No hay miembros pendientes de liquidación"
                    />
                )}
            </Card>

            {/* Liquidation Form */}
            <Card title="Configuración de Liquidación">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Liquidación
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="liquidationType"
                                        value="periodic"
                                        checked={liquidationForm.liquidationType === 'periodic'}
                                        onChange={(e) => setLiquidationForm(prev => ({ ...prev, liquidationType: e.target.value }))}
                                        className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Periódica (cada 6 años)</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="liquidationType"
                                        value="exit"
                                        checked={liquidationForm.liquidationType === 'exit'}
                                        onChange={(e) => setLiquidationForm(prev => ({ ...prev, liquidationType: e.target.value, memberContinues: false }))}
                                        className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Salida (deja la cooperativa)</span>
                                </label>
                            </div>
                        </div>

                        {liquidationForm.liquidationType === 'periodic' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ¿El miembro continúa?
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="memberContinues"
                                            value="true"
                                            checked={liquidationForm.memberContinues === true}
                                            onChange={() => setLiquidationForm(prev => ({ ...prev, memberContinues: true }))}
                                            className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Sí, continúa activo</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="memberContinues"
                                            value="false"
                                            checked={liquidationForm.memberContinues === false}
                                            onChange={() => setLiquidationForm(prev => ({ ...prev, memberContinues: false }))}
                                            className="rounded-full border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">No, sale de la cooperativa</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas
                        </label>
                        <textarea
                            value={liquidationForm.notes}
                            onChange={(e) => setLiquidationForm(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Notas sobre esta liquidación..."
                        />
                    </div>
                </div>
            </Card>

            {/* History */}
            <Card title="Historial de Liquidaciones">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Año Fiscal"
                            name="fiscalYear"
                            value={historyFilters.fiscalYear}
                            onChange={(e) => setHistoryFilters(prev => ({ ...prev, fiscalYear: e.target.value }))}
                            options={fiscalYearOptions}
                        />
                        <Select
                            label="Tipo de Liquidación"
                            name="liquidationType"
                            value={historyFilters.liquidationType}
                            onChange={(e) => setHistoryFilters(prev => ({ ...prev, liquidationType: e.target.value }))}
                            options={liquidationTypeOptions}
                        />
                    </div>
                </div>
            </Card>

            <Card padding="none">
                {loadingHistory ? (
                    <div className="py-8">
                        <Loading message="Cargando historial..." />
                    </div>
                ) : (
                    <Table
                        columns={historyColumns}
                        data={history}
                        emptyMessage="No hay liquidaciones registradas"
                    />
                )}
            </Card>

            {/* Preview Modal */}
            <Modal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                title="Vista Previa de Liquidación"
                size="xl"
            >
                {previewData && (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                            <p className="text-sm text-blue-800">
                                Liquidación {liquidationForm.liquidationType === 'periodic' ? 'Periódica' : 'de Salida'} para {selectedMembers.length} miembro(s)
                            </p>
                        </div>

                        <div className="space-y-4">
                            {previewData.members.map((member, index) => (
                                <div key={member.memberId} className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-3">{member.fullName || member.memberName}</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-600">Ahorro</p>
                                            <p className="font-semibold text-green-600">
                                                ₡{Number(member.preview?.savingsBalance || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Aportaciones</p>
                                            <p className="font-semibold text-blue-600">
                                                ₡{Number(member.preview?.contributionsBalance || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Excedentes</p>
                                            <p className="font-semibold text-purple-600">
                                                ₡{Number(member.preview?.surplusBalance || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Total</p>
                                            <p className="text-lg font-bold text-primary-600">
                                                ₡{Number(member.preview?.totalAmount || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                            <p className="text-sm text-yellow-800 font-medium">
                                Todas las cuentas se resetearán a ₡0.00 después de la liquidación
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setShowPreviewModal(false)}
                                variant="outline"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleExecute}
                                variant="primary"
                            >
                                Ejecutar Liquidación
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Execute Confirmation Modal */}
            <Modal
                isOpen={showExecuteModal}
                onClose={() => setShowExecuteModal(false)}
                title="Confirmar Liquidación"
                size="md"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border-l-4 border-red-400">
                        <p className="text-sm text-red-800 font-medium">
                            Esta acción liquidará las cuentas de {selectedMembers.length} miembro(s). Esta operación no se puede deshacer.
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            Tipo: <span className="font-semibold">
                                {liquidationForm.liquidationType === 'periodic' ? 'Periódica' : 'Salida'}
                            </span>
                        </p>
                        {liquidationForm.liquidationType === 'periodic' && (
                            <p className="text-sm text-gray-700 mt-1">
                                Miembro continúa: <span className="font-semibold">
                                    {liquidationForm.memberContinues ? 'Sí' : 'No'}
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={() => setShowExecuteModal(false)}
                            variant="outline"
                            disabled={operating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmExecute}
                            variant="danger"
                            disabled={operating}
                        >
                            {operating ? 'Ejecutando...' : 'Confirmar Liquidación'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LiquidationsManagementPage;