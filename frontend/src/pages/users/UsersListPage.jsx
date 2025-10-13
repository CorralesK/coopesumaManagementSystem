/**
 * UsersListPage Component (Placeholder)
 * Page for managing system users - TO BE IMPLEMENTED
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const UsersListPage = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
                </div>
                <Button onClick={() => navigate('/users/new')} variant="primary">
                    Nuevo Usuario
                </Button>
            </div>

            <Card>
                <div className="text-center py-12">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Módulo en Desarrollo</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        La gestión de usuarios estará disponible próximamente.
                    </p>
                    <p className="mt-4 text-xs text-gray-400">
                        Este módulo incluirá: Crear usuarios, asignar roles (Administrador/Registrador/Tesorero), activar/desactivar cuentas.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default UsersListPage;
