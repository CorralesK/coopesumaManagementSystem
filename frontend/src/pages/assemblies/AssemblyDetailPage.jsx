/**
 * @file AssemblyDetailPage.jsx
 * @description Page for displaying detailed assembly information
 * @module pages/assemblies
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssembly, useAssemblyOperations, useActiveAssembly } from '../../hooks/useAssemblies';
import { getAttendanceByAssembly } from '../../services/attendanceService';
import { printAttendanceList } from '../../utils/printUtils';
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
    const { activeAssembly } = useActiveAssembly();
    const { activate, deactivate, loading: operating } = useAssemblyOperations();

    // Check if there's another active assembly
    const hasOtherActiveAssembly = activeAssembly && activeAssembly.assemblyId !== parseInt(id);

    // Event handlers
    const handleStartAssembly = async () => {
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
            // Refetch to get updated data with concluded_at
            await refetch();
            setSuccessMessage('Asamblea concluida exitosamente');
        } catch (err) {
            // Error handled by hook
        }
    };

    const handlePrintAttendanceList = async () => {
        try {
            const response = await getAttendanceByAssembly(id);
            const attendees = response.data || [];

            if (attendees.length === 0) {
                alert('No hay asistentes registrados para imprimir.');
                return;
            }

            printAttendanceList({
                attendees: attendees,
                assembly: assembly,
                title: 'Lista de Asistencia'
            });
        } catch (err) {
            alert('Error al obtener la lista de asistencia: ' + (err.message || 'Error desconocido'));
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
        const concludedAt = assembly.concludedAt || assembly.concluded_at;
        return concludedAt !== null && concludedAt !== undefined;
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
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{assembly.title}</h1>
                    <div className="mt-2 flex gap-2">
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
                </div>
                {!concluded && (
                    <Button onClick={() => navigate(`/assemblies/${id}/edit`)} variant="primary" className="w-full sm:w-auto">
                        Editar
                    </Button>
                )}
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
                                        {assembly.attendanceCount || assembly.attendance_count || 0} registrados
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Información Adicional">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '2rem' }}>
                                {(assembly.startTime || assembly.start_time) && (
                                    <div className="pb-3 border-b border-gray-200">
                                        <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>
                                            Hora de Inicio Real
                                        </dt>
                                        <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                            {formatTime(assembly.startTime || assembly.start_time)}
                                        </dd>
                                    </div>
                                )}

                                {(assembly.endTime || assembly.end_time) && (
                                    <div className="pb-3 border-b border-gray-200">
                                        <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>
                                            Hora de Finalización Real
                                        </dt>
                                        <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                            {formatTime(assembly.endTime || assembly.end_time)}
                                        </dd>
                                    </div>
                                )}

                                {(assembly.concludedAt || assembly.concluded_at) && (
                                    <div className="pb-3 border-b border-gray-200">
                                        <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>
                                            Fecha de Conclusión
                                        </dt>
                                        <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>
                                            {new Date(assembly.concludedAt || assembly.concluded_at).toLocaleDateString('es-CR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </dd>
                                    </div>
                                )}

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
                                <>
                                    <Button
                                        onClick={handleStartAssembly}
                                        variant="primary"
                                        fullWidth
                                        disabled={operating || hasOtherActiveAssembly}
                                        className="!px-4"
                                        title={hasOtherActiveAssembly ? 'Ya hay otra asamblea activa. Concluye la asamblea activa primero.' : ''}
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Iniciar Asamblea
                                    </Button>
                                    {hasOtherActiveAssembly && (
                                        <div className="w-full mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                                            <div className="flex items-start gap-2">
                                                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <p className="text-xs text-yellow-700">
                                                    <span className="font-semibold">Ya hay una asamblea activa</span><br />
                                                    Debes concluir la asamblea activa antes de iniciar esta.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {assembly.isActive && (
                                <>
                                    <Button
                                        onClick={() => navigate('/attendance/scan')}
                                        variant="primary"
                                        fullWidth
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                        Registrar Asistencia
                                    </Button>

                                    <Button
                                        onClick={handleConcludeAssembly}
                                        variant="secondary"
                                        fullWidth
                                        disabled={operating}
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Concluir
                                    </Button>

                                    <Button
                                        onClick={handlePrintAttendanceList}
                                        variant="outline"
                                        fullWidth
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Imprimir Lista de Asistencia
                                    </Button>
                                </>
                            )}

                            {concluded && (
                                <>
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

                                    <Button
                                        onClick={handlePrintAttendanceList}
                                        variant="outline"
                                        fullWidth
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        Imprimir Lista de Asistencia
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AssemblyDetailPage;
