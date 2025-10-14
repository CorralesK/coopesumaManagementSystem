/**
 * MembersListPage Component
 * Page for displaying and managing the list of cooperative members
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { GRADES } from '../../utils/constants';

const MembersListPage = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Filters and pagination
    const [filters, setFilters] = useState({
        search: '',
        grade: '',
        isActive: 'true'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMembers, setTotalMembers] = useState(0);

    useEffect(() => {
        fetchMembers();
    }, [currentPage, filters]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError('');

            const params = {
                page: currentPage,
                limit: 20,
                ...(filters.search && { search: filters.search }),
                ...(filters.grade && { grade: filters.grade }),
                ...(filters.isActive && { isActive: filters.isActive })
            };

            const response = await api.get('/members', { params });

            setMembers(response.data || []);
            setTotalPages(response.pagination?.totalPages || 1);
            setTotalMembers(response.pagination?.total || 0);
        } catch (err) {
            setError(err.message || 'Error al cargar los miembros');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchMembers();
    };

    const handleViewMember = (member) => {
        navigate(`/members/${member.memberId}`);
    };

    const handleEditMember = (member) => {
        navigate(`/members/${member.memberId}/edit`);
    };

    const handleDeactivateMember = async (memberId) => {
        if (!window.confirm('¿Estás seguro de que deseas desactivar este miembro?')) {
            return;
        }

        try {
            await api.delete(`/members/${memberId}`);
            setSuccessMessage('Miembro desactivado exitosamente');
            fetchMembers();
        } catch (err) {
            setError(err.message || 'Error al desactivar el miembro');
        }
    };

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
                    <span className="font-medium">{member.fullName}</span>
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
                <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                    member.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {member.isActive ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (member) => (
                <div className="flex space-x-2">
                    <Button
                        onClick={() => handleViewMember(member)}
                        variant="ghost"
                        size="sm"
                    >
                        Ver
                    </Button>
                    <Button
                        onClick={() => handleEditMember(member)}
                        variant="outline"
                        size="sm"
                    >
                        Editar
                    </Button>
                    {member.isActive && (
                        <Button
                            onClick={() => handleDeactivateMember(member.memberId)}
                            variant="danger"
                            size="sm"
                        >
                            Desactivar
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const gradeOptions = GRADES.map(grade => ({
        value: grade,
        label: `${grade}° grado`
    }));

    const statusOptions = [
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' },
        { value: '', label: 'Todos' }
    ];

    if (loading && members.length === 0) {
        return <Loading message="Cargando miembros..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gestión de Miembros
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Total: {totalMembers} miembro{totalMembers !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/members/new')}
                    variant="primary"
                    className="whitespace-nowrap"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Agregar Miembro
                </Button>
            </div>

            {/* Alerts */}
            {error && (
                <Alert type="error" message={error} onClose={() => setError('')} />
            )}
            {successMessage && (
                <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
            )}

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
                    />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                        onClick={handleSearch}
                        variant="primary"
                        size="md"
                        className="whitespace-nowrap"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar
                    </Button>
                    <Button
                        onClick={() => {
                            setFilters({ search: '', grade: '', isActive: 'true' });
                            setCurrentPage(1);
                        }}
                        variant="outline"
                        size="md"
                        className="whitespace-nowrap"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Limpiar Filtros
                    </Button>
                </div>
            </Card>

            {/* Members Table */}
            <Card>
                {loading ? (
                    <Loading message="Cargando..." />
                ) : (
                    <>
                        <Table
                            columns={tableColumns}
                            data={members}
                            emptyMessage="No se encontraron miembros"
                        />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </Card>
        </div>
    );
};

export default MembersListPage;
