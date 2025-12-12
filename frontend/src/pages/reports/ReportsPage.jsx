/**
 * @file ReportsPage.jsx
 * @description Page for generating reports and viewing statistics
 * @module pages/reports
 */

import React, { useState, useEffect } from 'react';
import { useAssemblies } from '../../hooks/useAssemblies';
import { useReports, useReportStats } from '../../hooks/useReports';
import { getAttendanceByAssembly } from '../../services/attendanceService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import LiquidationsReport from '../../components/reports/LiquidationsReport';
import PrintModal from '../../components/common/PrintModal';
import AttendanceListPrint from '../../components/print/AttendanceListPrint';

/**
 * ReportsPage Component
 * Handles report generation and statistics visualization
 */
const ReportsPage = () => {
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedAssembly, setSelectedAssembly] = useState('');
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [attendeesForPrint, setAttendeesForPrint] = useState([]);
    const [assemblyForPrint, setAssemblyForPrint] = useState(null);

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
                alert('No se encontro informacion de la asamblea');
                return;
            }

            // Open print modal instead of popup
            setAttendeesForPrint(attendanceData);
            setAssemblyForPrint(assembly);
            setShowPrintModal(true);
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
            <div className="pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Genera reportes de asistencia y consulta estadísticas del sistema</p>
            </div>

            {/* Alerts */}
            {reportError && <Alert type="error" message={reportError} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Report Generation Section */}
            <Card title="Generar Reporte de Asistencia">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <Select
                            label="Seleccionar Asamblea"
                            value={selectedAssembly}
                            onChange={(e) => setSelectedAssembly(e.target.value)}
                            options={assemblyOptions}
                            disabled={loadingAssemblies}
                        />
                    </div>

                    <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
                        <div className="flex">
                            <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="text-sm text-primary-700">
                                <p className="font-semibold mb-2">Información del Reporte:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Incluye listado completo de asistentes con nombre e identificación</li>
                                    <li>Muestra información detallada de la asamblea</li>
                                    <li>Contiene columna de firma para registro físico</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            onClick={handleGenerateAttendanceReport}
                            variant="primary"
                            disabled={!selectedAssembly || generating}
                            className="w-full sm:w-auto"
                        >
                            {generating ? (
                                <>
                                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
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
                                    Generar e Imprimir
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
                        <div className="py-8">
                            <Loading message="Cargando estadísticas..." />
                        </div>
                    ) : memberStats ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-primary-50 p-5 rounded-lg border border-primary-100">
                                    <p className="text-sm text-primary-600 font-semibold mb-1">Total</p>
                                    <p className="text-3xl font-bold text-primary-900">{memberStats.totalMembers || 0}</p>
                                </div>
                                <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                                    <p className="text-sm text-green-600 font-semibold mb-1">Activos</p>
                                    <p className="text-3xl font-bold text-green-900">{memberStats.activeMembers || 0}</p>
                                </div>
                            </div>
                            {memberStats.byQuality && Object.keys(memberStats.byQuality).length > 0 && (
                                <div className="pt-2 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Distribución por Calidad</h4>
                                    <div className="space-y-2">
                                        {Object.entries(memberStats.byQuality).map(([quality, count]) => (
                                            <div key={quality} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                                                <span className="text-sm font-medium text-gray-700">{quality}</span>
                                                <span className="text-sm font-bold text-gray-900">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">No hay estadísticas disponibles</p>
                        </div>
                    )}
                </Card>

                {/* Attendance by Quality/Level */}
                <Card title="Asistencia por Calidad / Nivel">
                    {loadingStats ? (
                        <div className="py-8">
                            <Loading message="Cargando estadísticas..." />
                        </div>
                    ) : gradeStats && gradeStats.length > 0 ? (
                        <div className="space-y-4">
                            {gradeStats.map((stat, index) => (
                                <div key={stat.qualityName ? `${stat.qualityName}-${stat.levelName || 'all'}` : index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900">
                                            {stat.qualityName || stat.grade || 'Sin clasificar'}
                                            {stat.levelName && ` - ${stat.levelName}`}
                                        </span>
                                        <span className="text-sm font-bold text-primary-600">{stat.attendanceRate || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                        <div
                                            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${stat.attendanceRate || 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        {stat.presentCount || 0} de {stat.totalMembers || 0} miembros
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">No hay estadísticas disponibles</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Liquidations Report Section */}
            <LiquidationsReport />

            {/* Export Data Section */}
            <Card title="Exportar Datos a Excel">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors duration-200">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1">Miembros</h4>
                                <p className="text-sm text-gray-600">Lista completa con información detallada</p>
                            </div>
                        </div>
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
                            Descargar
                        </Button>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors duration-200">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1">Asambleas</h4>
                                <p className="text-sm text-gray-600">Historial completo de asambleas</p>
                            </div>
                        </div>
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
                            Descargar
                        </Button>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors duration-200">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 mb-1">Asistencias</h4>
                                <p className="text-sm text-gray-600">Registros completos de asistencia</p>
                            </div>
                        </div>
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
                            Descargar
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Print Attendance List Modal */}
            <PrintModal
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                title="Lista de Asistencia"
                printTitle={`Lista de Asistencia - ${assemblyForPrint?.title || ''}`}
                size="xl"
                orientation="portrait"
                paperSize="letter"
            >
                <AttendanceListPrint
                    attendees={attendeesForPrint}
                    assembly={assemblyForPrint}
                    title="Lista de Asistencia"
                />
            </PrintModal>
        </div>
    );
};

export default ReportsPage;
