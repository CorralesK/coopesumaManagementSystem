/**
 * Login Page
 * Microsoft OAuth 2.0 login page
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleMicrosoftLogin = () => {
        // Redirect to backend Microsoft OAuth endpoint
        window.location.href = `${API_URL}/auth/microsoft`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 px-4 py-8">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md mx-auto">
                {/* Logo/Icon Section */}
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>

                {/* Title Section */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        CoopeSuma
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Sistema de Gestión de Asistencia
                    </p>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                    <p className="text-center text-sm sm:text-base text-gray-700 mb-4">
                        Inicia sesión con tu cuenta institucional de Microsoft
                    </p>
                </div>

                {/* Microsoft Login Button */}
                <button
                    onClick={handleMicrosoftLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 23 23" fill="none">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                        <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                        <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                        <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                    </svg>
                    <span className="text-sm sm:text-base">Iniciar sesión con Microsoft</span>
                </button>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-600">
                    <p className="font-medium">Cooperativa Estudiantil Unida Motivando el Ahorro</p>
                    <p className="text-xs mt-1">CoopeSuma</p>
                </div>

                {/* Additional Info */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                        Sistema de Gestión de Asistencia
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
