/**
 * @file MemberFormPage.jsx
 * @description Form page for creating and editing cooperative members
 * @module pages/members
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMember, useMemberOperations } from '../../hooks/useMembers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAllQualities, getAllLevels } from '../../services/catalogService';
import { MEMBER_QUALITIES } from '../../utils/constants';
import { printAffiliationReceipt } from '../../utils/printUtils';

/**
 * MemberFormPage Component
 * Handles both creation and editing of members
 */
const MemberFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    // Use custom hooks
    const { member, loading: loadingMember } = useMember(id);
    const { affiliate, update, loading: submitting, error: operationError } = useMemberOperations();

    // Catalog state
    const [qualities, setQualities] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        identification: '',
        qualityId: '',
        levelId: '',
        gender: '',
        institutionalEmail: '',
        photoUrl: ''
    });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');

    // Load catalogs
    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                const qualitiesData = await getAllQualities();
                setQualities(qualitiesData);
                setLoadingCatalogs(false);
            } catch (error) {
                setFormError('Error al cargar los catálogos');
                setLoadingCatalogs(false);
            }
        };
        loadCatalogs();
    }, []);

    // Load levels when quality changes
    useEffect(() => {
        const loadLevels = async () => {
            if (!formData.qualityId) {
                setLevels([]);
                return;
            }

            try {
                const quality = qualities.find(q => q.qualityId === parseInt(formData.qualityId));
                if (quality && quality.qualityCode) {
                    const levelsData = await getAllLevels(quality.qualityCode);
                    setLevels(levelsData);
                } else {
                    setLevels([]);
                }
            } catch (error) {
                setLevels([]);
            }
        };
        loadLevels();
    }, [formData.qualityId, qualities]);

    // Load member data in edit mode
    useEffect(() => {
        if (member && isEditMode) {
            setFormData({
                fullName: member.fullName || '',
                identification: member.identification || '',
                qualityId: member.qualityId || '',
                levelId: member.levelId || '',
                gender: member.gender || '',
                institutionalEmail: member.institutionalEmail || '',
                photoUrl: member.photoUrl || ''
            });
        }
    }, [member, isEditMode]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // If changing quality, reset level
        if (name === 'qualityId') {
            setFormData(prev => ({ ...prev, [name]: value, levelId: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
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

        if (!formData.qualityId) {
            newErrors.qualityId = 'La calidad es requerida';
        }

        // Level is optional for employees, required for students
        if (parseInt(formData.qualityId) === MEMBER_QUALITIES.STUDENT && !formData.levelId) {
            newErrors.levelId = 'El nivel es requerido para estudiantes';
        }

        if (!formData.institutionalEmail.trim()) {
            newErrors.institutionalEmail = 'El correo institucional es requerido';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.institutionalEmail)) {
            newErrors.institutionalEmail = 'El formato del correo no es válido';
        } else if (!formData.institutionalEmail.toLowerCase().endsWith('mep.go.cr')) {
            newErrors.institutionalEmail = 'Debe ser un correo institucional del MEP';
        }

        if (formData.photoUrl && !/^https?:\/\/.+/.test(formData.photoUrl)) {
            newErrors.photoUrl = 'La URL de la foto debe ser válida';
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
                fullName: formData.fullName.trim(),
                identification: formData.identification.trim(),
                institutionalEmail: formData.institutionalEmail.trim(),
                qualityId: parseInt(formData.qualityId),
                levelId: formData.levelId ? parseInt(formData.levelId) : null,
                gender: formData.gender || null,
                photoUrl: formData.photoUrl.trim() || null
            };

            if (isEditMode) {
                await update(id, payload);
                navigate(`/members/${id}`);
            } else {
                const result = await affiliate(payload);

                // Print affiliation receipt if available
                if (result?.data?.member && result?.data?.receipt) {
                    try {
                        printAffiliationReceipt({
                            member: result.data.member,
                            amount: result.data.receipt.amount || 500,
                            receiptNumber: result.data.receipt.receiptNumber,
                            date: result.data.receipt.date || new Date(),
                            fiscalYear: result.data.receipt.fiscalYear
                        });
                    } catch (receiptError) {
                        console.error('Error printing receipt:', receiptError);
                        // Don't fail the whole operation if receipt printing fails
                    }
                }

                navigate('/members');
            }
        } catch (err) {
            setFormError(err.message || `Error al ${isEditMode ? 'actualizar' : 'afiliar'} el miembro`);
        }
    };

    if (loadingMember || loadingCatalogs) {
        return <Loading message="Cargando datos..." />;
    }

    const qualityOptions = qualities.map(q => ({
        value: q.qualityId,
        label: q.qualityName
    }));

    const levelOptions = levels.map(l => ({
        value: l.levelId,
        label: l.levelName
    }));

    const genderOptions = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Editar Miembro' : 'Afiliar Miembro'}
                    </h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        {isEditMode ? 'Actualiza la información del miembro' : 'Completa el formulario de afiliación (Cuota: ₡500)'}
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
                    <div className="flex flex-col gap-6">
                        {/* Información Personal */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Input
                                    label="Nombre Completo"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    error={errors.fullName}
                                    required
                                    placeholder="Ej: Juan Pérez Rodríguez"
                                />

                                <Input
                                    label="Identificación"
                                    name="identification"
                                    value={formData.identification}
                                    onChange={handleInputChange}
                                    error={errors.identification}
                                    required
                                    placeholder="Ej: 1-2345-6789"
                                    disabled={isEditMode}
                                />

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

                                <Select
                                    label="Calidad"
                                    name="qualityId"
                                    value={formData.qualityId}
                                    onChange={handleInputChange}
                                    options={qualityOptions}
                                    error={errors.qualityId}
                                    required
                                    placeholder="Seleccione la calidad"
                                />

                                <Select
                                    label="Nivel"
                                    name="levelId"
                                    value={formData.levelId}
                                    onChange={handleInputChange}
                                    options={levelOptions}
                                    error={errors.levelId}
                                    required={parseInt(formData.qualityId) === MEMBER_QUALITIES.STUDENT}
                                    placeholder="Seleccione el nivel"
                                    disabled={!formData.qualityId || levels.length === 0}
                                />

                                <Select
                                    label="Género"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    options={genderOptions}
                                    error={errors.gender}
                                    placeholder="Seleccione el género (opcional)"
                                />
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Fotografía */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Fotografía</h2>
                            <Input
                                label="URL de Foto"
                                name="photoUrl"
                                type="url"
                                value={formData.photoUrl}
                                onChange={handleInputChange}
                                error={errors.photoUrl}
                                placeholder="https://ejemplo.com/foto.jpg (opcional)"
                            />

                            {formData.photoUrl && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa</label>
                                    <img
                                        src={formData.photoUrl}
                                        alt="Vista previa"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                        type="button"
                        onClick={() => navigate(isEditMode ? `/members/${id}` : '/members')}
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
                        {submitting ? (isEditMode ? 'Guardando...' : 'Afiliando...') : (isEditMode ? 'Guardar Cambios' : 'Afiliar Miembro (₡500)')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MemberFormPage;
