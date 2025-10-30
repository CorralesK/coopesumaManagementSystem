/**
 * @file UserDetailPage.jsx
 * @description Page for displaying detailed user information
 * @module pages/users
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser, useUserOperations } from '../../hooks/useUsers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { USER_ROLES } from '../../utils/constants';

/**
 * UserDetailPage Component
 * Shows comprehensive user information
 */
const UserDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [successMessage, setSuccessMessage] = useState('');

    // Use custom hooks
    const { user, loading, error, refetch } = useUser(id);
    const { activate, deactivate, loading: operating } = useUserOperations();

    // Get role label
    const getRoleLabel = (role) => {
        const roleLabels = {
            [USER_ROLES.ADMINISTRATOR]: 'Administrador',
            [USER_ROLES.REGISTRAR]: 'Registrador',
            [USER_ROLES.TREASURER]: 'Tesorero',
            [USER_ROLES.STUDENT]: 'Estudiante'
        };
        return roleLabels[role] || role;
    };

    // Get role badge config
    const getRoleBadgeConfig = (role) => {
        const roleConfig = {
            [USER_ROLES.ADMINISTRATOR]: { class: 'bg-purple-100 text-purple-800 border-purple-200' },
            [USER_ROLES.REGISTRAR]: { class: 'bg-primary-100 text-primary-800 border-primary-200' },
            [USER_ROLES.TREASURER]: { class: 'bg-green-100 text-green-800 border-green-200' },
            [USER_ROLES.STUDENT]: { class: 'bg-gray-100 text-gray-800 border-gray-200' }
        };
        return roleConfig[role] || { class: 'bg-gray-100 text-gray-800 border-gray-200' };
    };

    // Event handlers
    const handleActivate = async () => {
        if (!window.confirm('¿Activar este usuario? Podrá acceder al sistema.')) {
            return;
        }

        try {
            await activate(id);
            setSuccessMessage('Usuario activado exitosamente');
            refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm('¿Desactivar este usuario? No podrá acceder al sistema.')) {
            return;
        }

        try {
            await deactivate(id);
            setSuccessMessage('Usuario desactivado exitosamente');
            refetch();
        } catch (err) {
            // Error handled by hook
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
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                                    {user.role === USER_ROLES.TREASURER && (
                                        <p>Acceso a reportes financieros y estadísticas de asistencia.</p>
                                    )}
                                    {user.role === USER_ROLES.STUDENT && (
                                        <p>Acceso limitado para consultar su propia información de asistencia.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Acciones">
                        <div className="space-y-3">
                            {user.isActive ? (
                                <Button
                                    onClick={handleDeactivate}
                                    variant="secondary"
                                    fullWidth
                                    disabled={operating}
                                    className="group hover:bg-gray-700 transition-all"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {operating ? 'Desactivando...' : 'Desactivar Usuario'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleActivate}
                                    variant="success"
                                    fullWidth
                                    disabled={operating}
                                    className="group transition-all"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {operating ? 'Activando...' : 'Activar Usuario'}
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPage;
