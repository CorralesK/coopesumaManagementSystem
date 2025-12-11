/**
 * NotFoundPage Component
 * 404 error page for routes that don't exist
 */

import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ padding: '2rem 1rem' }}>
            <div className="max-w-lg w-full text-center bg-white rounded-2xl shadow-lg" style={{ padding: '3rem 2.5rem' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <h1 className="text-9xl font-bold text-primary-600" style={{ marginBottom: '1rem' }}>404</h1>
                </div>

                <h2 className="text-3xl font-bold text-gray-900" style={{ marginBottom: '1.5rem' }}>
                    Página No Encontrada
                </h2>

                <p className="text-lg text-gray-600 leading-relaxed" style={{ marginBottom: '2.5rem' }}>
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>

                <div className="flex flex-col w-full" style={{ gap: '1rem' }}>
                    <Button
                        onClick={() => navigate('/dashboard')}
                        variant="primary"
                        className="w-full"
                    >
                        Ir al Dashboard
                    </Button>

                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="w-full"
                    >
                        Volver Atrás
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
