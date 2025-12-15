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
import PrintModal from '../../components/common/PrintModal';
import SavingsReceiptPrint from '../../components/print/SavingsReceiptPrint';

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
    const [modalError, setModalError] = useState('');

    // Print modal state
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

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
    // Sort: pending first (oldest first), then approved, then rejected
    const requests = allRequests
        .filter(req => req.accountType === 'savings')
        .sort((a, b) => {
            const statusOrder = { pending: 0, approved: 1, rejected: 2 };
            const statusDiff = statusOrder[a.status] - statusOrder[b.status];
            if (statusDiff !== 0) return statusDiff;
            // Within same status, sort by date (oldest first for pending, newest first for others)
            if (a.status === 'pending') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

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
    const itemsPerPage = 10;
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
        setModalError('');
        setShowApproveModal(true);
    };

    // Handle reject
    const handleReject = (request) => {
        setSelectedRequest(request);
        setModalNotes('');
        setModalError('');
        setShowRejectModal(true);
    };

    // Confirm approve
    const confirmApprove = async () => {
        setModalError('');
        try {
            const previousBalance = parseFloat(selectedRequest.currentBalance) || 0;
            const amount = parseFloat(selectedRequest.requestedAmount);
            const newBalance = previousBalance - amount;

            const response = await approveRequest(selectedRequest.requestId, {
                adminNotes: modalNotes || null
            });

            // Prepare receipt data for printing
            setReceiptData({
                transactionType: 'withdrawal',
                member: {
                    member_id: selectedRequest.memberId,
                    full_name: selectedRequest.memberName,
                    member_code: selectedRequest.memberCode,
                    current_balance: previousBalance
                },
                amount: amount,
                previousBalance: previousBalance,
                newBalance: newBalance,
                description: selectedRequest.requestNotes || `Retiro de ahorros aprobado`,
                transactionDate: new Date(),
                transactionId: response?.data?.transactionId || response?.transactionId || ''
            });

            setSuccessMessage('Solicitud aprobada exitosamente');
            setShowApproveModal(false);
            setSelectedRequest(null);
            setModalNotes('');
            setShowPrintModal(true);
            refetch();

            setTimeout(() => {
                setSuccessMessage('');
                clearState();
            }, 3000);
        } catch (err) {
            setModalError(err.response?.data?.message || err.message || 'Error al aprobar la solicitud');
        }
    };

    // Confirm reject
    const confirmReject = async () => {
        if (!modalNotes.trim()) {
            return;
        }

        setModalError('');
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
            setModalError(err.response?.data?.message || err.message || 'Error al rechazar la solicitud');
        }
    };

    // Handle view receipt for approved requests
    const handleViewReceipt = (req) => {
        // Prepare receipt data from the request
        const previousBalance = parseFloat(req.currentBalance) + parseFloat(req.requestedAmount);
        const amount = parseFloat(req.requestedAmount);
        const newBalance = parseFloat(req.currentBalance);

        setReceiptData({
            transactionType: 'withdrawal',
            member: {
                member_id: req.memberId,
                full_name: req.memberName,
                member_code: req.memberCode,
                current_balance: previousBalance
            },
            amount: amount,
            previousBalance: previousBalance,
            newBalance: newBalance,
            description: req.requestNotes || `Retiro de ahorros aprobado`,
            transactionDate: req.reviewedAt || req.createdAt,
            transactionId: req.completedTransactionId || ''
        });

        setShowPrintModal(true);
    };

    // Table columns
    const tableColumns = [
        {
            key: 'memberCode',
            label: 'Código',
            render: (req) => (
                <div className="text-center">
                    <span className="text-sm font-medium text-gray-900">
                        {req.memberCode || '-'}
                    </span>
                </div>
            )
        },
        {
            key: 'memberName',
            label: 'Miembro',
            render: (req) => (
                <div className="text-left">
                    <span className="font-medium text-gray-900">{req.memberName || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'createdAt',
            label: 'Fecha',
            render: (req) => new Date(req.createdAt).toLocaleDateString('es-CR')
        },
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
            key: 'actions',
            label: 'Acciones',
            render: (req) => (
                <div className="flex items-center gap-2">
                    {req.status === 'pending' && (
                        <>
                            <Button
                                onClick={() => handleApprove(req)}
                                variant="primary"
                                size="sm"
                                className="!px-2 sm:!px-3"
                            >
                                <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="hidden sm:inline">Aprobar</span>
                            </Button>
                            <Button
                                onClick={() => handleReject(req)}
                                variant="danger"
                                size="sm"
                                className="!px-2 sm:!px-3"
                            >
                                <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="hidden sm:inline">Rechazar</span>
                            </Button>
                        </>
                    )}
                    {req.status === 'approved' && (
                        <Button
                            onClick={() => handleViewReceipt(req)}
                            variant="outline"
                            size="sm"
                            className="!px-2 sm:!px-3"
                        >
                            <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <span className="hidden sm:inline">Ver Recibo</span>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Solicitudes de Retiro</h1>
            </div>

            {/* Alerts */}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
            {error && <Alert type="error" message={error} onClose={() => {}} />}
            {operationError && <Alert type="error" message={operationError} onClose={clearState} />}

            {/* Filters and Table Container */}
            <div className="space-y-0">
                {/* Filters */}
                <Card title="Filtros de Búsqueda">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            <div className="overflow-x-auto">
                                <Table
                                    columns={tableColumns}
                                    data={paginatedRequests}
                                    emptyMessage="No se encontraron solicitudes"
                                />
                            </div>
                            <div className="px-4 py-3">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Approve Modal */}
            <Modal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                title="Aprobar Solicitud de Retiro"
                size="lg"
            >
                {selectedRequest && (
                    <div className="space-y-6">
                        {modalError && (
                            <Alert
                                type="error"
                                message={modalError}
                                onClose={() => setModalError('')}
                                autoClose={false}
                            />
                        )}

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700"><strong>Miembro:</strong> {selectedRequest.memberName} ({selectedRequest.memberCode})</p>
                            <p className="text-sm text-gray-700 mt-1"><strong>Saldo actual:</strong> ₡{Number(selectedRequest.currentBalance).toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Monto a Retirar</label>
                            <div className="flex items-center border border-gray-300 rounded-lg bg-gray-100">
                                <span className="pl-3 text-gray-500">₡</span>
                                <input
                                    type="text"
                                    value={Number(selectedRequest.requestedAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                    className="flex-1 py-2 pl-1 pr-3 border-0 bg-transparent focus:outline-none focus:ring-0 font-semibold text-gray-700"
                                    disabled
                                />
                            </div>
                        </div>

                        {selectedRequest.requestNotes && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nota del Miembro</label>
                                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                                    {selectedRequest.requestNotes}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center space-x-3">
                            <Button
                                type="button"
                                onClick={() => setShowApproveModal(false)}
                                variant="outline"
                                disabled={operationLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmApprove}
                                variant="primary"
                                disabled={operationLoading}
                            >
                                {operationLoading ? 'Procesando...' : 'Aprobar Retiro'}
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
                        {modalError && (
                            <Alert
                                type="error"
                                message={modalError}
                                onClose={() => setModalError('')}
                                autoClose={false}
                            />
                        )}

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

            {/* Print Receipt Modal */}
            <PrintModal
                isOpen={showPrintModal}
                onClose={() => {
                    setShowPrintModal(false);
                    setReceiptData(null);
                }}
                title="Recibo de Retiro"
                printTitle="Recibo de Retiro"
                size="md"
                paperSize="80mm 200mm"
                receiptData={receiptData}
                receiptType="savings"
            >
                {receiptData && (
                    <SavingsReceiptPrint
                        transactionType={receiptData.transactionType}
                        member={receiptData.member}
                        amount={receiptData.amount}
                        previousBalance={receiptData.previousBalance}
                        newBalance={receiptData.newBalance}
                        description={receiptData.description}
                        transactionDate={receiptData.transactionDate}
                        transactionId={receiptData.transactionId}
                    />
                )}
            </PrintModal>
        </div>
    );
};

export default WithdrawalRequestsManagementPage;