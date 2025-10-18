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

    const handleDownloadQR = () => {
        if (member?.qrCodeDataUrl) {
            const link = document.createElement('a');
            link.href = member.qrCodeDataUrl;
            link.download = `QR-${member.fullName}-${member.identification}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Detalle del Miembro</h1>
                    <p className="text-gray-600 mt-1">Información completa y código QR</p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={() => navigate('/members')} variant="outline">Volver</Button>
                    <Button onClick={() => navigate(`/members/${id}/edit`)} variant="primary">Editar</Button>
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
                        <div className="flex items-start space-x-6">
                            {member.photoUrl ? (
                                <img src={member.photoUrl} alt={member.fullName} className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200" />
                            ) : (
                                <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{member.fullName}</h2>
                                <div className="space-y-2">
                                    <p className="text-gray-600">
                                        <strong>Identificación:</strong> {member.identification}
                                    </p>
                                    <p className="text-gray-600">
                                        <strong>Grado:</strong> {member.grade}°
                                    </p>
                                    <span className={`inline-flex px-4 py-1.5 text-sm font-semibold rounded-full ${
                                        member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {member.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Información Adicional">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Fecha de Registro</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatDate(member.createdAt)}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Última Actualización</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatDate(member.updatedAt)}</dd>
                            </div>
                            <div className="md:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Hash del Código QR</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{member.qrHash}</dd>
                            </div>
                        </dl>
                    </Card>
                </div>

                {/* Right Column - QR Code */}
                <div className="space-y-6">
                    <Card title="Código QR">
                        <div className="flex flex-col items-center">
                            {member.qrCodeDataUrl ? (
                                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                                    <img src={member.qrCodeDataUrl} alt={`QR Code for ${member.fullName}`} className="w-full max-w-xs" />
                                </div>
                            ) : (
                                <div className="bg-gray-100 p-8 rounded-lg">
                                    <p className="text-gray-600 text-center">Código QR no disponible</p>
                                </div>
                            )}

                            <div className="mt-4 w-full space-y-2">
                                <Button onClick={() => setQrModalOpen(true)} variant="outline" fullWidth>Ver QR Grande</Button>
                                <Button onClick={handleDownloadQR} variant="outline" fullWidth>Descargar QR</Button>
                                <Button onClick={() => window.print()} variant="outline" fullWidth>Imprimir QR</Button>
                                <Button onClick={handleRegenerateQR} variant="warning" fullWidth disabled={regenerating || !member.isActive}>
                                    {regenerating ? 'Regenerando...' : 'Regenerar QR'}
                                </Button>
                            </div>

                            {!member.isActive && (
                                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-3">
                                    <p className="text-xs text-red-700">
                                        <strong>Miembro Inactivo:</strong> No se puede regenerar el código QR.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* QR Modal */}
            <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title={`Código QR - ${member.fullName}`} size="lg">
                <div className="flex flex-col items-center">
                    <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
                        <img src={member.qrCodeDataUrl} alt={`QR Code for ${member.fullName}`} className="w-full max-w-md" />
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-lg font-medium text-gray-900">{member.fullName}</p>
                        <p className="text-sm text-gray-600">Grado: {member.grade}°</p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">{member.qrHash}</p>
                    </div>
                    <div className="mt-6 flex space-x-3">
                        <Button onClick={handleDownloadQR} variant="primary">Descargar</Button>
                        <Button onClick={() => window.print()} variant="outline">Imprimir</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MemberDetailPage;
