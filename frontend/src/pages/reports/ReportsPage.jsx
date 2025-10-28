/**
 * @file ReportsPage.jsx
 * @description Page for generating reports and viewing statistics
 * @module pages/reports
 */

import React, { useState, useEffect } from 'react';
import { useAssemblies } from '../../hooks/useAssemblies';
import { useReports, useReportStats } from '../../hooks/useReports';
import { getAttendanceByAssembly } from '../../services/attendanceService';
import { printAttendanceList } from '../../utils/printUtils';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

/**
 * ReportsPage Component
 * Handles report generation and statistics visualization
 */
const ReportsPage = () => {
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedAssembly, setSelectedAssembly] = useState('');

    // Use custom hooks
    const { assemblies, loading: loadingAssemblies } = useAssemblies({ limit: 100 });
    const { generateAttendanceReport, exportData, loading: generating, error: reportError } = useReports();
    const { getMemberStats, getAttendanceByGrade, loading: loadingStats } = useReportStats();

    const [memberStats, setMemberStats] = useState(null);
    const [gradeStats, setGradeStats] = useState(null);

    // Load statistics on mount
    useEffect(() => {
        const loadStats = async () => {
            try {
                const [members, grades] = await Promise.all([
                    getMemberStats(),
                    getAttendanceByGrade()
                ]);
                setMemberStats(members);
                setGradeStats(grades);
            } catch (err) {
                // Error handled by hook
            }
        };
        loadStats();
    }, []);

    // Handle report generation
    const handleGenerateAttendanceReport = async () => {
        if (!selectedAssembly) {
            alert('Por favor selecciona una asamblea');
            return;
        }

        try {
            // Get attendance data for the selected assembly
            const response = await getAttendanceByAssembly(selectedAssembly);

            // Extract the actual data array (response.data.data or response.data)
            const attendanceData = response.data?.data || response.data;

            // Find the selected assembly details (convert to number for comparison)
            const assembly = assemblies.find(a => a.assemblyId === parseInt(selectedAssembly));

            if (!attendanceData || attendanceData.length === 0) {
                alert('No hay asistentes registrados para esta asamblea');
                return;
            }

            if (!assembly) {
                alert('No se encontró información de la asamblea');
                return;
            }

            // Use the print utility to generate and print the report
            printAttendanceList({
                attendees: attendanceData,
                assembly: assembly,
                title: 'Lista de Asistencia'
            });

            setSuccessMessage('Reporte generado y abierto para impresión');
        } catch (err) {
            console.error('Error generating report:', err);
            alert(err.message || 'Error al generar el reporte');
        }
    };

    // Handle data export
    const handleExportData = async (dataType) => {
        try {
            await exportData(dataType);
            setSuccessMessage(`Datos de ${dataType} exportados exitosamente`);
        } catch (err) {
            // Error handled by hook
        }
    };

    // Assembly options for select
    const assemblyOptions = assemblies.map(assembly => ({
        value: assembly.assemblyId,
        label: `${assembly.title} - ${new Date(assembly.scheduledDate).toLocaleDateString('es-CR')}`
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                <p className="text-gray-600 mt-1">Genera reportes de asistencia y consulta estadísticas del sistema</p>
            </div>

            {/* Alerts */}
            {reportError && <Alert type="error" message={reportError} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Report Generation Section */}
            <Card title="Generar Reporte de Asistencia (PDF)">
                <div className="space-y-4">
                    <Select
                        label="Seleccionar Asamblea"
                        value={selectedAssembly}
                        onChange={(e) => setSelectedAssembly(e.target.value)}
                        options={assemblyOptions}
                        disabled={loadingAssemblies}
                    />

                    <div className="bg-primary-50 border-l-4 border-primary-500 p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-primary-700">
                                <p className="font-semibold mb-1">Información del Reporte:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>El reporte incluye listado completo de asistentes</li>
                                    <li>Muestra nombre completo e identificación</li>
                                    <li>Incluye información de la asamblea</li>
                                    <li>Columna de firma en blanco para firmas físicas</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleGenerateAttendanceReport}
                            variant="primary"
                            disabled={!selectedAssembly || generating}
                        >
                            {generating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Generar e Imprimir Reporte
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Statistics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Statistics */}
                <Card title="Estadísticas de Miembros">
                    {loadingStats ? (
                        <Loading message="Cargando estadísticas..." />
                    ) : memberStats ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-primary-50 p-4 rounded-lg">
                                    <p className="text-sm text-primary-600 font-medium">Total Miembros</p>
                                    <p className="text-3xl font-bold text-primary-900">{memberStats.totalMembers || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-green-600 font-medium">Miembros Activos</p>
                                    <p className="text-3xl font-bold text-green-900">{memberStats.activeMembers || 0}</p>
                                </div>
                            </div>
                            {memberStats.byGrade && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Distribución por Grado</h4>
                                    <div className="space-y-2">
                                        {Object.entries(memberStats.byGrade).map(([grade, count]) => (
                                            <div key={grade} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Grado {grade}°</span>
                                                <span className="text-sm font-semibold text-gray-900">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No hay estadísticas disponibles</p>
                    )}
                </Card>

                {/* Attendance by Grade */}
                <Card title="Asistencia por Grado">
                    {loadingStats ? (
                        <Loading message="Cargando estadísticas..." />
                    ) : gradeStats ? (
                        <div className="space-y-3">
                            {gradeStats.map((stat) => (
                                <div key={stat.grade} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">Grado {stat.grade}°</span>
                                        <span className="text-sm text-gray-600">{stat.attendanceRate || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full"
                                            style={{ width: `${stat.attendanceRate || 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {stat.presentCount || 0} de {stat.totalMembers || 0} miembros
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No hay estadísticas disponibles</p>
                    )}
                </Card>
            </div>

            {/* Export Data Section */}
            <Card title="Exportar Datos">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Miembros</h4>
                        <p className="text-sm text-gray-600 mb-3">Exportar lista completa de miembros con toda su información</p>
                        <Button
                            onClick={() => handleExportData('members')}
                            variant="outline"
                            size="sm"
                            fullWidth
                            disabled={generating}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exportar Excel
                        </Button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Asambleas</h4>
                        <p className="text-sm text-gray-600 mb-3">Exportar historial de asambleas realizadas</p>
                        <Button
                            onClick={() => handleExportData('assemblies')}
                            variant="outline"
                            size="sm"
                            fullWidth
                            disabled={generating}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exportar Excel
                        </Button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Asistencias</h4>
                        <p className="text-sm text-gray-600 mb-3">Exportar registros completos de asistencia</p>
                        <Button
                            onClick={() => handleExportData('attendance')}
                            variant="outline"
                            size="sm"
                            fullWidth
                            disabled={generating}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exportar Excel
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReportsPage;
