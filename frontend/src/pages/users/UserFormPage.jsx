/**
 * @file UserFormPage.jsx
 * @description Form page for creating and editing users
 * @module pages/users
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser, useUserOperations } from '../../hooks/useUsers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { USER_ROLES } from '../../utils/constants';

/**
 * UserFormPage Component
 * Handles both creation and editing of users
 */
const UserFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    // Use custom hooks
    const { user, loading: loadingUser } = useUser(id);
    const { create, update, loading: submitting, error: operationError } = useUserOperations();

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: USER_ROLES.STUDENT
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Load user data in edit mode
    useEffect(() => {
        if (user && isEditMode) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                role: user.role || USER_ROLES.STUDENT
            });
        }
    }, [user, isEditMode]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre completo es requerido';
        } else if (formData.fullName.length < 3) {
            newErrors.fullName = 'El nombre debe tener al menos 3 caracteres';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'El formato del correo electrónico no es válido';
        }

        if (!formData.role) {
            newErrors.role = 'El rol es requerido';
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
            setSuccessMessage('');

            const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                role: formData.role
            };

            if (isEditMode) {
                await update(id, payload);
                setSuccessMessage('Usuario actualizado exitosamente');
                // Wait a moment before redirecting to show the success message
                setTimeout(() => navigate('/users'), 1500);
            } else {
                await create(payload);
                setSuccessMessage('Usuario creado exitosamente');
                setTimeout(() => navigate('/users'), 1500);
            }
        } catch (err) {
            setFormError(err.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el usuario`);
        }
    };

    // Role options
    const roleOptions = [
        { value: USER_ROLES.ADMINISTRATOR, label: 'Administrador' },
        { value: USER_ROLES.REGISTRAR, label: 'Registrador' },
        { value: USER_ROLES.TREASURER, label: 'Tesorero' },
        { value: USER_ROLES.STUDENT, label: 'Estudiante' }
    ];

    if (loadingUser) {
        return <Loading message="Cargando datos del usuario..." />;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Editar Usuario' : 'Agregar Usuario'}
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        {isEditMode ? 'Actualiza la información del usuario' : 'Completa el formulario para crear un nuevo usuario'}
                    </p>
                </div>
            </div>

            {/* Success Alert */}
            {successMessage && (
                <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
            )}

            {/* Error Alert */}
            {(formError || operationError) && (
                <Alert type="error" message={formError || operationError} onClose={() => { setFormError(''); }} />
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Card */}
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Información del Usuario */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input
                                    label="Nombre Completo"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    error={errors.fullName}
                                    required
                                    placeholder="Ej: Juan Pérez García"
                                    maxLength={100}
                                    minLength={3}
                                />

                                <Input
                                    label="Correo Electrónico"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    error={errors.email}
                                    required
                                    placeholder="Ej: juan.perez@example.com"
                                    maxLength={255}
                                />
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Rol y Permisos */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rol y Permisos</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <Select
                                    label="Rol del Usuario"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    options={roleOptions}
                                    error={errors.role}
                                    required
                                />
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Role Descriptions */}
                        <div className="bg-primary-50 border-l-4 border-primary-500 p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-primary-700">
                                    <p className="font-semibold mb-2">Descripción de Roles:</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li><strong>Administrador:</strong> Acceso completo al sistema</li>
                                        <li><strong>Registrador:</strong> Puede registrar asistencia a asambleas</li>
                                        <li><strong>Tesorero:</strong> Acceso a reportes y estadísticas</li>
                                        <li><strong>Estudiante:</strong> Acceso limitado a su propia información</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Info Box for New Users */}
                        {!isEditMode && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4">
                                <div className="flex">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-green-700">
                                        <p>
                                            El usuario será creado con estado activo. La autenticación se realiza mediante Microsoft OAuth,
                                            por lo que el usuario debe iniciar sesión con su cuenta de Microsoft asociada al correo proporcionado.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button
                        type="button"
                        onClick={() => navigate('/users')}
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
                        {submitting ? (isEditMode ? 'Guardando...' : 'Creando...') : (isEditMode ? 'Guardar Cambios' : 'Crear Usuario')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UserFormPage;
