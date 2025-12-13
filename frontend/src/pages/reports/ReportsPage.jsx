/**
 * @file ReportsPage.jsx
 * @description Page for generating and printing reports
 * @module pages/reports
 */

import { useState } from 'react';
import { useAssemblies } from '../../hooks/useAssemblies';
import { getAttendanceByAssembly } from '../../services/attendanceService';
import { getLiquidationHistory } from '../../services/liquidationService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import { printAttendanceListReport, printLiquidationsReport } from '../../utils/printUtils';

/**
 * ReportsPage Component
 * Simplified reports page with attendance and liquidations reports
 */
const ReportsPage = () => {
    // Attendance report state
    const [selectedAssembly, setSelectedAssembly] = useState('');
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [attendanceError, setAttendanceError] = useState(null);

    // Liquidations report state
    const [liquidationFilters, setLiquidationFilters] = useState({
        startDate: '',
        endDate: '',
        liquidationType: ''
    });
    const [loadingLiquidations, setLoadingLiquidations] = useState(false);
    const [liquidationError, setLiquidationError] = useState(null);

    // Fetch assemblies
    const { assemblies, loading: loadingAssemblies } = useAssemblies({ limit: 100 });

    // Assembly options for select
    const assemblyOptions = assemblies.map(assembly => ({
        value: assembly.assemblyId,
        label: `${assembly.title} - ${new Date(assembly.scheduledDate).toLocaleDateString('es-CR')}`
    }));

    // Handle attendance report generation
    const handleGenerateAttendanceReport = async () => {
        if (!selectedAssembly) {
            setAttendanceError('Por favor selecciona una asamblea');
            return;
        }

        try {
            setLoadingAttendance(true);
            setAttendanceError(null);

            const response = await getAttendanceByAssembly(selectedAssembly);
            const attendanceData = response.data || [];
            const assembly = assemblies.find(a => a.assemblyId === parseInt(selectedAssembly));

            if (!attendanceData || attendanceData.length === 0) {
                setAttendanceError('No hay asistentes registrados para esta asamblea');
                return;
            }

            if (!assembly) {
                setAttendanceError('No se encontro informacion de la asamblea');
                return;
            }

            // Open print window directly
            printAttendanceListReport({
                attendees: attendanceData,
                assembly: assembly,
                title: 'Lista de Asistencia'
            });
        } catch (err) {
            setAttendanceError(err.message || 'Error al generar el reporte');
        } finally {
            setLoadingAttendance(false);
        }
    };

    // Handle quick filter for liquidations
    const handleQuickFilter = (period) => {
        const now = new Date();
        let startDate, endDate;

        switch (period) {
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'thisYear':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case 'lastYear':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear() - 1, 11, 31);
                break;
            default:
                return;
        }

        setLiquidationFilters({
            ...liquidationFilters,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        });
    };

    // Handle liquidations report generation
    const handleGenerateLiquidationsReport = async () => {
        if (!liquidationFilters.startDate || !liquidationFilters.endDate) {
            setLiquidationError('Debe seleccionar un rango de fechas');
            return;
        }

        try {
            setLoadingLiquidations(true);
            setLiquidationError(null);

            const params = {
                startDate: liquidationFilters.startDate,
                endDate: liquidationFilters.endDate,
                ...(liquidationFilters.liquidationType && { liquidationType: liquidationFilters.liquidationType })
            };

            const response = await getLiquidationHistory(params);
            const liquidations = response.data || [];

            // Calculate statistics (only savings)
            const stats = {
                total: liquidations.length,
                periodic: liquidations.filter(l => l.liquidationType === 'periodic').length,
                exit: liquidations.filter(l => l.liquidationType === 'exit').length,
                totalSavings: liquidations.reduce((sum, l) => sum + (parseFloat(l.totalSavings) || 0), 0)
            };

            if (liquidations.length === 0) {
                setLiquidationError('No hay liquidaciones en el periodo seleccionado');
                return;
            }

            // Open print window directly
            printLiquidationsReport({
                liquidations: liquidations,
                stats: stats,
                dateRange: {
                    startDate: liquidationFilters.startDate,
                    endDate: liquidationFilters.endDate
                }
            });
        } catch (err) {
            setLiquidationError(err.message || 'Error al generar el reporte');
        } finally {
            setLoadingLiquidations(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Genera e imprime reportes del sistema</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Report Card */}
                <Card title="Lista de Asistencia">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Genera la lista de asistencia de una asamblea con nombre, cedula y espacio para firma.
                                </p>
                            </div>
                        </div>

                        {attendanceError && (
                            <Alert type="error" message={attendanceError} onClose={() => setAttendanceError(null)} />
                        )}

                        <Select
                            label="Seleccionar Asamblea"
                            value={selectedAssembly}
                            onChange={(e) => setSelectedAssembly(e.target.value)}
                            options={assemblyOptions}
                            disabled={loadingAssemblies}
                        />

                        <Button
                            onClick={handleGenerateAttendanceReport}
                            variant="primary"
                            fullWidth
                            disabled={!selectedAssembly || loadingAttendance}
                        >
                            {loadingAttendance ? (
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
                </Card>

                {/* Liquidations Report Card */}
                <Card title="Reporte de Liquidaciones">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Genera un reporte de liquidaciones de ahorros por periodo.
                                </p>
                            </div>
                        </div>

                        {liquidationError && (
                            <Alert type="error" message={liquidationError} onClose={() => setLiquidationError(null)} />
                        )}

                        {/* Quick Filters */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Periodos Rapidos:</p>
                            <div className="flex flex-wrap gap-2">
                                <Button onClick={() => handleQuickFilter('thisMonth')} variant="outline" size="sm">
                                    Este Mes
                                </Button>
                                <Button onClick={() => handleQuickFilter('lastMonth')} variant="outline" size="sm">
                                    Mes Pasado
                                </Button>
                                <Button onClick={() => handleQuickFilter('thisYear')} variant="outline" size="sm">
                                    Este Ano
                                </Button>
                                <Button onClick={() => handleQuickFilter('lastYear')} variant="outline" size="sm">
                                    Ano Pasado
                                </Button>
                            </div>
                        </div>

                        {/* Date Filters */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    value={liquidationFilters.startDate}
                                    onChange={(e) => setLiquidationFilters({ ...liquidationFilters, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    value={liquidationFilters.endDate}
                                    onChange={(e) => setLiquidationFilters({ ...liquidationFilters, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Liquidacion
                            </label>
                            <select
                                value={liquidationFilters.liquidationType}
                                onChange={(e) => setLiquidationFilters({ ...liquidationFilters, liquidationType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Todas</option>
                                <option value="periodic">Periodica</option>
                                <option value="exit">Por Retiro</option>
                            </select>
                        </div>

                        <Button
                            onClick={handleGenerateLiquidationsReport}
                            variant="primary"
                            fullWidth
                            disabled={!liquidationFilters.startDate || !liquidationFilters.endDate || loadingLiquidations}
                        >
                            {loadingLiquidations ? (
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
                </Card>
            </div>
        </div>
    );
};

export default ReportsPage;
