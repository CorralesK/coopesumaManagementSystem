/**
 * AttendanceScanPage Component (Placeholder)
 * Page for scanning QR codes and registering attendance - TO BE IMPLEMENTED
 */

import React from 'react';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';

const AttendanceScanPage = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Registro de Asistencia</h1>
                <p className="text-gray-600 mt-1">Escanea el código QR de los miembros para registrar su asistencia</p>
            </div>

            <Alert
                type="warning"
                title="Módulo en Desarrollo"
                message="El escáner QR estará disponible próximamente. Este módulo incluirá escaneo de códigos QR, verificación visual del miembro, y registro manual."
            />

            <Card>
                <div className="text-center py-12">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Escáner QR</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        La funcionalidad de escaneo estará disponible próximamente
                    </p>
                    <div className="mt-6 text-left max-w-md mx-auto bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Funcionalidades Incluidas:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Escaneo de códigos QR en tiempo real</li>
                            <li>• Verificación visual del miembro (foto + datos)</li>
                            <li>• Registro manual de asistencia (fallback)</li>
                            <li>• Prevención de registros duplicados</li>
                            <li>• Validación de asamblea activa</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AttendanceScanPage;
