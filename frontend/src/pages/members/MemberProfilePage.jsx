/**
 * @file MemberProfilePage.jsx
 * @description Page for members to view their personal information (read-only)
 * @module pages/members
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

/**
 * MemberProfilePage Component
 * Displays personal information for logged-in members (read-only)
 */
const MemberProfilePage = () => {
    const navigate = useNavigate();
    const [memberData, setMemberData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMemberData();
    }, []);

    const fetchMemberData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/members/me/dashboard');
            setMemberData(response.data.member);
        } catch (err) {
            console.error('Error fetching member data:', err);
            setError(err.message || 'Error al cargar la información');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        return new Date(dateString).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <Loading message="Cargando tu información..." />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/my-dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Información</h1>
                </div>
                <Alert type="error" message={error} />
                <div className="flex justify-center">
                    <Button onClick={fetchMemberData} variant="primary">
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    if (!memberData) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/my-dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Información</h1>
                </div>
                <Alert type="warning" message="No se pudo cargar tu información" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/my-dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Información</h1>
                    <p className="text-gray-600 mt-1">Tus datos personales</p>
                </div>
            </div>

            {/* Profile Card */}
            <Card>
                <div className="flex flex-col items-center pb-6 border-b border-gray-200">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                        {memberData.photoUrl ? (
                            <img
                                src={memberData.photoUrl}
                                alt={memberData.fullName}
                                className="w-24 h-24 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-4xl font-bold text-primary-600">
                                {memberData.fullName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        )}
                    </div>

                    {/* Name */}
                    <h2 className="text-xl font-bold text-gray-900 text-center">{memberData.fullName}</h2>

                    {/* Member Code */}
                    {memberData.memberCode && (
                        <p className="text-sm text-gray-500 mt-1 text-center">
                            Código de Asociado: <span className="font-medium">{memberData.memberCode}</span>
                        </p>
                    )}

                    {/* Status Badge */}
                    <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        memberData.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {memberData.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </div>

                {/* Personal Information */}
                <div className="pt-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Identification */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Identificación
                            </label>
                            <p className="text-base text-gray-900">{memberData.identification || 'No disponible'}</p>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Correo Institucional
                            </label>
                            <p className="text-base text-gray-900 break-all">{memberData.institutionalEmail || 'No disponible'}</p>
                        </div>

                        {/* Gender */}
                        {memberData.gender && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Género
                                </label>
                                <p className="text-base text-gray-900">
                                    {memberData.gender === 'M' ? 'Masculino' : memberData.gender === 'F' ? 'Femenino' : memberData.gender}
                                </p>
                            </div>
                        )}

                        {/* Quality */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Calidad
                            </label>
                            <p className="text-base text-gray-900">{memberData.qualityName || 'No disponible'}</p>
                        </div>

                        {/* Level */}
                        {memberData.levelName && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Nivel
                                </label>
                                <p className="text-base text-gray-900">{memberData.levelName}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Affiliation Information */}
                <div className="pt-6 mt-6 border-t border-gray-200 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Información de Afiliación</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Affiliation Date */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Fecha de Afiliación
                            </label>
                            <p className="text-base text-gray-900">{formatDate(memberData.affiliationDate)}</p>
                        </div>

                        {/* Last Liquidation Date */}
                        {memberData.lastLiquidationDate && (
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Última Liquidación
                                </label>
                                <p className="text-base text-gray-900">{formatDate(memberData.lastLiquidationDate)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Info Note */}
            <Alert
                type="info"
                message="Si necesitas actualizar tu información personal, por favor contacta al administrador de la cooperativa."
            />
        </div>
    );
};

export default MemberProfilePage;