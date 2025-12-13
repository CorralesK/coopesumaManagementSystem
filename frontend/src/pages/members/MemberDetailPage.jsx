/**
 * @file MemberDetailPage.jsx
 * @description Page for displaying detailed member information with QR code
 * @module pages/members
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMember, useMemberOperations } from '../../hooks/useMembers';
import { usePermissions } from '../../hooks/usePermissions';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import MemberCard from '../../components/members/MemberCard';
import MemberLiquidationHistory from '../../components/members/MemberLiquidationHistory';
import MemberLiquidationSection from '../../components/members/MemberLiquidationSection';
import MemberSavingsHistory from '../../components/members/MemberSavingsHistory';
import { formatCurrency } from '../../utils/formatters';
import { printMemberCards } from '../../utils/printUtils';
import PrintModal from '../../components/common/PrintModal';
import SavingsReceiptPrint from '../../components/print/SavingsReceiptPrint';
import api from '../../services/api';
import { downloadMemberCardsPDF, getMemberQR } from '../../services/memberService';

/**
 * MemberDetailPage Component
 * Shows comprehensive member information including QR code
 */
const MemberDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const liquidationSectionRef = useRef(null);

    // Savings modals state
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [depositData, setDepositData] = useState({ amount: '', description: '' });
    const [withdrawalData, setWithdrawalData] = useState({ amount: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [depositModalError, setDepositModalError] = useState('');
    const [withdrawalModalError, setWithdrawalModalError] = useState('');

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Print modal state
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [printingCard, setPrintingCard] = useState(false);

    // Use custom hooks
    const { member, loading, error, refetch } = useMember(id);
    const { regenerateQR, loading: regenerating, error: regenerateError } = useMemberOperations();
    const permissions = usePermissions();

    // Detect action=delete from URL and open liquidation modal automatically
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'delete' && member && liquidationSectionRef.current) {
            // Remove the action parameter from URL
            searchParams.delete('action');
            setSearchParams(searchParams, { replace: true });

            // Open liquidation modal with exit type
            liquidationSectionRef.current.openLiquidationModal('exit');
        }
    }, [member, searchParams, setSearchParams]);

    // Event handlers
    const handleRegenerateQR = async () => {
        if (!member.isActive) {
            return;
        }

        if (!window.confirm('¿Estás seguro de que deseas regenerar el código QR? El código anterior dejará de funcionar.')) {
            return;
        }

        try {
            await regenerateQR(id);
            setSuccessMessage('Código QR regenerado exitosamente');
            refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleLiquidateMember = () => {
        // Call the openLiquidationModal method exposed by MemberLiquidationSection
        if (liquidationSectionRef.current) {
            liquidationSectionRef.current.openLiquidationModal();
        }
    };

    const handleDeleteMember = () => {
        setShowDeleteModal(true);
    };

    // Check if device is mobile
    const isMobileDevice = () => {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    };

    // Handle print/download carnet
    const handlePrintCarnet = async () => {
        try {
            setPrintingCard(true);

            if (isMobileDevice()) {
                // Mobile - download PDF from backend
                await downloadMemberCardsPDF([member.memberId]);
            } else {
                // Desktop - use printMemberCards (same as batch print)
                // Need to get QR code data first
                const qrResponse = await getMemberQR(member.memberId);
                const memberWithQR = {
                    ...member,
                    qrCodeDataUrl: qrResponse.data?.qrCodeDataUrl || member.qrCodeDataUrl
                };

                printMemberCards({
                    members: [memberWithQR],
                    cooperativeName: 'Coopesuma'
                });
            }

            // Close modal after print
            setQrModalOpen(false);
        } catch (err) {
            setErrorMessage('Error al imprimir el carnet: ' + (err.message || 'Error desconocido'));
        } finally {
            setPrintingCard(false);
        }
    };

    const handleContinueToLiquidation = () => {
        setShowDeleteModal(false);
        // Open the liquidation modal with exit type
        if (liquidationSectionRef.current) {
            liquidationSectionRef.current.openLiquidationModal('exit');
        }
    };

    const handleOpenDepositModal = () => {
        setDepositData({ amount: '', description: '' });
        setDepositModalError('');
        setShowDepositModal(true);
    };

    const handleOpenWithdrawalModal = () => {
        setWithdrawalData({ amount: '', description: '' });
        setWithdrawalModalError('');
        setShowWithdrawalModal(true);
    };

    const handleSubmitDeposit = async (e) => {
        e.preventDefault();
        setDepositModalError('');

        const amount = parseFloat(depositData.amount);
        if (!depositData.amount || amount <= 0) {
            setDepositModalError('El monto debe ser mayor a cero');
            return;
        }

        const previousBalance = parseFloat(member.savingsBalance) || 0;
        const newBalance = previousBalance + amount;
        const transactionDate = new Date();

        try {
            setSubmitting(true);
            const response = await api.post('/savings/deposits', {
                memberId: parseInt(id),
                amount: amount,
                description: depositData.description || `Depósito de ahorros - ${member.fullName}`,
                transactionDate: transactionDate.toISOString()
            });

            // Prepare receipt data and show print modal
            setReceiptData({
                transactionType: 'deposit',
                member: {
                    member_id: parseInt(id),
                    full_name: member.fullName,
                    member_code: member.memberCode,
                    current_balance: previousBalance
                },
                amount: amount,
                previousBalance: previousBalance,
                newBalance: newBalance,
                description: depositData.description,
                transactionDate: transactionDate,
                transactionId: response?.data?.transactionId || ''
            });

            setSuccessMessage('Depósito registrado exitosamente.');
            setShowDepositModal(false);
            setDepositData({ amount: '', description: '' });
            setShowPrintModal(true);
            refetch();
        } catch (err) {
            let errorMsg = 'Error al registrar el depósito';

            if (err.response?.status === 403) {
                errorMsg = 'No se puede realizar depósitos: El miembro está inactivo en el sistema';
                // Refresh member data to get updated status
                refetch();
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.message) {
                errorMsg = err.message;
            }

            setDepositModalError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitWithdrawal = async (e) => {
        e.preventDefault();
        setWithdrawalModalError('');

        const currentBalance = parseFloat(member.savingsBalance) || 0;

        if (currentBalance <= 0) {
            setWithdrawalModalError('El miembro no tiene saldo disponible para retirar');
            return;
        }

        const amount = parseFloat(withdrawalData.amount);
        if (!withdrawalData.amount || amount <= 0) {
            setWithdrawalModalError('El monto debe ser mayor a cero');
            return;
        }

        if (amount > currentBalance) {
            setWithdrawalModalError(`El monto de retiro (${formatCurrency(amount)}) no puede ser mayor al saldo disponible (${formatCurrency(currentBalance)})`);
            return;
        }

        const previousBalance = currentBalance;
        const newBalance = previousBalance - amount;
        const transactionDate = new Date();

        try {
            setSubmitting(true);
            const response = await api.post('/savings/withdrawals', {
                memberId: parseInt(id),
                amount: amount,
                description: withdrawalData.description || `Retiro de ahorros - ${member.fullName}`,
                transactionDate: transactionDate.toISOString()
            });

            // Prepare receipt data and show print modal
            setReceiptData({
                transactionType: 'withdrawal',
                member: {
                    member_id: parseInt(id),
                    full_name: member.fullName,
                    member_code: member.memberCode,
                    current_balance: previousBalance
                },
                amount: amount,
                previousBalance: previousBalance,
                newBalance: newBalance,
                description: withdrawalData.description,
                transactionDate: transactionDate,
                transactionId: response?.data?.transactionId || ''
            });

            setSuccessMessage('Retiro registrado exitosamente.');
            setShowWithdrawalModal(false);
            setWithdrawalData({ amount: '', description: '' });
            setShowPrintModal(true);
            refetch();
        } catch (err) {
            let errorMsg = 'Error al registrar el retiro';

            if (err.response?.status === 403) {
                errorMsg = 'No se puede realizar retiros: El miembro está inactivo en el sistema';
                // Refresh member data to get updated status
                refetch();
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.message) {
                errorMsg = err.message;
            }

            setWithdrawalModalError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <Loading message="Cargando información del miembro..." />;
    }

    if (!member) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No se encontró el miembro</p>
                <Button onClick={() => navigate('/members')} variant="primary" className="mt-4">
                    Volver a la Lista
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Volver"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Detalle del Miembro</h1>
                </div>
                {permissions.canEditMembers && (
                    <Button onClick={() => navigate(`/members/${id}/edit`)} variant="primary" className="w-full sm:w-auto">Editar</Button>
                )}
            </div>

            {/* Alerts */}
            {(error || regenerateError || errorMessage) && <Alert type="error" message={error || regenerateError || errorMessage} onClose={() => setErrorMessage('')} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Main Content */}
            <div className={`grid grid-cols-1 gap-6 ${(permissions.canViewQRCode || permissions.canDepositSavings) ? 'lg:grid-cols-5 xl:grid-cols-4' : ''}`}>
                {/* Left Column - Member Info */}
                <div className={`space-y-6 ${(permissions.canViewQRCode || permissions.canDepositSavings) ? 'lg:col-span-3 xl:col-span-3' : ''}`}>
                    <Card>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {/* Photo - Only for admin and registrar */}
                            {permissions.canViewMemberPhoto && (
                                <div className="flex-shrink-0">
                                    {member.photoUrl ? (
                                        <img
                                            src={member.photoUrl}
                                            alt={member.fullName}
                                            className="w-40 h-40 rounded-lg object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-40 h-40 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                                            <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Member Info */}
                            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900" style={{ marginBottom: '0.5rem' }}>{member.fullName}</h2>
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                        member.isActive
                                            ? 'bg-green-100 border border-green-200'
                                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-600' : 'bg-gray-500'}`} style={{ marginRight: '0.5rem' }}></span>
                                        <span className={member.isActive ? 'text-green-600' : ''}>
                                            {member.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </span>
                                </div>

                                {/* Info Simple */}
                                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.5rem' }}>
                                    <div className="pb-3 border-b border-gray-200">
                                        <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Código de Asociado</dt>
                                        <dd className="text-base text-gray-900 font-semibold" style={{ marginBottom: 0 }}>{member.memberCode || 'No asignado'}</dd>
                                    </div>

                                    {/* Personal data - Only for admin and registrar */}
                                    {permissions.canViewMemberPersonalData && (
                                        <>
                                            <div className="pb-3 border-b border-gray-200">
                                                <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Identificación</dt>
                                                <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{member.identification}</dd>
                                            </div>

                                            <div className="pb-3 border-b border-gray-200">
                                                <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Calidad</dt>
                                                <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{member.qualityName || 'N/A'}</dd>
                                            </div>

                                            <div className="pb-3 border-b border-gray-200">
                                                <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Nivel</dt>
                                                <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                                    {member.levelName && member.levelName !== 'N/A' && member.levelName !== 'No aplica' ? member.levelName : 'N/A'}
                                                </dd>
                                            </div>

                                            {member.gender && (
                                                <div className="pb-3 border-b border-gray-200">
                                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Género</dt>
                                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                                        {member.gender === 'M' ? 'Masculino' : member.gender === 'F' ? 'Femenino' : member.gender}
                                                    </dd>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Información de Afiliación">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="pb-3 border-b border-gray-200">
                                <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Fecha de Afiliación</dt>
                                <dd className="text-base text-gray-900 font-semibold" style={{ marginBottom: 0 }}>{formatDate(member.affiliationDate)}</dd>
                            </div>

                            <div className="pb-3 border-b border-gray-200">
                                <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Cuota de Afiliación</dt>
                                <dd className="text-base text-gray-900 font-semibold" style={{ marginBottom: 0 }}>₡500.00</dd>
                            </div>

                            {member.lastLiquidationDate && (
                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Última Liquidación</dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{formatDate(member.lastLiquidationDate)}</dd>
                                </div>
                            )}

                            <div className="pb-3 border-b border-gray-200">
                                <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Última Actualización</dt>
                                <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{formatDate(member.updatedAt)}</dd>
                            </div>
                        </div>
                    </Card>

                    {/* Commented out - Account Balances Section */}
                    {/* <Card title="Saldos de Cuentas">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <dt className="text-sm font-medium text-blue-700 mb-2">Cuenta de Ahorros</dt>
                                <dd className="text-2xl font-bold text-blue-900">
                                    ₡{member.savingsBalance ? parseFloat(member.savingsBalance).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </dd>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <dt className="text-sm font-medium text-green-700 mb-2">Cuenta de Aportaciones</dt>
                                <dd className="text-2xl font-bold text-green-900">
                                    ₡{member.contributionsBalance ? parseFloat(member.contributionsBalance).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </dd>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <dt className="text-sm font-medium text-purple-700 mb-2">Cuenta de Excedentes</dt>
                                <dd className="text-2xl font-bold text-purple-900">
                                    ₡{member.surplusBalance ? parseFloat(member.surplusBalance).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </dd>
                            </div>
                        </div>
                    </Card> */}
                </div>

                {/* Right Column - QR Code & Actions */}
                {(permissions.canViewQRCode || permissions.canDepositSavings) && (
                    <div className="lg:col-span-2 xl:col-span-1 space-y-6">
                        {/* QR Code Card - Only for admin and registrar */}
                        {permissions.canViewQRCode && (
                            <Card title="Código QR">
                                <div className="flex flex-col items-center space-y-4">
                                {/* QR Code Display */}
                                {member.qrCodeDataUrl ? (
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-primary-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                        <div className="relative bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-primary-300 transition-all duration-300 hover:shadow-xl">
                                            <img
                                                src={member.qrCodeDataUrl}
                                                alt={`QR Code for ${member.fullName}`}
                                                className="w-full max-w-[200px] mx-auto"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 p-12 rounded-2xl border-2 border-dashed border-gray-300">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                        <p className="text-sm text-gray-500 text-center font-medium">Código QR no disponible</p>
                                    </div>
                                )}

                                {/* Action Buttons - Only for admin and registrar */}
                                <div className="w-full space-y-3">
                                    <Button
                                        onClick={() => setQrModalOpen(true)}
                                        variant="outline"
                                        fullWidth
                                        className="group hover:border-primary-500 hover:bg-primary-50 transition-all"
                                    >
                                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Ver Carnet
                                    </Button>

                                    {permissions.canRegenerateQR && (
                                        <Button
                                            onClick={handleRegenerateQR}
                                            variant="secondary"
                                            fullWidth
                                            disabled={regenerating || !member.isActive}
                                            className="group hover:bg-gray-700 transition-all"
                                        >
                                            {regenerating ? (
                                                <>
                                                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Regenerando...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Regenerar QR
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>

                                {/* Inactive Member Warning */}
                                {!member.isActive && (
                                    <div className="w-full mt-2 bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-xs text-gray-600">
                                                <span className="font-semibold">Miembro Inactivo</span><br />
                                                No se puede regenerar el código QR.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                </div>
                            </Card>
                        )}

                        {/* Actions Card - For admin, registrar, and manager */}
                        <Card title="Acciones">
                            <div className="flex flex-col space-y-3">
                                {member.isActive ? (
                                    <>
                                        {permissions.canDepositSavings && (
                                            <Button
                                                onClick={handleOpenDepositModal}
                                                variant="primary"
                                                fullWidth
                                                className="group transition-all"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Depositar Ahorros
                                            </Button>
                                        )}

                                        {permissions.canWithdrawSavings && (
                                            <Button
                                                onClick={handleOpenWithdrawalModal}
                                                variant="outline"
                                                fullWidth
                                                className="group transition-all"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                                Retirar Ahorros
                                            </Button>
                                        )}

                                        {permissions.canLiquidateMember && (
                                            <Button
                                                onClick={handleLiquidateMember}
                                                variant="secondary"
                                                fullWidth
                                                className="group transition-all"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Liquidar Miembro
                                            </Button>
                                        )}

                                        {permissions.canDeleteMembers && (
                                            <Button
                                                onClick={handleDeleteMember}
                                                variant="danger"
                                                fullWidth
                                                className="group transition-all"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Eliminar Miembro
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex flex-col items-center text-center">
                                            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            <p className="text-sm text-gray-600 font-medium">Miembro Inactivo</p>
                                            <p className="text-xs text-gray-500 mt-1">No hay acciones disponibles</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Full Width History Sections */}
            <div className="space-y-6">
                {/* Savings History */}
                <Card title="Historial de Ahorros">
                    <MemberSavingsHistory
                        memberId={parseInt(id)}
                        currentBalance={member.savingsBalance ? parseFloat(member.savingsBalance) : 0}
                        lastLiquidationDate={member.lastLiquidationDate}
                    />
                </Card>

                {/* Liquidation History */}
                <Card title="Historial de Liquidaciones">
                    <MemberLiquidationHistory memberId={parseInt(id)} />
                </Card>
            </div>

            {/* Hidden Liquidation Section - Triggered by "Liquidar Miembro" button */}
            <MemberLiquidationSection
                ref={liquidationSectionRef}
                member={member}
                onLiquidationComplete={() => {
                    refetch();
                    setSuccessMessage('Liquidación ejecutada exitosamente. Se ha generado el recibo automáticamente.');
                }}
            />

            {/* Card Modal - Shows Member Card */}
            {qrModalOpen && (
                <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title={`Carnet - ${member.fullName}`} size="xl">
                    <div className="flex flex-col items-center">
                        <div id="printable-card" className="member-card-preview-container">
                            <div className="member-card-preview-wrapper">
                                <MemberCard member={member} showCutLines={false} />
                            </div>
                        </div>
                        <div className="mt-6 flex space-x-3 print-hide">
                            <Button onClick={() => setQrModalOpen(false)} variant="outline">Cerrar</Button>
                            <Button onClick={handlePrintCarnet} variant="primary" disabled={printingCard}>
                                {printingCard ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Descargando...
                                    </>
                                ) : (
                                    'Imprimir Carnet'
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Deposit Modal */}
            <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="Registrar Depósito" size="lg">
                <form onSubmit={handleSubmitDeposit} className="space-y-6">
                    {depositModalError && (
                        <Alert type="error" message={depositModalError} onClose={() => setDepositModalError('')} />
                    )}

                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Miembro:</strong> {member.fullName} ({member.memberCode})</p>
                        <p className="text-sm text-gray-700 mt-1"><strong>Saldo actual:</strong> {formatCurrency(parseFloat(member.savingsBalance) || 0)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monto del Depósito *</label>
                        <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 bg-white">
                            <span className="pl-3 text-gray-500">₡</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={depositData.amount}
                                onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                                className="flex-1 py-2 pl-1 pr-3 border-0 bg-transparent focus:outline-none focus:ring-0"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nota (Opcional)</label>
                        <textarea
                            value={depositData.description}
                            onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Descripción del depósito..."
                        />
                    </div>

                    <div className="flex justify-center space-x-3">
                        <Button type="button" onClick={() => setShowDepositModal(false)} variant="outline">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting}>
                            {submitting ? 'Procesando...' : 'Registrar Depósito'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Withdrawal Modal */}
            <Modal isOpen={showWithdrawalModal} onClose={() => setShowWithdrawalModal(false)} title="Registrar Retiro" size="lg">
                <form onSubmit={handleSubmitWithdrawal} className="space-y-6">
                    {withdrawalModalError && (
                        <Alert type="error" message={withdrawalModalError} onClose={() => setWithdrawalModalError('')} />
                    )}

                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Miembro:</strong> {member.fullName} ({member.memberCode})</p>
                        <p className="text-sm text-gray-700 mt-1"><strong>Saldo disponible:</strong> {formatCurrency(parseFloat(member.savingsBalance) || 0)}</p>
                    </div>

                    {parseFloat(member.savingsBalance) <= 0 && (
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-orange-700">
                                    Este miembro no tiene saldo disponible para realizar retiros. Por favor, seleccione otro miembro o realice un depósito primero.
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monto del Retiro *</label>
                        <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 bg-white">
                            <span className="pl-3 text-gray-500">₡</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={parseFloat(member.savingsBalance) || 0}
                                value={withdrawalData.amount}
                                onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                                className="flex-1 py-2 pl-1 pr-3 border-0 bg-transparent focus:outline-none focus:ring-0"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nota (Opcional)</label>
                        <textarea
                            value={withdrawalData.description}
                            onChange={(e) => setWithdrawalData({ ...withdrawalData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Motivo del retiro..."
                        />
                    </div>

                    <div className="flex justify-center space-x-3">
                        <Button type="button" onClick={() => setShowWithdrawalModal(false)} variant="outline">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting || parseFloat(member.savingsBalance) <= 0}>
                            {submitting ? 'Procesando...' : 'Registrar Retiro'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Eliminar Miembro" size="lg">
                <div className="space-y-6">
                    {/* Member Info with Balance */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <strong>Miembro:</strong> {member.fullName} ({member.memberCode})
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                            <strong>Saldo actual:</strong> {formatCurrency(parseFloat(member.savingsBalance) || 0)}
                        </p>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-red-700">
                                <p className="font-semibold mb-2">¿Estás seguro de que deseas ELIMINAR a {member.fullName}?</p>
                                <p>Esta acción iniciará el proceso de liquidación por retiro del miembro.</p>
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
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Liquidación de la cuenta de ahorros</li>
                                    <li>Desactivación del miembro y su usuario</li>
                                    <li>Generación de recibo de liquidación</li>
                                </ul>
                                <p className="mt-2 font-semibold text-red-700">Esta acción NO se puede deshacer.</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={() => setShowDeleteModal(false)}
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleContinueToLiquidation}
                            variant="primary"
                            className="w-full sm:w-auto"
                        >
                            Continuar
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
                title={receiptData?.transactionType === 'deposit' ? 'Recibo de Depósito' : 'Recibo de Retiro'}
                printTitle={`Recibo - ${member?.fullName || ''}`}
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

            {/* Preview Styles - Responsive */}
            <style>{`
                .member-card-preview-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    padding: 10px;
                    overflow: hidden;
                }

                .member-card-preview-wrapper {
                    transform-origin: center center;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                /* Scale down on smaller screens */
                @media (max-width: 480px) {
                    .member-card-preview-wrapper {
                        transform: scale(0.75);
                    }
                }

                @media (min-width: 481px) and (max-width: 640px) {
                    .member-card-preview-wrapper {
                        transform: scale(0.85);
                    }
                }

                @media (min-width: 641px) and (max-width: 768px) {
                    .member-card-preview-wrapper {
                        transform: scale(0.9);
                    }
                }

                @media (min-width: 769px) {
                    .member-card-preview-wrapper {
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default MemberDetailPage;