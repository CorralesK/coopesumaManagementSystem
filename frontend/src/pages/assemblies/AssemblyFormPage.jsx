/**
 * AssemblyFormPage Component (Placeholder)
 * Form for creating/editing assemblies - TO BE IMPLEMENTED
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const AssemblyFormPage = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Formulario de Asamblea</h1>
                    <p className="text-gray-600 mt-1">Módulo en desarrollo</p>
                </div>
                <Button onClick={() => navigate('/assemblies')} variant="outline">
                    Volver
                </Button>
            </div>

            <Card>
                <div className="text-center py-12">
                    <p className="text-gray-600">Formulario en desarrollo</p>
                </div>
            </Card>
        </div>
    );
};

export default AssemblyFormPage;
