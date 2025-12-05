/**
 * @file SurplusDistributionPage.jsx
 * @description Admin page for surplus distribution management
 * @module pages/surplus
 */

import React, { useState, useEffect } from 'react';
import { useSurplusPreview, useSurplusDistribution, useSurplusHistory } from '../../hooks/useSurplus';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';

/**
 * SurplusDistributionPage Component
 * Allows administrators to distribute surplus among members
 */
const SurplusDistributionPage = () => {
    const currentYear = new Date().getFullYear();

    const [formData, setFormData] = useState({
        fiscalYear: currentYear,
        totalAmount: ''
    });
    const [errors, setErrors] = useState({});
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showExecuteModal, setShowExecuteModal] = useState(false);
    const [distributionNotes, setDistributionNotes] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Use hooks
    const { preview, loading: loadingPreview, error: previewError, getPreview, clearPreview } = useSurplusPreview();
    const { loading: executing, error: executeError, success, executeDistribution, clearState } = useSurplusDistribution();
    const { history, loading: loadingHistory, fetchHistory } = useSurplusHistory();

    // Load history on mount
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Handle success
    useEffect(() => {
        if (success) {
            setSuccessMessage('Excedentes distribuidos exitosamente');
            setShowExecuteModal(false);
            setFormData({ fiscalYear: currentYear, totalAmount: '' });
            clearPreview();
            fetchHistory();

            setTimeout(() => {
                setSuccessMessage('');
                clearState();
            }, 3000);
        }
    }, [success, currentYear, clearPreview, fetchHistory, clearState]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.fiscalYear) {
            newErrors.fiscalYear = 'El año fiscal es requerido';
        }

        if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
            newErrors.totalAmount = 'El monto debe ser mayor a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle preview
    const handlePreview = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            await getPreview({
                fiscalYear: parseInt(formData.fiscalYear),
                totalAmount: parseFloat(formData.totalAmount)
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
            await executeDistribution({
                fiscalYear: parseInt(formData.fiscalYear),
                totalDistributableAmount: parseFloat(formData.totalAmount),
                notes: distributionNotes || null
            });
        } catch (err) {
            // Error handled by hook
        }
    };

    // Generate fiscal year options (last 5 years)
    const fiscalYearOptions = Array.from({ length: 5 }, (_, i) => {
        const year = currentYear - i;
        return { value: year, label: year.toString() };
    });

    // Preview table columns
    const previewColumns = [
        {
            key: 'memberName',
            label: 'Miembro',
            render: (item) => (
                <div>
                    <p className="font-medium text-gray-900">{item.memberName}</p>
                    <p className="text-xs text-gray-500">{item.memberCode || ''}</p>
                </div>
            )
        },
        {
            key: 'contributions',
            label: 'Aportaciones',
            render: (item) => `₡${Number(item.memberContributions || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`
        },
        {
            key: 'percentage',
            label: 'Porcentaje',
            render: (item) => `${Number(item.percentage || 0).toFixed(2)}%`
        },
        {
            key: 'surplusAmount',
            label: 'Excedente',
            render: (item) => (
                <span className="font-semibold text-primary-600">
                    ₡{Number(item.surplusAmount || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                </span>
            )
        }
    ];

    // History table columns
    const historyColumns = [
        {
            key: 'distributionDate',
            label: 'Fecha',
            render: (dist) => new Date(dist.distributionDate || dist.createdAt).toLocaleDateString('es-CR')
        },
        {
            key: 'fiscalYear',
            label: 'Año Fiscal'
        },
        {
            key: 'totalAmount',
            label: 'Monto Total',
            render: (dist) => `₡${Number(dist.totalDistributableAmount || dist.totalAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`
        },
        {
            key: 'membersReceiving',
            label: 'Miembros',
            render: (dist) => dist.membersReceiving || dist.memberCount || '-'
        },
        {
            key: 'createdBy',
            label: 'Creado Por',
            render: (dist) => dist.createdByName || 'N/A'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Distribución de Excedentes</h1>
                    <p className="text-gray-600 mt-1">Distribuye los excedentes entre los miembros según sus aportaciones</p>
                </div>
            </div>

            {/* Alerts */}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
            {previewError && <Alert type="error" message={previewError} onClose={clearPreview} />}
            {executeError && <Alert type="error" message={executeError} onClose={clearState} />}

            {/* Distribution Form */}
            <Card title="Nueva Distribución">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Select
                            label="Año Fiscal"
                            name="fiscalYear"
                            value={formData.fiscalYear}
                            onChange={handleInputChange}
                            options={fiscalYearOptions}
                            error={errors.fiscalYear}
                            required
                        />

                        <Input
                            label="Monto Total Distribuible"
                            name="totalAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.totalAmount}
                            onChange={handleInputChange}
                            error={errors.totalAmount}
                            required
                            placeholder="0.00"
                        />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Fórmula de Distribución</h4>
                        <p className="text-sm text-blue-700">
                            Excedente por Miembro = (Aportaciones del Miembro / Total de Aportaciones) × Monto Total
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handlePreview}
                            variant="primary"
                            disabled={loadingPreview}
                        >
                            {loadingPreview ? 'Calculando...' : 'Ver Vista Previa'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* History */}
            <Card title="Historial de Distribuciones" padding="none">
                {loadingHistory ? (
                    <div className="py-8">
                        <Loading message="Cargando historial..." />
                    </div>
                ) : (
                    <Table
                        columns={historyColumns}
                        data={history}
                        emptyMessage="No hay distribuciones registradas"
                    />
                )}
            </Card>

            {/* Preview Modal */}
            <Modal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                title="Vista Previa de Distribución"
                size="xl"
            >
                {preview && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Año Fiscal</p>
                                <p className="text-xl font-bold text-gray-900">{formData.fiscalYear}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Monto Total</p>
                                <p className="text-xl font-bold text-primary-600">
                                    ₡{parseFloat(formData.totalAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Miembros Elegibles</p>
                                <p className="text-xl font-bold text-gray-900">{preview.distributions?.length || 0}</p>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            <Table
                                columns={previewColumns}
                                data={preview.distributions || []}
                                emptyMessage="No hay miembros elegibles"
                            />
                        </div>

                        {preview.summary && (
                            <div className="p-4 bg-primary-50 border-t-4 border-primary-600 rounded-lg">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-primary-700">Total Aportaciones</p>
                                        <p className="text-lg font-bold text-primary-900">
                                            ₡{Number(preview.summary.totalContributions || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-primary-700">Total a Distribuir</p>
                                        <p className="text-lg font-bold text-primary-900">
                                            ₡{Number(preview.summary.totalToDistribute || formData.totalAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                Ejecutar Distribución
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Execute Confirmation Modal */}
            <Modal
                isOpen={showExecuteModal}
                onClose={() => setShowExecuteModal(false)}
                title="Confirmar Distribución de Excedentes"
                size="md"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                        <p className="text-sm text-yellow-800">
                            Esta acción distribuirá ₡{parseFloat(formData.totalAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                            entre {preview?.distributions?.length || 0} miembros. Esta operación no se puede deshacer.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas (opcional)
                        </label>
                        <textarea
                            value={distributionNotes}
                            onChange={(e) => setDistributionNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Notas sobre esta distribución..."
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={() => setShowExecuteModal(false)}
                            variant="outline"
                            disabled={executing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmExecute}
                            variant="primary"
                            disabled={executing}
                        >
                            {executing ? 'Ejecutando...' : 'Confirmar Ejecución'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SurplusDistributionPage;