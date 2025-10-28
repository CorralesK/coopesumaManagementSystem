/**
 * @file MemberVerifyPage.jsx
 * @description Public page for verifying member identity via QR code
 * @module pages/public
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

/**
 * MemberVerifyPage Component
 * Public page accessible without authentication
 * Displays member information when QR code is scanned
 */
const MemberVerifyPage = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState(null);
    const [error, setError] = useState(null);
    const qrHash = searchParams.get('qr');

    useEffect(() => {
        const verifyMember = async () => {
            if (!qrHash) {
                setError('no-qr');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await api.get(`/members/verify?qr=${qrHash}`);
                setMember(response.data.data);
                setError(null);
            } catch (err) {
                if (err.response?.status === 404) {
                    setError('invalid');
                } else {
                    setError('server');
                }
                setMember(null);
            } finally {
                setLoading(false);
            }
        };

        verifyMember();
    }, [qrHash]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Verificando código QR...</p>
                </div>
            </div>
        );
    }

    // Error: No QR parameter
    if (error === 'no-qr') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
                            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Parámetro QR Faltante</h1>
                        <p className="text-gray-600 mb-6">
                            El parámetro QR es requerido para verificar un miembro.
                        </p>
                        <p className="text-sm text-gray-500">
                            Por favor, escanee un código QR válido de CoopeSuma.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error: Invalid QR
    if (error === 'invalid') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
                            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">QR Inválido</h1>
                        <p className="text-gray-600 mb-6">
                            El código QR escaneado no corresponde a ningún miembro registrado en la cooperativa.
                        </p>
                        <p className="text-sm text-gray-500">
                            Por favor, verifique el código.
                        </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-500">CoopeSuma © 2025</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error: Server error
    if (error === 'server') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
                            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Error del Servidor</h1>
                        <p className="text-gray-600 mb-6">
                            Ocurrió un error al verificar el código QR. Por favor, intente nuevamente más tarde.
                        </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-500">CoopeSuma © 2025</p>
                    </div>
                </div>
            </div>
        );
    }

    // Success: Member found
    if (member) {
        const isActive = member.isActive;

        return (
            <div className={`min-h-screen bg-gradient-to-br ${isActive ? 'from-green-50 to-emerald-100' : 'from-yellow-50 to-amber-100'} flex items-center justify-center p-4`}>
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    {/* Status Header */}
                    <div className="text-center mb-6">
                        <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full ${isActive ? 'bg-green-100' : 'bg-yellow-100'} mb-4`}>
                            {isActive ? (
                                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                        </div>
                        <h1 className={`text-2xl font-bold mb-2 ${isActive ? 'text-green-800' : 'text-yellow-800'}`}>
                            {isActive ? 'Miembro Verificado' : 'Miembro Inactivo'}
                        </h1>
                    </div>

                    {/* Member Information */}
                    <div className="flex items-start space-x-4 mb-6">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {member.photoUrl ? (
                                <img
                                    src={member.photoUrl}
                                    alt={member.fullName}
                                    className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Information */}
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{member.fullName}</h2>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p>
                                    <span className="font-medium text-gray-700">Cédula:</span> {member.identification}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-700">Grado:</span> {member.grade}°
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    <div className={`rounded-lg p-4 mb-6 ${isActive ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className="flex items-start">
                            <svg className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-yellow-600'} mr-2 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className={`text-sm ${isActive ? 'text-green-800' : 'text-yellow-800'}`}>
                                {isActive ? (
                                    <>Miembro activo de la Cooperativa Estudiantil CoopeSuma</>
                                ) : (
                                    <>Este miembro ya no está activo en la cooperativa.</>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-500">CoopeSuma © 2025</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default MemberVerifyPage;
