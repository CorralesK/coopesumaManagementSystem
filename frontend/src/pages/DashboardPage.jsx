/**
 * @file DashboardPage.jsx
 * @description Admin dashboard with key metrics and quick actions
 * @module pages
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useActiveAssembly } from '../hooks/useAssemblies';
import { useMembers } from '../hooks/useMembers';
import { useAssemblyAttendance } from '../hooks/useAttendance';
import { useDashboard } from '../hooks/useDashboard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import { USER_ROLES } from '../utils/constants';

/**
 * Format currency in Costa Rican Colones
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
};

/**
 * Format date in Spanish
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Stat Card Component
 */
const StatCard = ({ title, value, subtitle, icon, color = 'primary', onClick }) => {
    const colorClasses = {
        primary: 'bg-primary-100 text-primary-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600'
    };

    const borderColors = {
        primary: 'border-l-primary-500',
        green: 'border-l-green-500',
        purple: 'border-l-purple-500',
        orange: 'border-l-orange-500',
        red: 'border-l-red-500'
    };

    return (
        <Card
            className={`border-l-4 ${borderColors[color]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            padding="normal"
        >
            <div
                className="flex items-center justify-between"
                onClick={onClick}
                role={onClick ? 'button' : undefined}
                tabIndex={onClick ? 0 : undefined}
            >
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`flex-shrink-0 rounded-lg p-3 ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

/**
 * Quick Action Card Component
 */
const QuickActionCard = ({ title, description, buttonText, onClick, icon, color = 'primary' }) => {
    const borderColors = {
        primary: 'border-l-primary-500',
        green: 'border-l-green-500',
        purple: 'border-l-purple-500',
        orange: 'border-l-orange-500'
    };

    const buttonVariants = {
        primary: 'primary',
        green: 'success',
        purple: 'secondary',
        orange: 'warning'
    };

    const iconColors = {
        primary: 'text-primary-500',
        green: 'text-green-500',
        purple: 'text-purple-500',
        orange: 'text-orange-500'
    };

    return (
        <Card className={`border-l-4 ${borderColors[color]}`} padding="normal">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{description}</p>
                    <Button onClick={onClick} variant={buttonVariants[color]} size="sm">
                        {buttonText}
                    </Button>
                </div>
                <div className={`w-12 h-12 ${iconColors[color]}`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

/**
 * Icons
 */
const Icons = {
    Users: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    Money: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Clock: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Chart: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    QR: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
    ),
    Calendar: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Wallet: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    Document: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    Warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    ArrowRight: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    TrendUp: (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    TrendDown: (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
    )
};

/**
 * DashboardPage Component
 * Displays personalized dashboard based on user role
 */
const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const isAdministrator = user?.role === USER_ROLES.ADMINISTRATOR;
    const isRegistrar = user?.role === USER_ROLES.REGISTRAR;

    // Fetch data using custom hooks
    const { activeAssembly, loading: loadingAssembly } = useActiveAssembly();
    const { members, pagination: totalMembersPagination, loading: loadingMembers } = useMembers({ page: 1, limit: 5 });
    const { pagination: activeMembersPagination } = useMembers({ isActive: 'true', page: 1, limit: 1 });
    const { stats: attendanceStats } = useAssemblyAttendance(activeAssembly?.assemblyId);
    const { savingsSummary, pendingWithdrawals, recentWithdrawals, loading: loadingDashboard } = useDashboard();

    const isLoading = loadingAssembly || loadingMembers || loadingDashboard;

    if (isLoading) {
        return <Loading message="Cargando dashboard..." />;
    }

    // Calculate stats
    const totalMembers = totalMembersPagination?.total || 0;
    const activeMembers = activeMembersPagination?.total || 0;
    const inactiveMembers = totalMembers - activeMembers;
    const totalSavings = savingsSummary?.summary?.totalSavings || 0;
    const pendingCount = pendingWithdrawals?.length || 0;
    const attendanceRate = attendanceStats?.attendancePercentage || 0;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Bienvenido, {user?.fullName?.split(' ')[0]}
                </h1>
                <p className="text-gray-500 mt-1 capitalize">
                    {formatDate(new Date())}
                </p>
            </div>

            {/* Alerts Section */}
            <div className="space-y-3">
                {activeAssembly && (
                    <Alert
                        type="info"
                        title="Asamblea Activa"
                        message={`"${activeAssembly.title}" - ${new Date(activeAssembly.scheduledDate).toLocaleDateString('es-CR')}`}
                    />
                )}
                {pendingCount > 0 && (
                    <div
                        className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={() => navigate('/withdrawals')}
                    >
                        <div className="text-orange-500">{Icons.Warning}</div>
                        <div className="flex-1">
                            <p className="font-medium text-orange-800">
                                {pendingCount} solicitud{pendingCount !== 1 ? 'es' : ''} de retiro pendiente{pendingCount !== 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-orange-600">Haz clic para revisar</p>
                        </div>
                        <div className="text-orange-500">{Icons.ArrowRight}</div>
                    </div>
                )}
            </div>

            {/* Key Metrics - Admin Only */}
            {isAdministrator && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total de Asociados"
                        value={totalMembers}
                        subtitle={`${activeMembers} activos / ${inactiveMembers} inactivos`}
                        icon={Icons.Users}
                        color="primary"
                        onClick={() => navigate('/members')}
                    />
                    <StatCard
                        title="Fondo de Ahorros"
                        value={formatCurrency(totalSavings)}
                        subtitle="Balance total de asociados"
                        icon={Icons.Money}
                        color="green"
                        onClick={() => navigate('/savings')}
                    />
                    <StatCard
                        title="Solicitudes Pendientes"
                        value={pendingCount}
                        subtitle="Retiros por aprobar"
                        icon={Icons.Clock}
                        color={pendingCount > 0 ? 'orange' : 'purple'}
                        onClick={() => navigate('/withdrawals')}
                    />
                    <StatCard
                        title="Asistencia"
                        value={activeAssembly ? `${attendanceRate}%` : 'N/A'}
                        subtitle={activeAssembly ? 'Última asamblea' : 'Sin asamblea activa'}
                        icon={Icons.Chart}
                        color="purple"
                        onClick={activeAssembly ? () => navigate(`/assemblies/${activeAssembly.assemblyId}`) : undefined}
                    />
                </div>
            )}

            {/* Financial Summary - Admin Only */}
            {isAdministrator && savingsSummary?.summary && (
                <Card title="Resumen de Ahorros" padding="normal">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-primary-50 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-sm text-gray-600">Fondo Total</span>
                            </div>
                            <p className="text-2xl font-bold text-primary-600">
                                {formatCurrency(savingsSummary.summary.totalSavings || 0)}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                {Icons.Users}
                                <span className="text-sm text-gray-600">Miembros con Ahorros</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {savingsSummary.summary.totalMembers || 0}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-sm text-gray-600">Promedio por Miembro</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">
                                {formatCurrency(savingsSummary.summary.averageBalance || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Recent Activity Section - Admin Only */}
            {isAdministrator && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Members */}
                    <Card
                        title="Miembros Recientes"
                        headerAction={
                            <Button variant="ghost" size="sm" onClick={() => navigate('/members')}>
                                Ver todos
                            </Button>
                        }
                        padding="none"
                    >
                        <div className="divide-y divide-gray-100">
                            {members && members.length > 0 ? (
                                members.slice(0, 5).map((member) => (
                                    <div
                                        key={member.memberId}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/members/${member.memberId}`)}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                                            {member.fullName?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{member.fullName}</p>
                                            <p className="text-sm text-gray-500 truncate">{member.institutionalEmail}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {member.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-5 py-8 text-center text-gray-500">
                                    No hay miembros registrados
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Recent Withdrawals */}
                    <Card
                        title="Solicitudes de Retiro"
                        headerAction={
                            <Button variant="ghost" size="sm" onClick={() => navigate('/withdrawals')}>
                                Ver todas
                            </Button>
                        }
                        padding="none"
                    >
                        <div className="divide-y divide-gray-100">
                            {recentWithdrawals && recentWithdrawals.length > 0 ? (
                                recentWithdrawals.map((withdrawal) => (
                                    <div
                                        key={withdrawal.withdrawalRequestId}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate('/withdrawals')}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${withdrawal.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                                withdrawal.status === 'approved' ? 'bg-green-100 text-green-600' :
                                                    'bg-red-100 text-red-600'
                                            }`}>
                                            {Icons.Wallet}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {withdrawal.memberName || `Miembro #${withdrawal.memberId}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatCurrency(withdrawal.requestedAmount)}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${withdrawal.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                withdrawal.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {withdrawal.status === 'pending' ? 'Pendiente' :
                                                withdrawal.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-5 py-8 text-center text-gray-500">
                                    No hay solicitudes de retiro
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(isAdministrator || isRegistrar) && activeAssembly && (
                        <QuickActionCard
                            title="Escanear QR"
                            description="Registrar asistencia"
                            buttonText="Escanear"
                            onClick={() => navigate('/attendance/scan')}
                            icon={Icons.QR}
                            color="primary"
                        />
                    )}
                    {isAdministrator && (
                        <>
                            <QuickActionCard
                                title="Miembros"
                                description="Gestionar asociados"
                                buttonText="Ver Miembros"
                                onClick={() => navigate('/members')}
                                icon={Icons.Users}
                                color="green"
                            />
                            <QuickActionCard
                                title="Ahorros"
                                description="Gestionar fondos"
                                buttonText="Ver Ahorros"
                                onClick={() => navigate('/savings')}
                                icon={Icons.Wallet}
                                color="purple"
                            />
                            <QuickActionCard
                                title="Asambleas"
                                description="Administrar reuniones"
                                buttonText="Ver Asambleas"
                                onClick={() => navigate('/assemblies')}
                                icon={Icons.Calendar}
                                color="orange"
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Additional Quick Links for Admin */}
            {isAdministrator && (
                <Card title="Más Opciones" padding="normal">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Button onClick={() => navigate('/members/new')} variant="outline" fullWidth>
                            Nuevo Miembro
                        </Button>
                        <Button onClick={() => navigate('/assemblies/new')} variant="outline" fullWidth>
                            Nueva Asamblea
                        </Button>
                        <Button onClick={() => navigate('/users')} variant="outline" fullWidth>
                            Usuarios
                        </Button>
                        <Button onClick={() => navigate('/reports')} variant="outline" fullWidth>
                            Reportes
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default DashboardPage;
