/**
 * @file AssembliesListPage.jsx
 * @description Page for displaying and managing assemblies
 * @module pages/assemblies
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssemblies, useAssemblyOperations } from '../../hooks/useAssemblies';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

/**
 * AssembliesListPage Component
 * Displays paginated list of assemblies with management actions
 */
const AssembliesListPage = () => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');

    // Use custom hooks
    const { assemblies, loading, error, pagination, setPage, refetch } = useAssemblies({ limit: 20 });
    const { activate, deactivate, remove, loading: operating } = useAssemblyOperations();

    // Event handlers
    const handleActivate = async (assemblyId) => {
        if (!window.confirm('¿Activar esta asamblea? La asamblea activa actual será desactivada.')) {
            return;
        }

        try {
            await activate(assemblyId);
            setSuccessMessage('Asamblea activada exitosamente');
            refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleDeactivate = async (assemblyId) => {
        if (!window.confirm('¿Desactivar esta asamblea?')) {
            return;
        }

        try {
            await deactivate(assemblyId);
            setSuccessMessage('Asamblea desactivada exitosamente');
            refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleDelete = async (assemblyId) => {
        if (!window.confirm('¿Eliminar esta asamblea? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await remove(assemblyId);
            setSuccessMessage('Asamblea eliminada exitosamente');
            refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    // Format date helper
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Table columns configuration
    const tableColumns = [
        {
            key: 'title',
            label: 'Título',
            render: (assembly) => (
                <div>
                    <p className="font-medium text-gray-900">{assembly.title}</p>
                    {assembly.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">{assembly.description}</p>
                    )}
                </div>
            )
        },
        {
            key: 'scheduledDate',
            label: 'Fecha Programada',
            render: (assembly) => formatDate(assembly.scheduledDate)
        },
        {
            key: 'location',
            label: 'Ubicación',
            render: (assembly) => assembly.location || 'No especificada'
        },
        {
            key: 'status',
            label: 'Estado',
            render: (assembly) => {
                const statusConfig = {
                    ACTIVE: { label: 'Activa', class: 'bg-green-100 text-green-800' },
                    SCHEDULED: { label: 'Programada', class: 'bg-blue-100 text-blue-800' },
                    COMPLETED: { label: 'Completada', class: 'bg-gray-100 text-gray-800' },
                    CANCELLED: { label: 'Cancelada', class: 'bg-red-100 text-red-800' }
                };
                const config = statusConfig[assembly.status] || { label: assembly.status, class: 'bg-gray-100 text-gray-800' };

                return (
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${config.class}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (assembly) => (
                <div className="inline-flex items-center justify-center gap-2 my-2">
                    <Button
                        onClick={() => navigate(`/assemblies/${assembly.assemblyId}`)}
                        variant="outline-gray"
                        size="sm"
                    >
                        Ver
                    </Button>
                    <Button
                        onClick={() => navigate(`/assemblies/${assembly.assemblyId}/edit`)}
                        variant="outline"
                        size="sm"
                    >
                        Editar
                    </Button>
                    {assembly.status === 'SCHEDULED' && (
                        <Button
                            onClick={() => handleActivate(assembly.assemblyId)}
                            variant="success"
                            size="sm"
                            disabled={operating}
                        >
                            Activar
                        </Button>
                    )}
                    {assembly.status === 'ACTIVE' && (
                        <Button
                            onClick={() => handleDeactivate(assembly.assemblyId)}
                            variant="warning"
                            size="sm"
                            disabled={operating}
                        >
                            Desactivar
                        </Button>
                    )}
                    {assembly.status === 'SCHEDULED' && (
                        <Button
                            onClick={() => handleDelete(assembly.assemblyId)}
                            variant="danger"
                            size="sm"
                            disabled={operating}
                        >
                            Eliminar
                        </Button>
                    )}
                </div>
            )
        }
    ];

    if (loading && assemblies.length === 0) {
        return <Loading message="Cargando asambleas..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Asambleas</h1>
                    <p className="text-gray-600 mt-1">
                        Total: {pagination.total} asamblea{pagination.total !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button onClick={() => navigate('/assemblies/new')} variant="primary" className="whitespace-nowrap">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nueva Asamblea
                </Button>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Assemblies Table */}
            <Card>
                {loading ? (
                    <Loading message="Cargando..." />
                ) : (
                    <>
                        <Table
                            columns={tableColumns}
                            data={assemblies}
                            emptyMessage="No se encontraron asambleas"
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
        </div>
    );
};

export default AssembliesListPage;
