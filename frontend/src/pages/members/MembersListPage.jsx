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
import { GRADES, SECTIONS } from '../../utils/constants';

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
        section: '',
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
                ...(filters.section && { section: filters.section }),
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
            key: 'section',
            label: 'Sección',
            render: (member) => member.section || 'N/A'
        },
        {
            key: 'isActive',
            label: 'Estado',
            render: (member) => (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
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

    const sectionOptions = SECTIONS.map(section => ({
        value: section,
        label: `Sección ${section}`
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
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nuevo Miembro
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
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        label="Sección"
                        name="section"
                        value={filters.section}
                        onChange={(e) => handleFilterChange('section', e.target.value)}
                        options={sectionOptions}
                        placeholder="Todas las secciones"
                    />
                    <Select
                        label="Estado"
                        name="isActive"
                        value={filters.isActive}
                        onChange={(e) => handleFilterChange('isActive', e.target.value)}
                        options={statusOptions}
                    />
                </form>
                <div className="mt-4 flex space-x-2">
                    <Button type="submit" onClick={handleSearch} variant="primary">
                        Buscar
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            setFilters({ search: '', grade: '', section: '', isActive: 'true' });
                            setCurrentPage(1);
                        }}
                        variant="outline"
                    >
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
