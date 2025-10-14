/**
 * MemberDetailPage Component
 * Page for displaying detailed information about a member including QR code
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

const MemberDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        fetchMember();
    }, [id]);

    const fetchMember = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get(`/members/${id}`);
            setMember(response.data);
        } catch (err) {
            setError(err.message || 'Error al cargar el miembro');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateQR = async () => {
        // Check if member is active
        if (!member.isActive) {
            setError('No se puede regenerar el código QR de un miembro inactivo');
            return;
        }

        if (!window.confirm('¿Estás seguro de que deseas regenerar el código QR? El código anterior dejará de funcionar.')) {
            return;
        }

        try {
            setRegenerating(true);
            setError('');

            await api.post(`/members/${id}/qr/regenerate`);
            setSuccessMessage('Código QR regenerado exitosamente');
            await fetchMember(); // Refresh member data
        } catch (err) {
            setError(err.message || 'Error al regenerar el código QR');
        } finally {
            setRegenerating(false);
        }
    };

    const handlePrintQR = () => {
        window.print();
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

    const handleEdit = () => {
        navigate(`/members/${id}/edit`);
    };

    const handleBack = () => {
        navigate('/members');
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
                <Button onClick={handleBack} variant="primary" className="mt-4">
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
                    <h1 className="text-3xl font-bold text-gray-900">
                        Detalle del Miembro
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Información completa y código QR
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={handleBack} variant="outline">
                        Volver
                    </Button>
                    <Button onClick={handleEdit} variant="primary">
                        Editar
                    </Button>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <Alert type="error" message={error} onClose={() => setError('')} />
            )}
            {successMessage && (
                <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Member Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Photo and Basic Info */}
                    <Card>
                        <div className="flex items-start space-x-6">
                            {member.photoUrl ? (
                                <img
                                    src={member.photoUrl}
                                    alt={member.fullName}
                                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {member.fullName}
                                </h2>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                        <span>Identificación: {member.identification}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span>Grado: {member.grade}°</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`inline-flex px-4 py-1.5 text-sm font-semibold rounded-full ${
                                            member.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {member.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Additional Information */}
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
                                    <img
                                        src={member.qrCodeDataUrl}
                                        alt={`QR Code for ${member.fullName}`}
                                        className="w-full max-w-xs"
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-100 p-8 rounded-lg">
                                    <p className="text-gray-600 text-center">
                                        Código QR no disponible
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 w-full space-y-2">
                                <Button
                                    onClick={() => setQrModalOpen(true)}
                                    variant="outline"
                                    fullWidth
                                >
                                    Ver QR Grande
                                </Button>
                                <Button
                                    onClick={handleDownloadQR}
                                    variant="outline"
                                    fullWidth
                                >
                                    Descargar QR
                                </Button>
                                <Button
                                    onClick={handlePrintQR}
                                    variant="outline"
                                    fullWidth
                                >
                                    Imprimir QR
                                </Button>
                                <Button
                                    onClick={handleRegenerateQR}
                                    variant="warning"
                                    fullWidth
                                    disabled={regenerating || !member.isActive}
                                >
                                    {regenerating ? 'Regenerando...' : 'Regenerar QR'}
                                </Button>
                            </div>

                            {!member.isActive && (
                                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-3">
                                    <p className="text-xs text-red-700">
                                        <strong>Miembro Inactivo:</strong> No se puede regenerar el código QR de un miembro inactivo.
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3">
                                <p className="text-xs text-yellow-700">
                                    <strong>Importante:</strong> Regenerar el código QR invalidará el código anterior.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* QR Code Modal */}
            <Modal
                isOpen={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                title={`Código QR - ${member.fullName}`}
                size="lg"
            >
                <div className="flex flex-col items-center">
                    <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
                        <img
                            src={member.qrCodeDataUrl}
                            alt={`QR Code for ${member.fullName}`}
                            className="w-full max-w-md"
                        />
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-lg font-medium text-gray-900">{member.fullName}</p>
                        <p className="text-sm text-gray-600">Grado: {member.grade}°</p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">{member.qrHash}</p>
                    </div>
                    <div className="mt-6 flex space-x-3">
                        <Button onClick={handleDownloadQR} variant="primary">
                            Descargar
                        </Button>
                        <Button onClick={handlePrintQR} variant="outline">
                            Imprimir
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MemberDetailPage;
