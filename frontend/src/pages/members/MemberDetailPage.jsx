/**
 * @file MemberDetailPage.jsx
 * @description Page for displaying detailed member information with QR code
 * @module pages/members
 */

import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMember, useMemberOperations } from '../../hooks/useMembers';
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
import { printSavingsReceipt } from '../../utils/printUtils';
import api from '../../services/api';

/**
 * MemberDetailPage Component
 * Shows comprehensive member information including QR code
 */
const MemberDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
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

    // Use custom hooks
    const { member, loading, error, refetch } = useMember(id);
    const { regenerateQR, deactivate, loading: regenerating, error: regenerateError } = useMemberOperations();

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

    const handleDeleteMember = async () => {
        const confirmed = window.confirm(
            `¿Estás seguro de que deseas ELIMINAR a ${member.fullName}?\n\n` +
            `Esta acción iniciará el proceso de liquidación por retiro del miembro.\n` +
            `Esta acción no se puede deshacer.`
        );

        if (!confirmed) {
            return;
        }

        try {
            await deactivate(id);
            setSuccessMessage('Miembro eliminado. Proceso de liquidación iniciado.');
            refetch();
        } catch (err) {
            // Error handled by hook
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

            // Print receipt after successful transaction
            printSavingsReceipt({
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

            setSuccessMessage('Depósito registrado exitosamente. Imprimiendo recibo...');
            setShowDepositModal(false);
            setDepositData({ amount: '', description: '' });
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

            // Print receipt after successful transaction
            printSavingsReceipt({
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

            setSuccessMessage('Retiro registrado exitosamente. Imprimiendo recibo...');
            setShowWithdrawalModal(false);
            setWithdrawalData({ amount: '', description: '' });
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Detalle del Miembro</h1>
                <Button onClick={() => navigate(`/members/${id}/edit`)} variant="primary" className="w-full sm:w-auto">Editar</Button>
            </div>

            {/* Alerts */}
            {(error || regenerateError || errorMessage) && <Alert type="error" message={error || regenerateError || errorMessage} onClose={() => setErrorMessage('')} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 gap-6">
                {/* Left Column - Member Info */}
                <div className="lg:col-span-3 xl:col-span-3 space-y-6">
                    <Card>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {/* Photo */}
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
                <div className="lg:col-span-2 xl:col-span-1 space-y-6">
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

                            {/* Action Buttons */}
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

                    {/* Actions Card */}
                    <Card title="Acciones">
                        <div className="flex flex-col space-y-3">
                            {member.isActive ? (
                                <>
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
                                </>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    <p className="text-sm text-gray-600 font-medium">Miembro Inactivo</p>
                                    <p className="text-xs text-gray-500 mt-1">No hay acciones disponibles</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
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
                <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title={`Carnet - ${member.fullName}`} size="lg">
                    <div className="flex flex-col items-center">
                        <div id="printable-card" className="member-card-display">
                            <MemberCard member={member} showCutLines={true} />
                        </div>
                        <div className="mt-6 flex space-x-3 print-hide">
                            <Button onClick={() => setQrModalOpen(false)} variant="outline">Cerrar</Button>
                            <Button onClick={() => window.print()} variant="primary">Imprimir Carnet</Button>
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
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">₡</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={depositData.amount}
                                onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        {parseFloat(member.savingsBalance) <= 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-xs font-medium bg-orange-200 text-orange-800">
                                Sin saldo disponible
                            </span>
                        )}
                    </div>

                    {parseFloat(member.savingsBalance) <= 0 && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm text-orange-800">
                                    Este miembro <strong>no tiene saldo disponible</strong> para realizar retiros.
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monto del Retiro *</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">₡</span>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={parseFloat(member.savingsBalance) || 0}
                                value={withdrawalData.amount}
                                onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        <Button type="submit" variant="danger" disabled={submitting}>
                            {submitting ? 'Procesando...' : 'Registrar Retiro'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Print Styles */}
            <style>{`
                .member-card-display {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }

                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #printable-card,
                    #printable-card * {
                        visibility: visible;
                    }

                    #printable-card {
                        position: fixed;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        margin: 0;
                        padding: 0;
                    }

                    .print-hide {
                        display: none !important;
                    }

                    .member-card-display {
                        padding: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default MemberDetailPage;