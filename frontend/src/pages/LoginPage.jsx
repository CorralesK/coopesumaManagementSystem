/**
 * Login Page
 * Microsoft OAuth 2.0 login page
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';
import CooplinkLogo from '../assets/logos/CooplinkLogo.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // Check for error in URL parameters
        const errorParam = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (errorParam) {
            const displayError = errorMessage || 'Error de autenticación. Por favor, intenta de nuevo.';
            setError(displayError);
            // Clean URL
            window.history.replaceState({}, document.title, '/login');
        }
    }, [searchParams]);

    const handleMicrosoftLogin = () => {
        // Redirect to backend Microsoft OAuth endpoint
        window.location.href = `${API_URL}/auth/microsoft`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 py-8 sm:py-12">
            <div className="login-container bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-10 md:p-16 w-full max-w-[90%] sm:max-w-md md:max-w-lg mx-auto">
                {/* Logo Section */}
                <div className="flex justify-center mb-8 sm:mb-10">
                    <img
                        src={CooplinkLogo}
                        alt="Cooplink Logo"
                        className="h-16 sm:h-20 md:h-24 w-auto object-contain"
                    />
                </div>

                {/* Subtitle Section */}
                <div className="text-center mb-8 sm:mb-10">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2 sm:px-4">
                        Sistema de Gestión Cooperativa
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert
                        type="error"
                        title="Error de autenticación"
                        message={error}
                        onClose={() => setError(null)}
                    />
                )}

                {/* Instructions */}
                <div className="mb-6 sm:mb-8">
                    <p className="text-center text-sm sm:text-base text-gray-600 px-2 sm:px-4">
                        Inicia sesión con tu cuenta institucional
                    </p>
                </div>

                {/* Microsoft Login Button */}
                <button
                    onClick={handleMicrosoftLogin}
                    className="login-btn w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 sm:py-4 sm:px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 shadow-md hover:shadow-lg"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 23 23" fill="none">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                        <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                        <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                        <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                    </svg>
                    <span className="text-sm sm:text-base">Iniciar sesión con Microsoft</span>
                </button>

                {/* Footer */}
                <div className="login-footer mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-gray-100 text-center">
                    <p className="text-xs sm:text-sm text-gray-500">
                        © 2025 Cooplink. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
