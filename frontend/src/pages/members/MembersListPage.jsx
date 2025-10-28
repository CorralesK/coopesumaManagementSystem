/**
 * @file MembersListPage.jsx
 * @description Page for displaying and managing the list of cooperative members
 * @module pages/members
 */

import React, { useState } from 'react';
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
import { GRADES } from '../../utils/constants';

/**
 * MembersListPage Component
 * Displays a paginated list of members with filtering capabilities
 */
const MembersListPage = () => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [showBatchQrModal, setShowBatchQrModal] = useState(false);

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

    // Event handlers
    const handleFilterChange = (field, value) => {
        updateFilters({ [field]: value });
    };

    const handleDeactivateMember = async (memberId) => {
        if (!window.confirm('¿Estás seguro de que deseas desactivar este miembro?')) {
            return;
        }

        try {
            await deactivate(memberId);
            setSuccessMessage('Miembro desactivado exitosamente');
            refetch();
        } catch (err) {
            // Error already handled by hook
        }
    };

    // Table columns configuration
    const tableColumns = [
        {
            key: 'fullName',
            label: 'Nombre Completo',
            render: (member) => (
                <div className="flex items-center">
                    {member.photoUrl && (
                        <img
                            src={member.photoUrl}
                            alt={member.fullName}
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                    )}
                    <button
                        onClick={() => navigate(`/members/${member.memberId}`)}
                        className="font-medium text-primary-600 hover:text-primary-800 hover:underline text-left"
                    >
                        {member.fullName}
                    </button>
                </div>
            )
        },
        {
            key: 'identification',
            label: 'Identificación'
        },
        {
            key: 'grade',
            label: 'Grado',
            render: (member) => `${member.grade}° grado`
        },
        {
            key: 'isActive',
            label: 'Estado',
            render: (member) => (
                <div className="flex items-center justify-center">
                    <span className={`inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                        member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
                <div className="inline-flex items-center justify-center gap-2 my-2">
                    <Button onClick={() => navigate(`/members/${member.memberId}/edit`)} variant="outline" size="sm">
                        Editar
                    </Button>
                    {member.isActive && (
                        <Button onClick={() => handleDeactivateMember(member.memberId)} variant="danger" size="sm" disabled={deactivating}>
                            Desactivar
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const gradeOptions = GRADES.map(grade => ({ value: grade, label: `${grade}° grado` }));
    const statusOptions = [
        { value: '', label: 'Todos' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
    ];

    if (loading && members.length === 0) {
        return <Loading message="Cargando miembros..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Miembros</h1>
                <Button onClick={() => navigate('/members/new')} variant="primary" className="whitespace-nowrap w-full sm:w-auto">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Agregar Miembro
                </Button>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => {}} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Filters */}
            <Card title="Filtros de Búsqueda">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Buscar"
                        name="search"
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="Nombre o identificación..."
                    />
                    <Select
                        label="Grado"
                        name="grade"
                        value={filters.grade}
                        onChange={(e) => handleFilterChange('grade', e.target.value)}
                        options={gradeOptions}
                        placeholder="Todos los grados"
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
                        Imprimir QR en Lote
                    </Button>
                </div>
            </Card>

            {/* Members Table */}
            <Card>
                {loading ? (
                    <Loading message="Cargando..." />
                ) : (
                    <>
                        <Table columns={tableColumns} data={members} emptyMessage="No se encontraron miembros" />
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </Card>

            {/* Batch QR Print Modal */}
            <BatchQrPrintModal
                isOpen={showBatchQrModal}
                onClose={() => setShowBatchQrModal(false)}
                members={members}
                filterGrade={filters.grade}
            />
        </div>
    );
};

export default MembersListPage;
