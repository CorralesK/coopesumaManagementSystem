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
        description: '',
        scheduledDate: '',
        location: ''
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');

    // Load assembly data in edit mode
    useEffect(() => {
        if (assembly && isEditMode) {
            setFormData({
                title: assembly.title || '',
                description: assembly.description || '',
                scheduledDate: assembly.scheduledDate ? assembly.scheduledDate.split('T')[0] : '',
                location: assembly.location || ''
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

        if (!formData.location.trim()) {
            newErrors.location = 'La ubicación es requerida';
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
                description: formData.description.trim(),
                scheduledDate: new Date(formData.scheduledDate).toISOString(),
                location: formData.location.trim()
            };

            if (isEditMode) {
                await update(id, payload);
            } else {
                await create(payload);
            }

            navigate('/assemblies');
        } catch (err) {
            setFormError(err.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} la asamblea`);
        }
    };

    if (loadingAssembly) {
        return <Loading message="Cargando datos de la asamblea..." />;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Editar Asamblea' : 'Nueva Asamblea'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isEditMode ? 'Actualiza la información de la asamblea' : 'Completa el formulario para crear una nueva asamblea'}
                </p>
            </div>

            {/* Error Alert */}
            {(formError || operationError) && (
                <Alert type="error" message={formError || operationError} onClose={() => { setFormError(''); }} />
            )}

            {/* Form */}
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Título"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        error={errors.title}
                        required
                        placeholder="Ej: Asamblea Mensual - Enero 2025"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Descripción de la asamblea..."
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    <Input
                        label="Fecha Programada"
                        name="scheduledDate"
                        type="date"
                        value={formData.scheduledDate}
                        onChange={handleInputChange}
                        error={errors.scheduledDate}
                        required
                    />

                    <Input
                        label="Ubicación"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        error={errors.location}
                        required
                        placeholder="Ej: Aula Principal - Sede San Carlos"
                    />

                    {/* Info Box */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm text-blue-700">
                                    {isEditMode
                                        ? 'Los cambios se aplicarán inmediatamente. Si la asamblea está activa, permanecerá activa después de la edición.'
                                        : 'La asamblea será creada con estado "Programada". Deberás activarla manualmente cuando estés listo para el registro de asistencia.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button type="button" onClick={() => navigate('/assemblies')} variant="outline" disabled={submitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting}>
                            {submitting ? (isEditMode ? 'Guardando...' : 'Creando...') : (isEditMode ? 'Guardar Cambios' : 'Crear Asamblea')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AssemblyFormPage;
