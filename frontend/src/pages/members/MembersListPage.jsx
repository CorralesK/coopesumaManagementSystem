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
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
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
    } = useMembers({ isActive: '', limit: 20 });

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

    const handleDeleteMember = async (memberId, memberName) => {
        const confirmed = window.confirm(
            `¿Estás seguro de que deseas ELIMINAR a ${memberName}?\n\n` +
            `Esta acción iniciará el proceso de liquidación por retiro del miembro.\n` +
            `Esta acción no se puede deshacer.`
        );

        if (!confirmed) {
            return;
        }

        try {
            await deactivate(memberId);
            setSuccessMessage('Miembro eliminado. Proceso de liquidación iniciado.');
            refetch();
        } catch (err) {
            // Error already handled by hook
        }
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
                            onClick={() => handleDeleteMember(member.memberId, member.fullName)}
                            variant="danger"
                            size="sm"
                            disabled={deactivating}
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
                        <Button onClick={() => resetFilters()} variant="outline" size="md" className="whitespace-nowrap">
                            Limpiar Filtros
                        </Button>
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
        </div>
    );
};

export default MembersListPage;
