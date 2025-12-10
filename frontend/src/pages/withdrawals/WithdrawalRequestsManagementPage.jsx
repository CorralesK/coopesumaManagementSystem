/**
 * @file WithdrawalRequestsManagementPage.jsx
 * @description Admin page for managing withdrawal requests
 * @module pages/withdrawals
 */

import React, { useState } from 'react';
import { useWithdrawalRequests } from '../../hooks/useWithdrawalRequests';
import { useWithdrawalOperations } from '../../hooks/useWithdrawalOperations';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ClearFiltersButton from '../../components/common/ClearFiltersButton';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';

/**
 * WithdrawalRequestsManagementPage Component
 * Admin interface for approving/rejecting withdrawal requests
 */
const WithdrawalRequestsManagementPage = () => {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalNotes, setModalNotes] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Use hooks - TEMPORARILY filter only savings (contributions and surplus hidden)
    const {
        requests: allRequests,
        loading,
        error,
        filters,
        updateFilters,
        resetFilters,
        refetch
    } = useWithdrawalRequests();

    // TEMPORARILY HIDDEN - Filter to show only savings withdrawal requests
    const requests = allRequests.filter(req => req.accountType === 'savings');

    const {
        approveRequest,
        rejectRequest,
        loading: operationLoading,
        error: operationError,
        success,
        clearState
    } = useWithdrawalOperations();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const paginatedRequests = requests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        updateFilters({ [field]: value });
        setCurrentPage(1);
    };

    // Handle approve
    const handleApprove = (request) => {
        setSelectedRequest(request);
        setModalNotes('');
        setShowApproveModal(true);
    };

    // Handle reject
    const handleReject = (request) => {
        setSelectedRequest(request);
        setModalNotes('');
        setShowRejectModal(true);
    };

    // Confirm approve
    const confirmApprove = async () => {
        try {
            await approveRequest(selectedRequest.requestId, {
                adminNotes: modalNotes || null
            });
            setSuccessMessage('Solicitud aprobada exitosamente');
            setShowApproveModal(false);
            setSelectedRequest(null);
            setModalNotes('');
            refetch();

            setTimeout(() => {
                setSuccessMessage('');
                clearState();
            }, 3000);
        } catch (err) {
            // Error handled by hook
        }
    };

    // Confirm reject
    const confirmReject = async () => {
        if (!modalNotes.trim()) {
            return;
        }

        try {
            await rejectRequest(selectedRequest.requestId, {
                adminNotes: modalNotes
            });
            setSuccessMessage('Solicitud rechazada');
            setShowRejectModal(false);
            setSelectedRequest(null);
            setModalNotes('');
            refetch();

            setTimeout(() => {
                setSuccessMessage('');
                clearState();
            }, 3000);
        } catch (err) {
            // Error handled by hook
        }
    };

    // Table columns
    const tableColumns = [
        {
            key: 'createdAt',
            label: 'Fecha',
            render: (req) => new Date(req.createdAt).toLocaleDateString('es-CR')
        },
        {
            key: 'memberName',
            label: 'Miembro',
            render: (req) => (
                <div>
                    <p className="font-medium text-gray-900">{req.memberName || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{req.memberCode || ''}</p>
                </div>
            )
        },
        // TEMPORARILY HIDDEN - Account type column (only savings shown)
        // {
        //     key: 'accountType',
        //     label: 'Cuenta',
        //     render: (req) => {
        //         const accountLabels = {
        //             savings: 'Ahorro',
        //             contributions: 'Aportaciones',
        //             surplus: 'Excedentes'
        //         };
        //         const accountColors = {
        //             savings: 'bg-green-100 text-green-800',
        //             contributions: 'bg-blue-100 text-blue-800',
        //             surplus: 'bg-purple-100 text-purple-800'
        //         };
        //         return (
        //             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accountColors[req.accountType] || 'bg-gray-100 text-gray-800'}`}>
        //                 {accountLabels[req.accountType] || req.accountType}
        //             </span>
        //         );
        //     }
        // },
        {
            key: 'requestedAmount',
            label: 'Monto',
            render: (req) => (
                <span className="font-semibold">
                    ₡{Number(req.requestedAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Estado',
            render: (req) => {
                const statusConfig = {
                    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
                    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
                    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' }
                };
                const config = statusConfig[req.status] || statusConfig.pending;

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            key: 'requestNotes',
            label: 'Notas',
            render: (req) => (
                <div className="max-w-xs">
                    <p className="text-sm text-gray-600 truncate">{req.requestNotes || '-'}</p>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (req) => (
                <div className="flex items-center gap-2">
                    {req.status === 'pending' && (
                        <>
                            <Button
                                onClick={() => handleApprove(req)}
                                variant="success"
                                size="sm"
                            >
                                Aprobar
                            </Button>
                            <Button
                                onClick={() => handleReject(req)}
                                variant="danger"
                                size="sm"
                            >
                                Rechazar
                            </Button>
                        </>
                    )}
                    {req.status === 'approved' && req.receiptId && (
                        <Button
                            onClick={() => window.open(`/receipts/${req.receiptId}/download`, '_blank')}
                            variant="outline"
                            size="sm"
                        >
                            Ver Recibo
                        </Button>
                    )}
                </div>
            )
        }
    ];

    // Filter options
    const statusOptions = [
        { value: 'pending', label: 'Pendientes' },
        { value: 'approved', label: 'Aprobadas' },
        { value: 'rejected', label: 'Rechazadas' }
    ];

    // TEMPORARILY HIDDEN - Account type filter options (only savings shown)
    // const accountTypeOptions = [
    //     { value: '', label: 'Todas las cuentas' },
    //     { value: 'savings', label: 'Ahorro' },
    //     { value: 'contributions', label: 'Aportaciones' },
    //     { value: 'surplus', label: 'Excedentes' }
    // ];

    if (loading && requests.length === 0) {
        return <Loading message="Cargando solicitudes..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Solicitudes de Retiro de Ahorros</h1>
                    <p className="text-gray-600 mt-1">Aprueba o rechaza las solicitudes de retiro de fondos de ahorro de los miembros</p>
                </div>
            </div>

            {/* Alerts */}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
            {error && <Alert type="error" message={error} onClose={() => {}} />}
            {operationError && <Alert type="error" message={operationError} onClose={clearState} />}

            {/* Filters */}
            <Card title="Filtros de Búsqueda">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Buscar"
                        name="search"
                        type="text"
                        value={filters.memberId}
                        onChange={(e) => handleFilterChange('memberId', e.target.value)}
                        onClear={() => handleFilterChange('memberId', '')}
                        placeholder="Nombre o código de miembro..."
                    />
                    <Select
                        label="Estado"
                        name="status"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        options={statusOptions}
                        placeholder="Todos los estados"
                    />
                    {/* TEMPORARILY HIDDEN - Account type filter (only savings shown)
                    <Select
                        label="Tipo de Cuenta"
                        name="accountType"
                        value={filters.accountType}
                        onChange={(e) => handleFilterChange('accountType', e.target.value)}
                        options={accountTypeOptions}
                    />
                    */}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    <ClearFiltersButton
                        show={filters.memberId || filters.status}
                        onClick={() => resetFilters()}
                    />
                </div>
            </Card>

            {/* Requests Table */}
            <Card padding="none">
                {loading ? (
                    <div className="py-8">
                        <Loading message="Cargando..." />
                    </div>
                ) : (
                    <>
                        <Table
                            columns={tableColumns}
                            data={paginatedRequests}
                            emptyMessage="No se encontraron solicitudes"
                        />
                        {totalPages > 1 && (
                            <div className="px-6 py-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Approve Modal */}
            <Modal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                title="Aprobar Solicitud de Retiro"
                size="md"
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Miembro</p>
                            <p className="font-semibold">{selectedRequest.memberName}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Monto</p>
                            <p className="text-2xl font-bold text-green-600">
                                ₡{Number(selectedRequest.requestedAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas Administrativas (opcional)
                            </label>
                            <textarea
                                value={modalNotes}
                                onChange={(e) => setModalNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Notas sobre la aprobación..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setShowApproveModal(false)}
                                variant="outline"
                                disabled={operationLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmApprove}
                                variant="success"
                                disabled={operationLoading}
                            >
                                {operationLoading ? 'Aprobando...' : 'Confirmar Aprobación'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Rechazar Solicitud de Retiro"
                size="md"
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Miembro</p>
                            <p className="font-semibold">{selectedRequest.memberName}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Monto</p>
                            <p className="text-2xl font-bold text-red-600">
                                ₡{Number(selectedRequest.requestedAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Razón del Rechazo <span className="text-red-600">*</span>
                            </label>
                            <textarea
                                value={modalNotes}
                                onChange={(e) => setModalNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Explique por qué se rechaza la solicitud..."
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setShowRejectModal(false)}
                                variant="outline"
                                disabled={operationLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmReject}
                                variant="danger"
                                disabled={operationLoading || !modalNotes.trim()}
                            >
                                {operationLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default WithdrawalRequestsManagementPage;