/**
 * UnauthorizedPage Component
 * Displayed when user tries to access a route without proper permissions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <svg
                        className="mx-auto h-24 w-24 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Acceso Denegado
                </h1>

                <p className="text-lg text-gray-600 mb-8">
                    No tienes permisos para acceder a esta página. Por favor contacta al administrador si crees que esto es un error.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        variant="primary"
                        fullWidth
                    >
                        Ir al Dashboard
                    </Button>

                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        fullWidth
                    >
                        Volver Atrás
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
