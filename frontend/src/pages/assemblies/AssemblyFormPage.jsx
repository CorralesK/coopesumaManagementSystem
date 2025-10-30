/**
 * @file AssemblyFormPage.jsx
 * @description Form page for creating and editing assemblies
 * @module pages/assemblies
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAssembly, useAssemblyOperations } from '../../hooks/useAssemblies';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

/**
 * AssemblyFormPage Component
 * Handles both creation and editing of assemblies
 */
const AssemblyFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    // Use custom hooks
    const { assembly, loading: loadingAssembly } = useAssembly(id);
    const { create, update, loading: submitting, error: operationError } = useAssemblyOperations();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        scheduledDate: ''
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');

    // Load assembly data in edit mode
    useEffect(() => {
        if (assembly && isEditMode) {
            setFormData({
                title: assembly.title || '',
                scheduledDate: assembly.scheduledDate ? assembly.scheduledDate.split('T')[0] : ''
            });
        }
    }, [assembly, isEditMode]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        } else if (formData.title.length < 5) {
            newErrors.title = 'El título debe tener al menos 5 caracteres';
        }

        if (!formData.scheduledDate) {
            newErrors.scheduledDate = 'La fecha es requerida';
        } else {
            const selectedDate = new Date(formData.scheduledDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today && !isEditMode) {
                newErrors.scheduledDate = 'La fecha no puede ser anterior a hoy';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setFormError('Por favor corrige los errores en el formulario');
            return;
        }

        try {
            setFormError('');

            const payload = {
                title: formData.title.trim(),
                scheduledDate: new Date(formData.scheduledDate).toISOString()
            };

            if (isEditMode) {
                await update(id, payload);
                navigate(`/assemblies/${id}`);
            } else {
                await create(payload);
                navigate('/assemblies');
            }
        } catch (err) {
            setFormError(err.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} la asamblea`);
        }
    };

    if (loadingAssembly) {
        return <Loading message="Cargando datos de la asamblea..." />;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Editar Asamblea' : 'Agregar Asamblea'}
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        {isEditMode ? 'Actualiza la información de la asamblea' : 'Completa el formulario para crear una nueva asamblea'}
                    </p>
                </div>
            </div>

            {/* Error Alert */}
            {(formError || operationError) && (
                <Alert type="error" message={formError || operationError} onClose={() => { setFormError(''); }} />
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Card */}
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Información de la Asamblea */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Asamblea</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input
                                    label="Título"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    error={errors.title}
                                    required
                                    placeholder="Ej: Asamblea Mensual - Enero 2025"
                                />

                                <Input
                                    label="Fecha Programada"
                                    name="scheduledDate"
                                    type="date"
                                    value={formData.scheduledDate}
                                    onChange={handleInputChange}
                                    error={errors.scheduledDate}
                                    required
                                />
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Info Box */}
                        <div className="bg-primary-50 border-l-4 border-primary-500 p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-sm text-primary-700">
                                        {isEditMode
                                            ? 'Los cambios se aplicarán inmediatamente. Si la asamblea está activa, permanecerá activa después de la edición.'
                                            : 'La asamblea será creada con estado "Programada". Deberás activarla manualmente cuando estés listo para el registro de asistencia.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                        type="button"
                        onClick={() => navigate(isEditMode ? `/assemblies/${id}` : '/assemblies')}
                        variant="outline"
                        disabled={submitting}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                        className="w-full sm:w-auto"
                    >
                        {submitting ? (isEditMode ? 'Guardando...' : 'Creando...') : (isEditMode ? 'Guardar Cambios' : 'Crear Asamblea')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AssemblyFormPage;
