/**
 * DashboardPage Component
 * Main dashboard showing system statistics and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import { USER_ROLES } from '../utils/constants';

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        activeAssembly: null,
        recentAttendance: 0
    });

    const isAdministrator = user?.role === USER_ROLES.ADMINISTRATOR;
    const isRegistrar = user?.role === USER_ROLES.REGISTRAR;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch active assembly
            let activeAssembly = null;
            try {
                const assemblyResponse = await api.get('/assemblies/active');
                activeAssembly = assemblyResponse.data;
            } catch (err) {
                // No active assembly is not an error
                if (err.statusCode !== 404) {
                    throw err;
                }
            }

            // Fetch member statistics (only for admin)
            let totalMembers = 0;
            let activeMembers = 0;
            if (isAdministrator) {
                try {
                    const membersResponse = await api.get('/members?page=1&limit=1');
                    totalMembers = membersResponse.pagination?.total || 0;

                    const activeMembersResponse = await api.get('/members?isActive=true&page=1&limit=1');
                    activeMembers = activeMembersResponse.pagination?.total || 0;
                } catch (err) {
                    console.error('Error fetching member stats:', err);
                }
            }

            // Fetch recent attendance count if there's an active assembly
            let recentAttendance = 0;
            if (activeAssembly) {
                try {
                    const attendanceResponse = await api.get(`/attendance/assembly/${activeAssembly.assemblyId}/stats`);
                    recentAttendance = attendanceResponse.data?.totalAttendance || 0;
                } catch (err) {
                    console.error('Error fetching attendance stats:', err);
                }
            }

            setStats({
                totalMembers,
                activeMembers,
                activeAssembly,
                recentAttendance
            });
        } catch (err) {
            setError(err.message || 'Error al cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading message="Cargando dashboard..." />;
    }

    return (
        <div className="space-y-10">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                    Bienvenido, {user?.fullName}
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                    {isAdministrator && 'Panel de administración del sistema CoopeSuma'}
                    {isRegistrar && 'Panel de registro de asistencia'}
                </p>
            </div>

            {error && (
                <Alert type="error" message={error} onClose={() => setError('')} />
            )}

            {/* Active Assembly Alert */}
            {stats.activeAssembly ? (
                <Alert
                    type="info"
                    title="Asamblea Activa"
                    message={`"${stats.activeAssembly.title}" - ${new Date(stats.activeAssembly.scheduledDate).toLocaleDateString('es-CR')}`}
                />
            ) : (
                isAdministrator && (
                    <Alert
                        type="warning"
                        title="No hay asamblea activa"
                        message="Debes activar una asamblea para poder registrar asistencia"
                    />
                )
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(isAdministrator || isRegistrar) && stats.activeAssembly && (
                    <Card className="border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Registrar Asistencia
                                </h3>
                                <p className="text-sm text-gray-600 mb-5">
                                    Escanear código QR de miembros
                                </p>
                                <Button
                                    onClick={() => navigate('/attendance/scan')}
                                    variant="primary"
                                    size="sm"
                                >
                                    Escanear QR
                                </Button>
                            </div>
                            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                    </Card>
                )}

                {isAdministrator && (
                    <>
                        <Card className="border-l-4 border-l-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Gestionar Miembros
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Crear, editar y administrar miembros
                                    </p>
                                    <Button
                                        onClick={() => navigate('/members')}
                                        variant="success"
                                        size="sm"
                                    >
                                        Ver Miembros
                                    </Button>
                                </div>
                                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Asambleas
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Crear y administrar asambleas
                                    </p>
                                    <Button
                                        onClick={() => navigate('/assemblies')}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Ver Asambleas
                                    </Button>
                                </div>
                                <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            {/* Statistics Cards (Admin Only) */}
            {isAdministrator && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Card padding="normal">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Miembros</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="normal">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Miembros Activos</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="normal">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Asamblea Activa</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.activeAssembly ? '1' : '0'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card padding="normal">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Asistencias Hoy</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.recentAttendance}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Quick Links */}
            {isAdministrator && (
                <Card title="Accesos Rápidos">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <Button
                            onClick={() => navigate('/members/new')}
                            variant="outline"
                            fullWidth
                        >
                            Nuevo Miembro
                        </Button>
                        <Button
                            onClick={() => navigate('/assemblies/new')}
                            variant="outline"
                            fullWidth
                        >
                            Nueva Asamblea
                        </Button>
                        <Button
                            onClick={() => navigate('/reports')}
                            variant="outline"
                            fullWidth
                        >
                            Generar Reporte
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default DashboardPage;
