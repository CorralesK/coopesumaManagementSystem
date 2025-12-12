/**
 * @file UserDetailPage.jsx
 * @description Page for displaying detailed user information
 * @module pages/users
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useUser, useUserOperations } from '../../hooks/useUsers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import PrintModal from '../../components/common/PrintModal';
import LiquidationReceiptPrint from '../../components/print/LiquidationReceiptPrint';
import ConfirmDeleteUserModal from '../../components/users/ConfirmDeleteUserModal';
import { USER_ROLES } from '../../utils/constants';

/**
 * UserDetailPage Component
 * Shows comprehensive user information
 */
const UserDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Print modal state
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    // Use custom hooks
    const { user, loading, error, refetch } = useUser(id);
    const { deactivate, loading: operating } = useUserOperations();

    // Detect action=delete from URL and open delete modal automatically
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'delete' && user) {
            // Remove the action parameter from URL
            searchParams.delete('action');
            setSearchParams(searchParams, { replace: true });

            // Open delete modal
            setShowDeleteModal(true);
        }
    }, [user, searchParams, setSearchParams]);

    // Get role label
    const getRoleLabel = (role) => {
        const roleLabels = {
            [USER_ROLES.ADMINISTRATOR]: 'Administrador',
            [USER_ROLES.REGISTRAR]: 'Registrador',
            [USER_ROLES.MANAGER]: 'Tesorero',
            [USER_ROLES.MEMBER]: 'Miembro'
        };
        return roleLabels[role] || role;
    };

    // Get role badge config
    const getRoleBadgeConfig = (role) => {
        const roleConfig = {
            [USER_ROLES.ADMINISTRATOR]: { class: 'bg-purple-100 text-purple-800 border-purple-200' },
            [USER_ROLES.REGISTRAR]: { class: 'bg-primary-100 text-primary-800 border-primary-200' },
            [USER_ROLES.MANAGER]: { class: 'bg-green-100 text-green-800 border-green-200' },
            [USER_ROLES.MEMBER]: { class: 'bg-gray-100 text-gray-800 border-gray-200' }
        };
        return roleConfig[role] || { class: 'bg-gray-100 text-gray-800 border-gray-200' };
    };

    // Event handlers
    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    const handleContinueToLiquidation = () => {
        setShowDeleteModal(false);
        // Redirect to member detail page with delete action (same flow as deleting from members list)
        if (user?.memberId) {
            navigate(`/members/${user.memberId}?action=delete`);
        }
    };

    const handleConfirmDeleteNonMember = async () => {
        try {
            const response = await deactivate(id);

            // If there's receipt data, show print modal
            if (response?.receiptData) {
                setReceiptData(response.receiptData);
                setShowPrintModal(true);
            }

            setSuccessMessage('Usuario eliminado exitosamente');
            setShowDeleteModal(false);
            refetch();
        } catch (err) {
            // Error handled by hook
            setShowDeleteModal(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return <Loading message="Cargando información del usuario..." />;
    }

    if (!user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No se encontró el usuario</p>
                <Button onClick={() => navigate('/users')} variant="primary" className="mt-4">
                    Volver a la Lista
                </Button>
            </div>
        );
    }

    const roleBadgeConfig = getRoleBadgeConfig(user.role);

    return (
        <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-1 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Volver"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.fullName}</h1>
                    <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                            user.isActive
                                ? 'bg-green-100 text-green-600 border-green-200'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-600' : 'bg-gray-500'}`} style={{ marginRight: '0.5rem' }}></span>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                    </div>
                </div>
                <Button onClick={() => navigate(`/users/${id}/edit`)} variant="primary" className="w-full sm:w-auto">
                    Editar
                </Button>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - User Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Información del Usuario">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Info Simple */}
                            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.5rem' }}>
                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Correo Electrónico</dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{user.email}</dd>
                                </div>

                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Rol</dt>
                                    <dd style={{ marginBottom: 0 }}>
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${roleBadgeConfig.class}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Información Adicional">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '2rem' }}>
                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Fecha de Creación</dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{formatDate(user.createdAt)}</dd>
                                </div>

                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Última Actualización</dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{formatDate(user.updatedAt)}</dd>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Role Info & Actions */}
                <div className="space-y-6">
                    <Card title="Permisos del Rol">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">{getRoleLabel(user.role)}</h3>
                                <div className="text-sm text-gray-600 space-y-2">
                                    {user.role === USER_ROLES.ADMINISTRATOR && (
                                        <p>Acceso completo al sistema. Puede gestionar miembros, asambleas, usuarios y reportes.</p>
                                    )}
                                    {user.role === USER_ROLES.REGISTRAR && (
                                        <p>Puede registrar asistencia mediante escaneo de códigos QR durante asambleas.</p>
                                    )}
                                    {user.role === USER_ROLES.MANAGER && (
                                        <p>Acceso a toda la gestión financiera.</p>
                                    )}
                                    {user.role === USER_ROLES.MEMBER && (
                                        <p>Acceso limitado para consultar su propia información.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Acciones">
                        <div className="space-y-3">
                            {user.isActive ? (
                                <Button
                                    onClick={handleDeleteClick}
                                    variant="danger"
                                    fullWidth
                                    disabled={operating}
                                    className="group transition-all"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Eliminar Usuario
                                </Button>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                        <p className="text-sm text-gray-600 font-medium">Usuario Eliminado</p>
                                        <p className="text-xs text-gray-500 mt-1">Este usuario ha sido eliminado y no puede ser reactivado</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <ConfirmDeleteUserModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleConfirmDeleteNonMember}
                onContinueToLiquidation={handleContinueToLiquidation}
                userName={user?.fullName || ''}
                isLoading={operating}
                isMember={user?.role === USER_ROLES.MEMBER && !!user?.memberId}
            />

            {/* Print Liquidation Receipt Modal */}
            <PrintModal
                isOpen={showPrintModal}
                onClose={() => {
                    setShowPrintModal(false);
                    setReceiptData(null);
                }}
                title="Recibo de Liquidación"
                printTitle={`Recibo Liquidación - ${receiptData?.member?.fullName || ''}`}
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
                        receiptNumber={receiptData.receiptId}
                    />
                )}
            </PrintModal>
        </div>
    );
};

export default UserDetailPage;
