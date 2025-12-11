/**
 * UnauthorizedPage Component
 * Displayed when user tries to access a route without proper permissions
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ padding: '2rem 1rem' }}>
            <div className="max-w-lg w-full text-center bg-white rounded-2xl shadow-lg" style={{ padding: '3rem 2.5rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 className="text-9xl font-bold text-primary-600" style={{ marginBottom: '1rem' }}>403</h1>
                </div>

                <h2 className="text-3xl font-bold text-gray-900" style={{ marginBottom: '1.5rem' }}>
                    Acceso Denegado
                </h2>

                <p className="text-lg text-gray-600 leading-relaxed" style={{ marginBottom: '2.5rem' }}>
                    No tienes permisos para acceder a esta página. Por favor contacta al administrador si crees que esto es un error.
                </p>

                <div className="flex flex-col w-full" style={{ gap: '1rem' }}>
                    <Button
                        onClick={handleLogout}
                        variant="primary"
                        className="w-full"
                    >
                        Volver a Iniciar Sesión
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
