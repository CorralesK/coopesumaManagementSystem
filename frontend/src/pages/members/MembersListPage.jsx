/**
 * @file MembersListPage.jsx
 * @description Page for displaying and managing the list of cooperative members
 * @module pages/members
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMembers, useMemberOperations } from '../../hooks/useMembers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ClearFiltersButton from '../../components/common/ClearFiltersButton';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import BatchQrPrintModal from '../../components/members/BatchQrPrintModal';
import { getAllQualities, getAllLevels } from '../../services/catalogService';

/**
 * MembersListPage Component
 * Displays a paginated list of members with filtering capabilities
 */
const MembersListPage = () => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [showBatchQrModal, setShowBatchQrModal] = useState(false);

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // Catalog state
    const [qualities, setQualities] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);

    // Use custom hooks for members management
    const {
        members,
        loading,
        error,
        filters,
        pagination,
        updateFilters,
        setPage,
        resetFilters,
        refetch
    } = useMembers({ isActive: '', limit: 10 });

    const { deactivate, loading: deactivating } = useMemberOperations();

    // Load catalogs
    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                const [qualitiesData, levelsData] = await Promise.all([
                    getAllQualities(),
                    getAllLevels()
                ]);

                setQualities(qualitiesData);
                setLevels(levelsData);
                setLoadingCatalogs(false);
            } catch (error) {
                setLoadingCatalogs(false);
            }
        };
        loadCatalogs();
    }, []);

    // Event handlers
    const handleFilterChange = (field, value) => {
        updateFilters({ [field]: value });
    };

    const handleDeleteMember = (memberId, memberName, memberCode, savingsBalance) => {
        setMemberToDelete({ memberId, memberName, memberCode, savingsBalance });
        setShowDeleteModal(true);
    };

    const handleContinueToDetail = () => {
        if (!memberToDelete) return;
        // Navigate to member detail page where the full liquidation process will occur
        navigate(`/members/${memberToDelete.memberId}?action=delete`);
    };

    // Table columns configuration
    const tableColumns = [
        {
            key: 'memberCode',
            label: 'Código',
            render: (member) => (
                <div className="text-center">
                    <span className="text-sm font-medium text-gray-900">
                        {member.memberCode || '-'}
                    </span>
                </div>
            )
        },
        {
            key: 'fullName',
            label: 'Miembro',
            render: (member) => (
                <div className="text-left">
                    <div className="flex items-center gap-3">
                        {member.photoUrl && (
                            <img
                                src={member.photoUrl}
                                alt={member.fullName}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                        )}
                        <div className="flex flex-col">
                            <button
                                onClick={() => navigate(`/members/${member.memberId}`)}
                                className="font-semibold text-sm sm:text-base text-primary-600 hover:text-primary-700 text-left break-words cursor-pointer"
                            >
                                {member.fullName}
                            </button>
                            <span className="text-xs text-gray-500">{member.identification}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'quality',
            label: 'Calidad / Nivel',
            render: (member) => (
                <div className="text-left">
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">
                            {member.qualityName}
                        </span>
                        {member.levelName && member.levelName !== 'N/A' && member.levelName !== 'No aplica' && (
                            <span className="text-xs text-gray-500">Nivel {member.levelName}</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'isActive',
            label: 'Estado',
            render: (member) => (
                <div className="flex items-center justify-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                        member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {member.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (member) => (
                <div className="flex items-center justify-center gap-2">
                    {member.isActive && (
                        <Button
                            onClick={() => handleDeleteMember(member.memberId, member.fullName, member.memberCode, member.savingsBalance)}
                            variant="danger"
                            size="sm"
                            className="!px-2 sm:!px-3"
                        >
                            <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Eliminar</span>
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const qualityOptions = [
        ...qualities.map(q => ({
            value: q.qualityId,
            label: q.qualityName
        }))
    ];

    const levelOptions = [
        ...levels.map(l => ({
            value: l.levelId,
            label: l.levelName
        }))
    ];

    const statusOptions = [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
    ];

    if ((loading && members.length === 0) || loadingCatalogs) {
        return <Loading message="Cargando miembros..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Miembros</h1>
                <Button onClick={() => navigate('/members/new')} variant="primary" className="whitespace-nowrap w-full sm:w-auto">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Afiliar Miembro
                </Button>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Filters and Table Container */}
            <div className="space-y-0">
                {/* Filters */}
                <Card title="Filtros de Búsqueda">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            label="Buscar"
                            name="search"
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            onClear={() => handleFilterChange('search', '')}
                            placeholder="Nombre o identificación..."
                        />
                        <Select
                            label="Calidad"
                            name="qualityId"
                            value={filters.qualityId}
                            onChange={(e) => handleFilterChange('qualityId', e.target.value)}
                            options={qualityOptions}
                            placeholder="Todas las calidades"
                        />
                        <Select
                            label="Nivel"
                            name="levelId"
                            value={filters.levelId}
                            onChange={(e) => handleFilterChange('levelId', e.target.value)}
                            options={levelOptions}
                            placeholder="Todos los niveles"
                        />
                        <Select
                            label="Estado"
                            name="isActive"
                            value={filters.isActive}
                            onChange={(e) => handleFilterChange('isActive', e.target.value)}
                            options={statusOptions}
                            placeholder=""
                        />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <ClearFiltersButton
                            show={filters.search || filters.qualityId || filters.levelId || filters.isActive}
                            onClick={() => resetFilters()}
                        />
                        <Button
                            onClick={() => setShowBatchQrModal(true)}
                            variant="secondary"
                            size="md"
                            className="whitespace-nowrap"
                            disabled={members.length === 0}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            Imprimir QR en lote
                        </Button>
                    </div>
                </Card>

                {/* Members Table */}
                <Card padding="none">
                {loading ? (
                    <div className="py-8">
                        <Loading message="Cargando..." />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table columns={tableColumns} data={members} emptyMessage="No se encontraron miembros" />
                        </div>
                        <div className="px-4 py-3">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    </>
                )}
            </Card>
            </div>

            {/* Batch QR Print Modal */}
            <BatchQrPrintModal
                isOpen={showBatchQrModal}
                onClose={() => setShowBatchQrModal(false)}
                members={members}
                filterQualityId={filters.qualityId}
                filterLevelId={filters.levelId}
            />

            {/* Delete Confirmation Modal */}
            {memberToDelete && (
                <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Eliminar Miembro" size="lg">
                    <div className="space-y-6">
                        {/* Member Info with Balance */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>Miembro:</strong> {memberToDelete.memberName} ({memberToDelete.memberCode})
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                                <strong>Saldo actual:</strong> ₡{parseFloat(memberToDelete.savingsBalance || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-red-700">
                                    <p className="font-semibold mb-2">¿Estás seguro de que deseas ELIMINAR a {memberToDelete.memberName}?</p>
                                    <p>Esta acción ejecutará la liquidación por retiro del miembro.</p>
                                </div>
                            </div>
                        </div>

                        {/* Info about the process */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-blue-700">
                                    <p className="font-semibold mb-1">El proceso incluye:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Liquidación de la cuenta de ahorros</li>
                                        <li>Desactivación del miembro y su usuario</li>
                                        <li>Generación de recibo de liquidación</li>
                                    </ul>
                                    <p className="mt-2 font-semibold text-red-700">Esta acción NO se puede deshacer.</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setMemberToDelete(null);
                                }}
                                variant="outline"
                                className="w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleContinueToDetail}
                                variant="primary"
                                className="w-full sm:w-auto"
                            >
                                Continuar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default MembersListPage;
