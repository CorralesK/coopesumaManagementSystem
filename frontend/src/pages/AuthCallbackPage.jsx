/**
 * Auth Callback Page
 * Handles OAuth callback and token storage
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';

const AuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        if (errorParam) {
            const displayError = errorMessage || 'Error de autenticación. Por favor, intenta de nuevo.';
            setError(displayError);
            setTimeout(() => navigate('/login', { replace: true }), 3000);
            return;
        }

        if (token) {
            // Use queueMicrotask to defer processing and avoid React 19 warnings
            queueMicrotask(() => {
                try {
                    // Decode JWT to get user info
                    const parts = token.split('.');

                    if (parts.length !== 3) {
                        throw new Error('Invalid token format');
                    }

                    // Decode Base64URL to UTF-8 string properly
                    // atob() doesn't handle UTF-8 characters correctly, so we need to decode manually
                    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                        atob(base64)
                            .split('')
                            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    );
                    const payload = JSON.parse(jsonPayload);

                    const userData = {
                        userId: payload.userId,
                        fullName: payload.fullName,
                        email: payload.email,
                        role: payload.role
                    };

                    login(token, userData);

                    // Navigate based on user role
                    switch (userData.role) {
                        case USER_ROLES.MEMBER:
                            navigate('/my-dashboard', { replace: true });
                            break;
                        case USER_ROLES.REGISTRAR:
                            navigate('/attendance/scan', { replace: true });
                            break;
                        case USER_ROLES.ADMINISTRATOR:
                            navigate('/dashboard', { replace: true });
                            break;
                        case USER_ROLES.MANAGER:
                            navigate('/savings', { replace: true });
                            break;
                        default:
                            // Fallback to home page which will handle role-based redirect
                            navigate('/', { replace: true });
                            break;
                    }
                } catch (err) {
                    setError(`Error al procesar la autenticación: ${err.message}`);
                    setTimeout(() => navigate('/login', { replace: true }), 3000);
                }
            });
        } else {
            setError('Token no recibido.');
            setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
    }, [searchParams, navigate, login]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700 px-4 py-8">
                <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-100 p-4 rounded-full">
                            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                        Error de Autenticación
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Redirigiendo a la página de inicio de sesión...
                    </p>
                    <div className="mt-6">
                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 animate-pulse" style={{width: '100%'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 px-4 py-8">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 w-full max-w-md mx-auto text-center">
                <div className="flex justify-center mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-blue-600"></div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Autenticando...
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Por favor espera mientras procesamos tu inicio de sesión
                </p>
                <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
