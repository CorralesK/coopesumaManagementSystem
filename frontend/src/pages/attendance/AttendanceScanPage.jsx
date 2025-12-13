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
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { printAttendanceListReport } from '../../utils/printUtils';

/**
 * AttendanceScanPage Component
 * Handles QR scanning and attendance registration with confirmation
 */
const AttendanceScanPage = () => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingMember, setPendingMember] = useState(null);
    const [pendingQrHash, setPendingQrHash] = useState(null);
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [printingList, setPrintingList] = useState(false);

    // Use custom hooks
    const { user } = useAuth();
    const isRegistrar = user?.role === USER_ROLES.REGISTRAR;
    const { activeAssembly, loading: loadingAssembly } = useActiveAssembly();
    const { recordByQR, loading: recording, error: recordError, clearState } = useAttendanceRecording();
    const { attendance, stats, loading: loadingAttendance, refetch: refetchAttendance } = useAssemblyAttendance(activeAssembly?.assemblyId);

    // Handle QR scan success - verify member first
    const handleScanSuccess = async (scannedData) => {
        if (verifying || recording) return;

        // Prevent scanning if no active assembly
        if (!activeAssembly) {
            setVerifyError('No hay una asamblea activa. No se puede registrar asistencia.');
            return;
        }

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
            const memberData = response.data;

            // Check if member is already registered in this assembly
            const alreadyRegistered = attendance?.some(
                record => record.identification === memberData.identification ||
                          record.memberId === memberData.memberId
            ) || false;

            // Show confirmation modal with member info
            setPendingMember(memberData);
            setPendingQrHash(qrHash);
            setIsAlreadyRegistered(alreadyRegistered);
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

    // Handle print attendance list
    const handlePrintAttendanceList = async () => {
        if (!attendance || attendance.length === 0) {
            alert('No hay asistentes registrados para imprimir.');
            return;
        }

        try {
            setPrintingList(true);
            await printAttendanceListReport({
                attendees: attendance,
                assembly: {
                    ...activeAssembly,
                    assemblyId: activeAssembly.assemblyId || activeAssembly.assembly_id
                },
                title: 'Lista de Asistencia'
            });
        } catch (err) {
            alert('Error al imprimir la lista: ' + (err.message || 'Error desconocido'));
        } finally {
            setPrintingList(false);
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
        fps: 30, // Faster scanning
        qrbox: 300, // Larger detection area
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
                    message={
                        isRegistrar
                            ? "No hay una asamblea activa en este momento. Por favor, comunícate con el administrador para activar una asamblea."
                            : "Debe activar una asamblea antes de poder registrar asistencia. Por favor, ve a Gestión de Asambleas y activa una asamblea."
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{activeAssembly.title}</h1>
                    <p className="text-gray-600 mt-1">
                        {new Date(activeAssembly.scheduledDate).toLocaleDateString('es-CR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Asistentes</p>
                        <p className="text-2xl font-bold text-primary-600">
                            {loadingAttendance ? '...' : (attendance?.length || 0)}
                        </p>
                    </div>
                    {attendance && attendance.length > 0 && (
                        <Button
                            onClick={handlePrintAttendanceList}
                            variant="outline"
                            disabled={printingList}
                        >
                            {printingList ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                            )}
                            {printingList ? 'Cargando...' : 'Imprimir Lista'}
                        </Button>
                    )}
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                {/* QR Scanner - 2 columns */}
                <div className="lg:col-span-2">
                    <Card>
                        <div>
                            {/* Scanner Container */}
                            <div id="qr-reader" className="w-full rounded-lg overflow-hidden" style={{ marginBottom: '2rem' }}></div>

                            {/* Scanner Controls */}
                            <div className="flex justify-center gap-3">
                                {!isScanning ? (
                                    <Button onClick={startScanning} variant="primary" fullWidth>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Iniciar Escaneo
                                    </Button>
                                ) : (
                                    <Button onClick={stopScanning} variant="secondary" fullWidth>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                        </svg>
                                        Detener Escaneo
                                    </Button>
                                )}
                            </div>

                            {/* Status */}
                            {(verifying || recording) && (
                                <div className="text-center py-4">
                                    <Loading message={verifying ? "Verificando..." : "Registrando..."} />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Attendance List - 3 columns */}
                <div className="lg:col-span-3">
                    <Card padding="none">
                        {loadingAttendance ? (
                            <div className="text-center py-8">
                                <Loading message="Cargando asistentes..." />
                            </div>
                        ) : attendance && attendance.length > 0 ? (
                            <div className="max-h-[600px] overflow-y-auto">
                                <table className="min-w-full">
                                    <tbody className="bg-white">
                                        {attendance.map((record, index) => (
                                            <tr
                                                key={record.attendanceId || index}
                                                className="transition-all duration-200 border-b border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:font-semibold"
                                            >
                                                <td className="px-3 sm:px-6 py-4 text-sm align-middle text-center w-16">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold mx-auto">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-6 py-4 text-sm align-middle">
                                                    <p className="font-medium text-gray-900">{record.fullName || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">{record.identification}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-base">No hay asistentes registrados</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={handleRejectAttendance}
                title={isAlreadyRegistered ? "Miembro Ya Registrado" : "Confirmar Registro de Asistencia"}
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
                                    className="w-40 h-40 rounded-full object-cover border-4 border-primary-500 shadow-lg"
                                />
                            ) : (
                                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary-500 shadow-lg">
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
                            {pendingMember.qualityName && (
                                <p className="text-gray-600">
                                    <strong>Calidad:</strong> {pendingMember.qualityName}
                                    {pendingMember.levelName && ` - ${pendingMember.levelName}`}
                                </p>
                            )}
                        </div>

                        {isAlreadyRegistered ? (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm text-yellow-800">
                                        Este miembro ya tiene su asistencia registrada en la asamblea "{activeAssembly.title}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-primary-50 border-l-4 border-primary-500 p-4">
                                <p className="text-sm text-primary-800 text-center">
                                    ¿Deseas registrar la asistencia de este miembro a la asamblea "{activeAssembly.title}"?
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-3">
                            {isAlreadyRegistered ? (
                                <Button
                                    onClick={handleRejectAttendance}
                                    variant="primary"
                                >
                                    Cerrar
                                </Button>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default AttendanceScanPage;
