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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        CoopeSuma
                    </h1>
                    <p className="text-gray-600">
                        Sistema de Gestión de Asistencia
                    </p>
                </div>

                <div className="mb-6">
                    <p className="text-center text-gray-700 mb-4">
                        Inicia sesión con tu cuenta de Microsoft
                    </p>
                </div>

                <button
                    onClick={handleMicrosoftLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                        <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                        <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                        <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                    </svg>
                    Iniciar sesión con Microsoft
                </button>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Universidad Técnica Nacional</p>
                    <p>Sede San Carlos</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
