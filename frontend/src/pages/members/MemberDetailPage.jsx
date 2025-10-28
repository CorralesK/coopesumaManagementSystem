/**
 * @file MemberDetailPage.jsx
 * @description Page for displaying detailed member information with QR code
 * @module pages/members
 */

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMember, useMemberOperations } from '../../hooks/useMembers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import MemberCard from '../../components/members/MemberCard';

/**
 * MemberDetailPage Component
 * Shows comprehensive member information including QR code
 */
const MemberDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Use custom hooks
    const { member, loading, error, refetch } = useMember(id);
    const { regenerateQR, loading: regenerating, error: regenerateError } = useMemberOperations();

    // Event handlers
    const handleRegenerateQR = async () => {
        if (!member.isActive) {
            return;
        }

        if (!window.confirm('¿Estás seguro de que deseas regenerar el código QR? El código anterior dejará de funcionar.')) {
            return;
        }

        try {
            await regenerateQR(id);
            setSuccessMessage('Código QR regenerado exitosamente');
            refetch();
        } catch (err) {
            // Error handled by hook
        }
    };

    const handlePrintCard = () => {
        setQrModalOpen(true);
        // Wait for modal to render then print
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <Loading message="Cargando información del miembro..." />;
    }

    if (!member) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No se encontró el miembro</p>
                <Button onClick={() => navigate('/members')} variant="primary" className="mt-4">
                    Volver a la Lista
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Detalle del Miembro</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button onClick={() => navigate('/members')} variant="outline" className="w-full sm:w-auto">Volver</Button>
                    <Button onClick={() => navigate(`/members/${id}/edit`)} variant="primary" className="w-full sm:w-auto">Editar</Button>
                </div>
            </div>

            {/* Alerts */}
            {(error || regenerateError) && <Alert type="error" message={error || regenerateError} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Member Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            {/* Photo */}
                            <div className="flex-shrink-0">
                                {member.photoUrl ? (
                                    <img
                                        src={member.photoUrl}
                                        alt={member.fullName}
                                        className="w-40 h-40 rounded-lg object-cover border-2 border-gray-200"
                                    />
                                ) : (
                                    <div className="w-40 h-40 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                                        <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Member Info */}
                            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900" style={{ marginBottom: '0.5rem' }}>{member.fullName}</h2>
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                        member.isActive
                                            ? 'bg-green-100 border border-green-200'
                                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-600' : 'bg-gray-500'}`} style={{ marginRight: '0.5rem' }}></span>
                                        <span className={member.isActive ? 'text-green-600' : ''}>
                                            {member.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </span>
                                </div>

                                {/* Info Simple */}
                                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.5rem' }}>
                                    <div className="pb-3 border-b border-gray-200">
                                        <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Identificación</dt>
                                        <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{member.identification}</dd>
                                    </div>

                                    <div className="pb-3 border-b border-gray-200">
                                        <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Grado</dt>
                                        <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{member.grade}° grado</dd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Información Adicional">
                        <div className="member-detail-info" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '2rem' }}>
                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Fecha de Registro</dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{formatDate(member.createdAt)}</dd>
                                </div>

                                <div className="pb-3 border-b border-gray-200">
                                    <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.25rem' }}>Última Actualización</dt>
                                    <dd className="text-base text-gray-900" style={{ marginBottom: 0 }}>{formatDate(member.updatedAt)}</dd>
                                </div>
                            </div>

                            {/* QR Hash */}
                            <div style={{ marginTop: '1rem' }}>
                                <dt className="text-sm font-medium text-gray-500" style={{ marginBottom: '0.5rem' }}>Hash del Código QR</dt>
                                <dd className="text-xs text-gray-700 font-mono break-all bg-gray-50 p-3 rounded border border-gray-200" style={{ marginBottom: 0 }}>{member.qrHash}</dd>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - QR Code */}
                <div className="space-y-6">
                    <Card title="Código QR">
                        <div className="flex flex-col items-center space-y-4">
                            {/* QR Code Display */}
                            {member.qrCodeDataUrl ? (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                    <div className="relative bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200 hover:border-primary-300 transition-all duration-300 hover:shadow-xl">
                                        <img
                                            src={member.qrCodeDataUrl}
                                            alt={`QR Code for ${member.fullName}`}
                                            className="w-full max-w-[200px] mx-auto"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-100 p-12 rounded-2xl border-2 border-dashed border-gray-300">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                    <p className="text-sm text-gray-500 text-center font-medium">Código QR no disponible</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="w-full space-y-3">
                                <Button
                                    onClick={() => setQrModalOpen(true)}
                                    variant="outline"
                                    fullWidth
                                    className="group hover:border-primary-500 hover:bg-primary-50 transition-all"
                                >
                                    <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Ver Carnet
                                </Button>

                                <Button
                                    onClick={handleRegenerateQR}
                                    variant="secondary"
                                    fullWidth
                                    disabled={regenerating || !member.isActive}
                                    className="group hover:bg-gray-700 transition-all"
                                >
                                    {regenerating ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Regenerando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Regenerar QR
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Inactive Member Warning */}
                            {!member.isActive && (
                                <div className="w-full mt-2 bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs text-gray-600">
                                            <span className="font-semibold">Miembro Inactivo</span><br />
                                            No se puede regenerar el código QR.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Card Modal - Shows Member Card */}
            {qrModalOpen && (
                <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title={`Carnet - ${member.fullName}`} size="lg">
                    <div className="flex flex-col items-center">
                        <div id="printable-card" className="member-card-display">
                            <MemberCard member={member} showCutLines={true} />
                        </div>
                        <div className="mt-6 flex space-x-3 print-hide">
                            <Button onClick={() => setQrModalOpen(false)} variant="outline">Cerrar</Button>
                            <Button onClick={() => window.print()} variant="primary">Imprimir Carnet</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Print Styles */}
            <style>{`
                .member-card-display {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }

                    html, body {
                        width: 210mm;
                        height: 297mm;
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #printable-card,
                    #printable-card * {
                        visibility: visible;
                    }

                    #printable-card {
                        position: fixed;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        margin: 0;
                        padding: 0;
                    }

                    .print-hide {
                        display: none !important;
                    }

                    .member-card-display {
                        padding: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default MemberDetailPage;
