/**
 * @file AttendanceScanPage.jsx
 * @description Page for scanning QR codes and registering attendance
 * @module pages/attendance
 */

import React, { useState, useEffect } from 'react';
import { useActiveAssembly } from '../../hooks/useAssemblies';
import { useAttendanceRecording } from '../../hooks/useAttendance';
import { useQrScanner } from '../../hooks/useQrScanner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

/**
 * AttendanceScanPage Component
 * Handles QR scanning and attendance registration
 */
const AttendanceScanPage = () => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [scannedMember, setScannedMember] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Use custom hooks
    const { activeAssembly, loading: loadingAssembly } = useActiveAssembly();
    const { recordByQR, loading: recording, error: recordError, recordedAttendance, clearState } = useAttendanceRecording();

    // Handle QR scan success
    const handleScanSuccess = async (qrHash) => {
        if (recording) return;

        try {
            clearState();
            const result = await recordByQR(qrHash, activeAssembly?.assemblyId);

            // Show confirmation modal with member info
            setScannedMember(result.data);
            setShowConfirmModal(true);

            // Auto-hide after 3 seconds
            setTimeout(() => {
                setShowConfirmModal(false);
                setScannedMember(null);
            }, 3000);
        } catch (err) {
            // Error handled by hook
        }
    };

    // QR Scanner hook
    const {
        isScanning,
        error: scanError,
        scannedData,
        startScanning,
        stopScanning,
        clearScannedData
    } = useQrScanner({
        elementId: 'qr-reader',
        fps: 10,
        qrbox: 250,
        onScanSuccess: (decodedText) => {
            handleScanSuccess(decodedText);
            clearScannedData();
        }
    });

    // Auto-start scanning on mount if there's an active assembly
    useEffect(() => {
        if (activeAssembly && !isScanning) {
            startScanning();
        }

        return () => {
            if (isScanning) {
                stopScanning();
            }
        };
    }, [activeAssembly]);

    if (loadingAssembly) {
        return <Loading message="Cargando información de asamblea..." />;
    }

    if (!activeAssembly) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Registro de Asistencia</h1>
                    <p className="text-gray-600 mt-1">Escanea el código QR de los miembros</p>
                </div>

                <Alert
                    type="warning"
                    title="No hay asamblea activa"
                    message="Debe activar una asamblea antes de poder registrar asistencia. Por favor, ve a Gestión de Asambleas y activa una asamblea."
                />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Registro de Asistencia</h1>
                <p className="text-gray-600 mt-1">
                    Asamblea: <span className="font-semibold">{activeAssembly.title}</span>
                </p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
            )}

            {/* Error Messages */}
            {(scanError || recordError) && (
                <Alert
                    type="error"
                    message={scanError || recordError}
                    onClose={() => clearState()}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Scanner */}
                <Card title="Escáner QR">
                    <div className="space-y-4">
                        {/* Scanner Container */}
                        <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-gray-300"></div>

                        {/* Scanner Controls */}
                        <div className="flex justify-center space-x-3">
                            {!isScanning ? (
                                <Button onClick={startScanning} variant="primary">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Iniciar Escaneo
                                </Button>
                            ) : (
                                <Button onClick={stopScanning} variant="danger">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                    </svg>
                                    Detener Escaneo
                                </Button>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Coloca el código QR frente a la cámara</li>
                                <li>• Mantén el código dentro del marco de escaneo</li>
                                <li>• Espera la confirmación visual</li>
                                <li>• El registro se hace automáticamente</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* Recent Scans / Info */}
                <Card title="Información">
                    <div className="space-y-4">
                        {recording && (
                            <div className="text-center py-8">
                                <Loading message="Registrando asistencia..." />
                            </div>
                        )}

                        {!recording && !scannedMember && (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                <p>Esperando escaneo de código QR...</p>
                            </div>
                        )}

                        {/* Assembly Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Asamblea Activa</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Título:</strong> {activeAssembly.title}</p>
                                <p><strong>Fecha:</strong> {new Date(activeAssembly.scheduledDate).toLocaleDateString('es-CR')}</p>
                                <p><strong>Ubicación:</strong> {activeAssembly.location}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Asistencia Registrada"
                size="md"
            >
                {scannedMember && (
                    <div className="text-center space-y-4">
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        {/* Member Info */}
                        <div>
                            {scannedMember.member?.photoUrl && (
                                <img
                                    src={scannedMember.member.photoUrl}
                                    alt={scannedMember.member.fullName}
                                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-green-500"
                                />
                            )}
                            <h3 className="text-xl font-bold text-gray-900">{scannedMember.member?.fullName}</h3>
                            <p className="text-gray-600">Grado: {scannedMember.member?.grade}°</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Registrado a las {new Date(scannedMember.recordedAt).toLocaleTimeString('es-CR')}
                            </p>
                        </div>

                        <p className="text-green-600 font-semibold">Asistencia registrada correctamente</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AttendanceScanPage;
