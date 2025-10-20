/**
 * @file AttendanceScanPage.jsx
 * @description Page for scanning QR codes and registering attendance
 * @module pages/attendance
 */

import React, { useState, useEffect } from 'react';
import { useActiveAssembly } from '../../hooks/useAssemblies';
import { useAttendanceRecording, useAssemblyAttendance } from '../../hooks/useAttendance';
import { useQrScanner } from '../../hooks/useQrScanner';
import { verifyMemberByQR } from '../../services/memberService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

/**
 * AttendanceScanPage Component
 * Handles QR scanning and attendance registration with confirmation
 */
const AttendanceScanPage = () => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingMember, setPendingMember] = useState(null);
    const [pendingQrHash, setPendingQrHash] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Use custom hooks
    const { activeAssembly, loading: loadingAssembly } = useActiveAssembly();
    const { recordByQR, loading: recording, error: recordError, clearState } = useAttendanceRecording();
    const { attendance, stats, loading: loadingAttendance, refetch: refetchAttendance } = useAssemblyAttendance(activeAssembly?.assemblyId);

    // Handle QR scan success - verify member first
    const handleScanSuccess = async (scannedData) => {
        if (verifying || recording) return;

        try {
            setVerifyError(null);
            setVerifying(true);

            // Extract QR hash from URL if the scanned data is a verification URL
            // Format: http://localhost:5173/verify?qr=HASH or just HASH
            let qrHash = scannedData;

            // Check if scanned data is a URL
            if (scannedData.includes('verify?qr=')) {
                const url = new URL(scannedData);
                qrHash = url.searchParams.get('qr');
            }

            // Verify member without registering attendance
            const response = await verifyMemberByQR(qrHash);

            // Show confirmation modal with member info
            setPendingMember(response.data);
            setPendingQrHash(qrHash);
            setShowConfirmModal(true);
        } catch (err) {
            setVerifyError(err.message || 'Error al verificar el código QR');
        } finally {
            setVerifying(false);
        }
    };

    // Confirm attendance registration
    const handleConfirmAttendance = async () => {
        try {
            clearState();

            // Register attendance
            await recordByQR(pendingQrHash, activeAssembly?.assemblyId);

            // Refresh attendance list
            await refetchAttendance();

            // Close modal and show success message
            setShowConfirmModal(false);
            setSuccessMessage(`Asistencia registrada para ${pendingMember.fullName}`);
            setPendingMember(null);
            setPendingQrHash(null);

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err) {
            // Error is handled by the hook
            setShowConfirmModal(false);
        }
    };

    // Reject attendance registration
    const handleRejectAttendance = () => {
        setShowConfirmModal(false);
        setPendingMember(null);
        setPendingQrHash(null);
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
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Registro de Asistencia</h1>
                    <p className="text-gray-600 mt-1">
                        Asamblea: <span className="font-semibold">{activeAssembly.title}</span>
                    </p>
                </div>
                {/* Attendance Counter */}
                <div className="bg-blue-50 border-2 border-blue-500 rounded-lg px-6 py-3">
                    <div className="text-center">
                        <p className="text-sm text-blue-600 font-medium">Asistentes</p>
                        <p className="text-3xl font-bold text-blue-700">
                            {loadingAttendance ? '...' : stats?.totalAttendance || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
            )}

            {/* Error Messages */}
            {(scanError || recordError || verifyError) && (
                <Alert
                    type="error"
                    message={scanError || recordError || verifyError}
                    onClose={() => {
                        clearState();
                        setVerifyError(null);
                    }}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                <li>• Verifica la información del miembro</li>
                                <li>• Confirma o rechaza el registro</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* Recent Scans / Info */}
                <Card title="Información">
                    <div className="space-y-4">
                        {(verifying || recording) && (
                            <div className="text-center py-8">
                                <Loading message={verifying ? "Verificando código QR..." : "Registrando asistencia..."} />
                            </div>
                        )}

                        {!verifying && !recording && (
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
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Attendance List */}
                <Card title="Lista de Asistentes" className="lg:col-span-1">
                    <div className="space-y-4">
                        {loadingAttendance ? (
                            <div className="text-center py-8">
                                <Loading message="Cargando asistentes..." />
                            </div>
                        ) : attendance && attendance.length > 0 ? (
                            <div className="max-h-[600px] overflow-y-auto">
                                <div className="space-y-2">
                                    {attendance.map((record, index) => (
                                        <div
                                            key={record.attendanceId || index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{record.member?.fullName || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500">Grado: {record.member?.grade}°</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">
                                                    {new Date(record.recordedAt).toLocaleTimeString('es-CR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    Registrado
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p>No hay asistentes registrados aún</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={handleRejectAttendance}
                title="Confirmar Registro de Asistencia"
                size="md"
            >
                {pendingMember && (
                    <div className="space-y-6">
                        {/* Member Photo - Centered */}
                        <div className="flex justify-center">
                            {pendingMember.photoUrl ? (
                                <img
                                    src={pendingMember.photoUrl}
                                    alt={pendingMember.fullName}
                                    className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                                />
                            ) : (
                                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-blue-500 shadow-lg">
                                    <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Member Info - Centered */}
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900">{pendingMember.fullName}</h3>
                            <p className="text-gray-600">
                                <strong>Identificación:</strong> {pendingMember.identification}
                            </p>
                            <p className="text-gray-600">
                                <strong>Grado:</strong> {pendingMember.grade}°
                            </p>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <p className="text-sm text-blue-800 text-center">
                                ¿Deseas registrar la asistencia de este miembro a la asamblea "{activeAssembly.title}"?
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-3">
                            <Button
                                onClick={handleRejectAttendance}
                                variant="outline"
                                disabled={recording}
                            >
                                Rechazar
                            </Button>
                            <Button
                                onClick={handleConfirmAttendance}
                                variant="primary"
                                disabled={recording}
                            >
                                {recording ? 'Registrando...' : 'Aceptar'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AttendanceScanPage;
