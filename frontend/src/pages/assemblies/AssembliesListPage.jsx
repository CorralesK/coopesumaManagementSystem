/**
 * AssembliesListPage Component (Placeholder)
 * Page for managing assemblies - TO BE IMPLEMENTED
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const AssembliesListPage = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Asambleas</h1>
                    <p className="text-gray-600 mt-1">Administra las asambleas mensuales de la cooperativa</p>
                </div>
                <Button onClick={() => navigate('/assemblies/new')} variant="primary">
                    Nueva Asamblea
                </Button>
            </div>

            <Card>
                <div className="text-center py-12">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Módulo en Desarrollo</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        La gestión de asambleas estará disponible próximamente.
                    </p>
                    <p className="mt-4 text-xs text-gray-400">
                        Este módulo incluirá: Crear asambleas, activar/desactivar, programación, y visualización del historial.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default AssembliesListPage;
