/**
 * @file AssembliesListPage.jsx
 * @description Page for displaying and managing assemblies
 * @module pages/assemblies
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssemblies, useAssemblyOperations } from '../../hooks/useAssemblies';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

/**
 * AssembliesListPage Component
 * Displays paginated list of assemblies with management actions
 */
const AssembliesListPage = () => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showConcludeModal, setShowConcludeModal] = useState(false);
    const [assemblyToComplete, setAssemblyToComplete] = useState(null);
    const itemsPerPage = 10;

    // Use custom hooks - fetch all assemblies for client-side filtering
    const { assemblies: allAssemblies, loading, error, refetch } = useAssemblies({ limit: 100 });
    const { activate, deactivate, loading: operating } = useAssemblyOperations();

    // Filter assemblies based on search term
    const filteredAssemblies = useMemo(() => {
        if (!searchTerm.trim()) return allAssemblies;

        const search = searchTerm.toLowerCase();
        return allAssemblies.filter(assembly =>
            assembly.title?.toLowerCase().includes(search) ||
            new Date(assembly.scheduledDate).toLocaleDateString('es-CR').includes(search)
        );
    }, [allAssemblies, searchTerm]);

    // Paginate filtered results
    const totalPages = Math.ceil(filteredAssemblies.length / itemsPerPage);
    const paginatedAssemblies = filteredAssemblies.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when search changes
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Check if there's an active assembly
    const hasActiveAssembly = allAssemblies.some(assembly => assembly.isActive);

    const handleStartAssembly = async (assemblyId) => {
        try {
            await activate(assemblyId);
            setSuccessMessage('Asamblea iniciada exitosamente');
            await refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleConcludeClick = (assembly) => {
        setAssemblyToComplete(assembly);
        setShowConcludeModal(true);
    };

    const handleConcludeConfirm = async () => {
        if (!assemblyToComplete) return;

        try {
            await deactivate(assemblyToComplete.assemblyId);
            // Refetch to get updated data with attendance_count
            await refetch();
            setSuccessMessage('Asamblea concluida exitosamente');
            setShowConcludeModal(false);
            setAssemblyToComplete(null);
        } catch (err) {
            // Error handled by hook
            setShowConcludeModal(false);
            setAssemblyToComplete(null);
        }
    };

    const handleConcludeCancel = () => {
        setShowConcludeModal(false);
        setAssemblyToComplete(null);
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
                                onClick={() => handleConcludeClick(assembly)}
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

    if (loading && allAssemblies.length === 0) {
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

            {/* Filters */}
            <Card title="Filtros de Búsqueda">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Buscar"
                        name="search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onClear={() => handleSearchChange('')}
                        placeholder="Nombre de asamblea o fecha..."
                    />
                </div>
            </Card>

            {/* Assemblies Table */}
            <Card padding="none">
                {loading ? (
                    <div className="py-8">
                        <Loading message="Cargando..." />
                    </div>
                ) : (
                    <>
                        <Table
                            columns={tableColumns}
                            data={paginatedAssemblies}
                            emptyMessage="No se encontraron asambleas"
                            isRowActive={(assembly) => assembly.isActive}
                        />
                        {totalPages > 1 && (
                            <div className="px-6 py-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Conclude Assembly Confirmation Modal */}
            {assemblyToComplete && (
                <Modal isOpen={showConcludeModal} onClose={handleConcludeCancel} title="Concluir Asamblea" size="lg">
                    <div className="space-y-6">
                        {/* Assembly Info */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>Asamblea:</strong> {assemblyToComplete.title}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                                <strong>Fecha programada:</strong> {formatDate(assemblyToComplete.scheduledDate)}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                                <strong>Asistentes registrados:</strong> {assemblyToComplete.attendanceCount || assemblyToComplete.attendance_count || 0}
                            </p>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-yellow-700">
                                    <p className="font-semibold mb-2">¿Está seguro que desea concluir esta asamblea?</p>
                                    <p>Esta acción marcará la asamblea como finalizada y no se podrá deshacer.</p>
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
                                    <p className="font-semibold mb-1">Al concluir la asamblea:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Se registrará la fecha y hora de conclusión</li>
                                        <li>No se podrán registrar más asistencias</li>
                                        <li>La asamblea pasará a estado "Concluida"</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={handleConcludeCancel}
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={operating}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConcludeConfirm}
                                variant="primary"
                                className="w-full sm:w-auto"
                                disabled={operating}
                            >
                                Sí, Concluir Asamblea
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AssembliesListPage;