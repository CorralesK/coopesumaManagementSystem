/**
 * @file UsersListPage.jsx
 * @description Page for displaying and managing system users
 * @module pages/users
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useUserOperations } from '../../hooks/useUsers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { USER_ROLES } from '../../utils/constants';

/**
 * UsersListPage Component
 * Displays paginated list of users with management actions
 */
const UsersListPage = () => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');

    // Use custom hooks
    const { users, loading, error, pagination, setPage, refetch } = useUsers({ limit: 20 });
    const { activate, deactivate, loading: operating } = useUserOperations();

    // Event handlers
    const handleActivate = async (userId) => {
        if (!window.confirm('¿Activar este usuario?')) {
            return;
        }

        try {
            await activate(userId);
            setSuccessMessage('Usuario activado exitosamente');
            refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleDeactivate = async (userId) => {
        if (!window.confirm('¿Desactivar este usuario? No podrá acceder al sistema.')) {
            return;
        }

        try {
            await deactivate(userId);
            setSuccessMessage('Usuario desactivado exitosamente');
            refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

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

    // Table columns configuration
    const tableColumns = [
        {
            key: 'fullName',
            label: 'Usuario',
            render: (user) => (
                <div className="text-left">
                    <div className="flex flex-col">
                        <button
                            onClick={() => navigate(`/users/${user.userId}`)}
                            className="font-semibold text-sm sm:text-base text-primary-600 hover:text-primary-700 text-left break-words cursor-pointer"
                        >
                            {user.fullName}
                        </button>
                        <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Rol',
            render: (user) => {
                const roleConfig = {
                    [USER_ROLES.ADMINISTRATOR]: { class: 'bg-purple-100 text-purple-800' },
                    [USER_ROLES.REGISTRAR]: { class: 'bg-primary-100 text-primary-800' },
                    [USER_ROLES.TREASURER]: { class: 'bg-green-100 text-green-800' },
                    [USER_ROLES.STUDENT]: { class: 'bg-gray-100 text-gray-800' }
                };
                const config = roleConfig[user.role] || { class: 'bg-gray-100 text-gray-800' };

                return (
                    <div className="text-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${config.class}`}>
                            {getRoleLabel(user.role)}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'status',
            label: 'Estado',
            render: (user) => (
                <div className="flex items-center justify-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (user) => (
                <div className="flex items-center justify-center gap-2">
                    {user.isActive ? (
                        <Button
                            onClick={() => handleDeactivate(user.userId)}
                            variant="secondary"
                            size="sm"
                            disabled={operating}
                            className="!px-3 sm:!px-4"
                        >
                            <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">Desactivar</span>
                        </Button>
                    ) : (
                        <Button
                            onClick={() => handleActivate(user.userId)}
                            variant="success"
                            size="sm"
                            disabled={operating}
                            className="!px-3 sm:!px-4"
                        >
                            <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="hidden sm:inline">Activar</span>
                        </Button>
                    )}
                </div>
            )
        }
    ];

    if (loading && users.length === 0) {
        return <Loading message="Cargando usuarios..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Usuarios del Sistema</h1>
                <Button onClick={() => navigate('/users/new')} variant="primary" className="whitespace-nowrap w-full sm:w-auto">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Agregar Usuario
                </Button>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Users Table */}
            <Card padding="none">
                {loading ? (
                    <div className="py-8">
                        <Loading message="Cargando usuarios..." />
                    </div>
                ) : (
                    <>
                        <Table
                            columns={tableColumns}
                            data={users}
                            emptyMessage="No se encontraron usuarios en el sistema"
                        />
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4">
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Info Card */}
            <Card title="Roles del Sistema">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                        <h4 className="font-semibold text-purple-900">Administrador</h4>
                        <p className="text-sm text-purple-700 mt-1">
                            Acceso completo al sistema. Puede gestionar miembros, asambleas, usuarios y reportes.
                        </p>
                    </div>
                    <div className="bg-primary-50 border-l-4 border-primary-500 p-4">
                        <h4 className="font-semibold text-primary-900">Registrador</h4>
                        <p className="text-sm text-primary-700 mt-1">
                            Puede registrar asistencia mediante escaneo de códigos QR durante asambleas.
                        </p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                        <h4 className="font-semibold text-green-900">Tesorero</h4>
                        <p className="text-sm text-green-700 mt-1">
                            Acceso a reportes financieros y estadísticas de asistencia.
                        </p>
                    </div>
                    <div className="bg-gray-50 border-l-4 border-gray-500 p-4">
                        <h4 className="font-semibold text-gray-900">Estudiante</h4>
                        <p className="text-sm text-gray-700 mt-1">
                            Acceso limitado para consultar su propia información de asistencia.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default UsersListPage;
