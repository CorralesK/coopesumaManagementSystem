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
    // Check if there's an active assembly
    const hasActiveAssembly = assemblies.some(assembly => assembly.isActive);

    const handleStartAssembly = async (assemblyId) => {
        try {
            await activate(assemblyId);
            setSuccessMessage('Asamblea iniciada exitosamente');
            await refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleConcludeAssembly = async (assemblyId) => {
        if (!window.confirm('¿Concluir esta asamblea? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await deactivate(assemblyId);
            // Refetch to get updated data with attendance_count
            await refetch();
            setSuccessMessage('Asamblea concluida exitosamente');
        } catch (err) {
            // Error handled by hook
        }
    };

    // Check if assembly is concluded
    // An assembly is concluded if it has a concluded_at timestamp
    const isAssemblyConcluded = (assembly) => {
        return assembly.concludedAt !== null && assembly.concludedAt !== undefined;
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
            label: 'Asamblea',
            render: (assembly) => (
                <div className="text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                        <button
                            onClick={() => navigate(`/assemblies/${assembly.assemblyId}`)}
                            className="font-semibold text-sm sm:text-base text-primary-600 hover:text-primary-700 text-left break-words cursor-pointer"
                        >
                            {assembly.title}
                        </button>
                        {assembly.isActive && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 w-fit mt-1 sm:mt-0">
                                ● En curso
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'scheduledDate',
            label: 'Fecha',
            render: (assembly) => (
                <div className="text-gray-600 font-medium text-sm">
                    {formatDate(assembly.scheduledDate)}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (assembly) => {
                const isConcluded = isAssemblyConcluded(assembly);

                return (
                    <div className="flex items-center justify-center gap-2">
                        {!assembly.isActive && !isConcluded && (
                            <Button
                                onClick={() => handleStartAssembly(assembly.assemblyId)}
                                variant="primary"
                                size="sm"
                                disabled={operating || hasActiveAssembly}
                                className="!px-3 sm:!px-4"
                                title={hasActiveAssembly ? 'Ya hay una asamblea activa' : ''}
                            >
                                <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">Iniciar</span>
                            </Button>
                        )}

                        {assembly.isActive && (
                            <Button
                                onClick={() => handleConcludeAssembly(assembly.assemblyId)}
                                variant="secondary"
                                size="sm"
                                disabled={operating}
                                className="!px-3 sm:!px-4"
                            >
                                <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">Concluir</span>
                            </Button>
                        )}

                        {isConcluded && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                Concluida
                            </span>
                        )}
                    </div>
                );
            }
        }
    ];

    if (loading && assemblies.length === 0) {
        return <Loading message="Cargando asambleas..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Asambleas</h1>
                <Button onClick={() => navigate('/assemblies/new')} variant="primary" className="whitespace-nowrap w-full sm:w-auto">
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
            <Card padding="none">
                {loading ? (
                    <Loading message="Cargando..." />
                ) : (
                    <>
                        <Table
                            columns={tableColumns}
                            data={assemblies}
                            emptyMessage="No se encontraron asambleas"
                            isRowActive={(assembly) => assembly.isActive}
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
