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

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
            label: 'Nombre Completo',
            render: (user) => (
                <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Rol',
            render: (user) => {
                const roleConfig = {
                    [USER_ROLES.ADMINISTRATOR]: { class: 'bg-purple-100 text-purple-800' },
                    [USER_ROLES.REGISTRAR]: { class: 'bg-blue-100 text-blue-800' },
                    [USER_ROLES.TREASURER]: { class: 'bg-green-100 text-green-800' },
                    [USER_ROLES.STUDENT]: { class: 'bg-gray-100 text-gray-800' }
                };
                const config = roleConfig[user.role] || { class: 'bg-gray-100 text-gray-800' };

                return (
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${config.class}`}>
                        {getRoleLabel(user.role)}
                    </span>
                );
            }
        },
        {
            key: 'status',
            label: 'Estado',
            render: (user) => (
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
        {
            key: 'lastLogin',
            label: 'Último Acceso',
            render: (user) => (
                <div className="text-sm text-gray-600">
                    {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (user) => (
                <div className="inline-flex items-center justify-center gap-2 my-2">
                    <Button
                        onClick={() => navigate(`/users/${user.userId}/edit`)}
                        variant="outline"
                        size="sm"
                    >
                        Editar
                    </Button>
                    {user.isActive ? (
                        <Button
                            onClick={() => handleDeactivate(user.userId)}
                            variant="danger"
                            size="sm"
                            disabled={operating}
                        >
                            Desactivar
                        </Button>
                    ) : (
                        <Button
                            onClick={() => handleActivate(user.userId)}
                            variant="success"
                            size="sm"
                            disabled={operating}
                        >
                            Activar
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-gray-600 mt-1">
                        Total: {pagination.total} usuario{pagination.total !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button onClick={() => navigate('/users/new')} variant="primary" className="whitespace-nowrap">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nuevo Usuario
                </Button>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Users Table */}
            <Card>
                {loading ? (
                    <Loading message="Cargando..." />
                ) : (
                    <>
                        <Table
                            columns={tableColumns}
                            data={users}
                            emptyMessage="No se encontraron usuarios"
                        />
                        {pagination.totalPages > 1 && (
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={setPage}
                            />
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
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <h4 className="font-semibold text-blue-900">Registrador</h4>
                        <p className="text-sm text-blue-700 mt-1">
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
