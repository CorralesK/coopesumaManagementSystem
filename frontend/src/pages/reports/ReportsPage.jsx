/**
 * ReportsPage Component (Placeholder)
 * Page for generating and downloading reports - TO BE IMPLEMENTED
 */

import React from 'react';
import Card from '../../components/common/Card';

const ReportsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
                <p className="text-gray-600 mt-1">Genera reportes de asistencia en formato PDF</p>
            </div>

            <Card>
                <div className="text-center py-12">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Módulo en Desarrollo</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        La generación de reportes estará disponible próximamente.
                    </p>
                    <div className="mt-6 text-left max-w-md mx-auto bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Funcionalidades Incluidas:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Reporte de asistencia por asamblea (PDF)</li>
                            <li>• Reporte con espacios para firmas físicas</li>
                            <li>• Estadísticas de asistencia por grado</li>
                            <li>• Estadísticas por método de registro (QR vs Manual)</li>
                            <li>• Descarga directa de archivos PDF</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ReportsPage;
