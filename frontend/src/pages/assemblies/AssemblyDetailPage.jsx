/**
 * @file AssemblyDetailPage.jsx
 * @description Page for displaying detailed assembly information
 * @module pages/assemblies
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssembly, useAssemblyOperations } from '../../hooks/useAssemblies';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

/**
 * AssemblyDetailPage Component
 * Shows comprehensive assembly information
 */
const AssemblyDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [successMessage, setSuccessMessage] = useState('');

    // Use custom hooks
    const { assembly, loading, error, refetch } = useAssembly(id);
    const { activate, deactivate, loading: operating } = useAssemblyOperations();

    // Event handlers
    const handleStartAssembly = async () => {
        if (!window.confirm('¿Iniciar esta asamblea? La asamblea activa actual será concluida automáticamente.')) {
            return;
        }

        try {
            await activate(id);
            setSuccessMessage('Asamblea iniciada exitosamente');
            await refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    const handleConcludeAssembly = async () => {
        if (!window.confirm('¿Concluir esta asamblea? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await deactivate(id);
            setSuccessMessage('Asamblea concluida exitosamente');
            await refetch();
        } catch (err) {
            // Error handled by hook
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

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        return timeString.substring(0, 5); // HH:MM
    };

    const isAssemblyConcluded = () => {
        if (!assembly) return false;
        if (assembly.isActive) return false;
        return assembly.attendanceCount > 0;
    };

    if (loading) {
        return <Loading message="Cargando información de la asamblea..." />;
    }

    if (!assembly) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No se encontró la asamblea</p>
                <Button onClick={() => navigate('/assemblies')} variant="primary" className="mt-4">
                    Volver a la Lista
                </Button>
            </div>
        );
    }

    const concluded = isAssemblyConcluded();

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Detalle de la Asamblea</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button onClick={() => navigate('/assemblies')} variant="outline" className="w-full sm:w-auto">
                        Volver
                    </Button>
                    {!concluded && (
                        <Button onClick={() => navigate(`/assemblies/${id}/edit`)} variant="primary" className="w-full sm:w-auto">
                            Editar
                        </Button>
                    )}
                </div>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Assembly Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Title and Status */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900" style={{ marginBottom: '0.5rem' }}>
                                    {assembly.title}
                                </h2>
                                {assembly.isActive && (
                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 border border-green-200">
                                        <span className="w-2 h-2 rounded-full bg-green-600" style={{ marginRight: '0.5rem' }}></span>
                                        <span className="text-green-600">En Curso</span>
                                    </span>
                                )}
                                {concluded && (
                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 border border-gray-200">
                                        <span className="w-2 h-2 rounded-full bg-gray-500" style={{ marginRight: '0.5rem' }}></span>
                                        <span className="text-gray-700">Concluida</span>
                                    </span>
                                )}
                                {!assembly.isActive && !concluded && (
                                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 border border-gray-200">
                                        <span className="w-2 h-2 rounded-full bg-gray-500" style={{ marginRight: '0.5rem' }}></span>
                                        <span className="text-gray-700">Pendiente</span>
                                    </span>
                                )}
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.5rem' }}>
                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>
                                        Fecha Programada
                                    </dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                        {formatDate(assembly.scheduledDate)}
                                    </dd>
                                </div>

                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>
                                        Asistentes
                                    </dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                        {assembly.attendanceCount || 0} registrados
                                    </dd>
                                </div>

                                {assembly.startTime && (
                                    <div className="pb-3 border-b border-gray-200">
                                        <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>
                                            Hora de Inicio
                                        </dt>
                                        <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                            {formatTime(assembly.startTime)}
                                        </dd>
                                    </div>
                                )}

                                {assembly.endTime && (
                                    <div className="pb-3 border-b border-gray-200">
                                        <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>
                                            Hora de Finalización
                                        </dt>
                                        <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                            {formatTime(assembly.endTime)}
                                        </dd>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card title="Información Adicional">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '2rem' }}>
                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>
                                        Fecha de Creación
                                    </dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                        {formatDate(assembly.createdAt)}
                                    </dd>
                                </div>

                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>
                                        Última Actualización
                                    </dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                        {formatDate(assembly.updatedAt)}
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                    <Card title="Acciones">
                        <div className="flex flex-col space-y-3">
                            {!assembly.isActive && !concluded && (
                                <Button
                                    onClick={handleStartAssembly}
                                    variant="primary"
                                    fullWidth
                                    disabled={operating}
                                    className="!px-4"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Iniciar Asamblea
                                </Button>
                            )}

                            {assembly.isActive && (
                                <Button
                                    onClick={handleConcludeAssembly}
                                    variant="secondary"
                                    fullWidth
                                    disabled={operating}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Concluir
                                </Button>
                            )}

                            {concluded && (
                                <div className="w-full mt-2 bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-semibold">Asamblea Concluida</span><br />
                                            Esta asamblea ya finalizó.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AssemblyDetailPage;
