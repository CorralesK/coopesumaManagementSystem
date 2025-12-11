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
import ClearFiltersButton from '../../components/common/ClearFiltersButton';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { USER_ROLES } from '../../utils/constants';

/**
 * UsersListPage Component
 * Displays a paginated list of users with filtering capabilities
 */
const UsersListPage = () => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        role: '',
        isActive: '',
    });

    // Use custom hooks for user management
    const {
        users,
        loading,
        error,
        pagination,
        setPage,
        refetch
    } = useUsers({ ...filters, limit: 20 });

    const { deactivate, loading: operationLoading } = useUserOperations();

    // Event handlers
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            role: '',
            isActive: '',
        });
    };

    const handleToggleUserStatus = async (userId, isActive, userName, userRole, memberId) => {
        // Solo permitir desactivar (eliminar), no reactivar
        if (!isActive) {
            return; // Los usuarios inactivos no se pueden reactivar
        }

        // Navigate to detail page with delete action
        navigate(`/users/${userId}?action=delete`);
    };

    // Table columns configuration
    const tableColumns = [
        {
            key: 'fullName',
            label: 'Nombre',
            render: (user) => (
                <div className="text-left">
                    <button
                        onClick={() => navigate(`/users/${user.userId}`)}
                        className="font-semibold text-sm sm:text-base text-primary-600 hover:text-primary-700 text-left break-words cursor-pointer"
                    >
                        {user.fullName}
                    </button>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Correo Electrónico',
            render: (user) => (
                <div className="text-left text-sm text-gray-600">
                    {user.email || '-'}
                </div>
            ),
        },
        {
            key: 'role',
            label: 'Rol',
            render: (user) => {
                const roleLabels = {
                    administrator: 'Administrador',
                    registrar: 'Registrador',
                    manager: 'Tesorero',
                    member: 'Miembro'
                };
                return (
                    <div className="text-left">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {roleLabels[user.role] || user.role}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'isActive',
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
                    {user.isActive && (
                        <Button
                            onClick={() => handleToggleUserStatus(user.userId, user.isActive, user.fullName, user.role, user.memberId)}
                            variant="danger"
                            size="sm"
                            disabled={operationLoading}
                            className="!px-2 sm:!px-3"
                        >
                            <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Eliminar</span>
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const roleOptions = [
        { value: '', label: 'Todos los roles' },
        { value: 'administrator', label: 'Administrador' },
        { value: 'registrar', label: 'Registrador' },
        { value: 'manager', label: 'Tesorero' },
        { value: 'member', label: 'Miembro' }
    ];

    const statusOptions = [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
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

            {/* Filters and Table Container */}
            <div className="space-y-0">
                {/* Filters */}
                <Card title="Filtros de Búsqueda">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Buscar"
                            name="search"
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            onClear={() => handleFilterChange('search', '')}
                            placeholder="Nombre o correo..."
                        />
                        <Select
                            label="Rol"
                            name="role"
                            value={filters.role}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            options={roleOptions}
                            placeholder=""
                        />
                        <Select
                            label="Estado"
                            name="isActive"
                            value={filters.isActive}
                            onChange={(e) => handleFilterChange('isActive', e.target.value)}
                            options={statusOptions}
                            placeholder=""
                        />
                    </div>
                    <div className="mt-6">
                        <ClearFiltersButton
                            show={filters.search || filters.role || filters.isActive}
                            onClick={handleResetFilters}
                        />
                    </div>
                </Card>

                {/* Users Table */}
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
                                    data={users}
                                    emptyMessage="No se encontraron usuarios"
                                />
                            </div>
                            <div className="px-4 py-3">
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    onPageChange={setPage}
                                />
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default UsersListPage;
