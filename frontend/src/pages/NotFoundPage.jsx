/**
 * NotFoundPage Component
 * 404 error page for routes that don't exist
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-primary-600">404</h1>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Página No Encontrada
                </h2>

                <p className="text-lg text-gray-600 mb-8">
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>

                <div className="flex flex-col gap-4">
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

export default NotFoundPage;
