/**
 * Login Page
 * Microsoft OAuth 2.0 login page
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 sm:px-6 py-8 sm:py-12">
            <div className="login-container bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-10 md:p-16 w-full max-w-[90%] sm:max-w-md md:max-w-lg mx-auto">
                {/* Logo/Icon Section */}
                <div className="flex justify-center mb-8 sm:mb-12">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>

                {/* Title Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-5">
                        CoopeSuma
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium leading-relaxed px-2 sm:px-4">
                        Cooperativa Estudiantil Unida Motivando el Ahorro
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
                <div className="mb-6 sm:mb-10">
                    <p className="text-center text-sm sm:text-base text-gray-700 px-2 sm:px-4">
                        Inicia sesión con tu cuenta institucional
                    </p>
                </div>

                {/* Microsoft Login Button */}
                <button
                    onClick={handleMicrosoftLogin}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 sm:py-5 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-98"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" viewBox="0 0 23 23" fill="none">
                        <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                        <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
                        <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
                        <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
                    </svg>
                    <span className="text-sm sm:text-base md:text-lg">Iniciar sesión con Microsoft</span>
                </button>

                {/* Footer */}
                <div className="login-footer mt-14 pt-10 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        Sistema de gestión cooperativa
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
