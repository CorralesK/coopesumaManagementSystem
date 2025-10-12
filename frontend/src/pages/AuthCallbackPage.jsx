/**
 * Auth Callback Page
 * Handles OAuth callback and token storage
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError('Error de autenticación. Por favor, intenta de nuevo.');
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (token) {
            try {
                // Decode JWT to get user info (simple base64 decode)
                const payload = JSON.parse(atob(token.split('.')[1]));

                const userData = {
                    userId: payload.userId,
                    fullName: payload.fullName,
                    email: payload.email,
                    role: payload.role
                };

                login(token, userData);
                navigate('/dashboard');
            } catch (err) {
                console.error('Error processing token:', err);
                setError('Error al procesar la autenticación.');
                setTimeout(() => navigate('/login'), 3000);
            }
        } else {
            setError('Token no recibido.');
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [searchParams, navigate, login]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Error de Autenticación
                    </h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">
                        Redirigiendo a la página de inicio de sesión...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Autenticando...
                </h2>
                <p className="text-gray-600">
                    Por favor espera mientras procesamos tu inicio de sesión
                </p>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
