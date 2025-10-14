/**
 * MemberFormPage Component
 * Form page for creating and editing cooperative members
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { GRADES } from '../../utils/constants';

const MemberFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        fullName: '',
        identification: '',
        grade: '',
        institutionalEmail: '',
        photoUrl: ''
    });

    useEffect(() => {
        if (isEditMode) {
            fetchMember();
        }
    }, [id]);

    const fetchMember = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get(`/members/${id}`);
            const member = response.data;

            setFormData({
                fullName: member.fullName || '',
                identification: member.identification || '',
                grade: member.grade || '',
                institutionalEmail: member.institutionalEmail || '',
                photoUrl: member.photoUrl || ''
            });
        } catch (err) {
            setError(err.message || 'Error al cargar el miembro');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'El nombre completo es requerido';
        } else if (formData.fullName.length < 3) {
            newErrors.fullName = 'El nombre debe tener al menos 3 caracteres';
        }

        if (!formData.identification.trim()) {
            newErrors.identification = 'La identificación es requerida';
        } else if (!/^[0-9-]+$/.test(formData.identification)) {
            newErrors.identification = 'La identificación solo debe contener números y guiones';
        }

        if (!formData.grade) {
            newErrors.grade = 'El grado es requerido';
        }

        // Solo validar correo institucional en modo creación
        if (!isEditMode) {
            if (!formData.institutionalEmail.trim()) {
                newErrors.institutionalEmail = 'El correo institucional es requerido';
            } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.institutionalEmail)) {
                newErrors.institutionalEmail = 'El formato del correo no es válido';
            } else if (!formData.institutionalEmail.toLowerCase().endsWith('mep.go.cr')) {
                newErrors.institutionalEmail = 'Debe ser un correo institucional del MEP (debe terminar en mep.go.cr)';
            }
        }

        if (formData.photoUrl && !/^https?:\/\/.+/.test(formData.photoUrl)) {
            newErrors.photoUrl = 'La URL de la foto debe ser válida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Por favor corrige los errores en el formulario');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const payload = {
                fullName: formData.fullName.trim(),
                identification: formData.identification.trim(),
                grade: formData.grade,
                photoUrl: formData.photoUrl.trim() || null
            };

            // Solo incluir correo institucional en modo creación
            if (!isEditMode) {
                payload.institutionalEmail = formData.institutionalEmail.trim();
            }

            if (isEditMode) {
                await api.put(`/members/${id}`, payload);
            } else {
                await api.post('/members', payload);
            }

            navigate('/members');
        } catch (err) {
            setError(err.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el miembro`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/members');
    };

    if (loading) {
        return <Loading message="Cargando datos del miembro..." />;
    }

    const gradeOptions = GRADES.map(grade => ({
        value: grade,
        label: `${grade}° grado`
    }));

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Editar Miembro' : 'Nuevo Miembro'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isEditMode
                        ? 'Actualiza la información del miembro'
                        : 'Completa el formulario para agregar un nuevo miembro a la cooperativa'}
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert type="error" message={error} onClose={() => setError('')} />
            )}

            {/* Form */}
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <Input
                        label="Nombre Completo"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        error={errors.fullName}
                        required
                        placeholder="Ej: Juan Pérez Rodríguez"
                    />

                    {/* Identification */}
                    <Input
                        label="Identificación"
                        name="identification"
                        type="text"
                        value={formData.identification}
                        onChange={handleInputChange}
                        error={errors.identification}
                        required
                        placeholder="Ej: 1-2345-6789"
                        disabled={isEditMode} // Cannot change identification in edit mode
                    />

                    {/* Institutional Email - Solo en modo creación */}
                    {!isEditMode && (
                        <Input
                            label="Correo Institucional"
                            name="institutionalEmail"
                            type="email"
                            value={formData.institutionalEmail}
                            onChange={handleInputChange}
                            error={errors.institutionalEmail}
                            required
                            placeholder="Ej: estudiante@educacion.mep.go.cr"
                        />
                    )}

                    {/* Grade */}
                    <Select
                        label="Grado"
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        options={gradeOptions}
                        error={errors.grade}
                        required
                        placeholder="Seleccione el grado"
                    />

                    {/* Photo URL */}
                    <Input
                        label="URL de Foto"
                        name="photoUrl"
                        type="url"
                        value={formData.photoUrl}
                        onChange={handleInputChange}
                        error={errors.photoUrl}
                        placeholder="https://ejemplo.com/foto.jpg (opcional)"
                    />

                    {/* Photo Preview */}
                    {formData.photoUrl && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vista Previa
                            </label>
                            <img
                                src={formData.photoUrl}
                                alt="Vista previa"
                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                        <div className="flex">
                            <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm text-blue-700">
                                    {isEditMode
                                        ? 'Al guardar los cambios, la información del miembro será actualizada.'
                                        : 'Al crear el miembro, se generará automáticamente un código QR único para el registro de asistencia y se creará un usuario estudiante con el correo institucional proporcionado.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                            type="button"
                            onClick={handleCancel}
                            variant="outline"
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                        >
                            {submitting
                                ? (isEditMode ? 'Guardando...' : 'Creando...')
                                : (isEditMode ? 'Guardar Cambios' : 'Crear Miembro')}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default MemberFormPage;
