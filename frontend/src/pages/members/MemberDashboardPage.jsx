/**
 * @file MemberDashboardPage.jsx
 * @description Personal dashboard for members to view their accounts, transactions, and contribution status
 * @module pages/members
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';

/**
 * MemberDashboardPage Component
 * Displays personal financial information for logged-in members
 */
const MemberDashboardPage = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get('/members/me/dashboard');
                setDashboardData(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error al cargar el dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <Loading message="Cargando tu información..." />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Alert type="error" message={error} />
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Alert type="warning" message="No se pudo cargar tu información" />
            </div>
        );
    }

    const { member, accounts, recentTransactions, contributionStatus, pendingRequests } = dashboardData;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="pb-5 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900">Mi Área Personal</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Bienvenido, {member.fullName}
                </p>
                {member.memberCode && (
                    <p className="text-sm text-gray-500">Código de Asociado: {member.memberCode}</p>
                )}
            </div>

            {/* Member Info Card */}
            <Card title="Información Personal">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Nombre</p>
                        <p className="mt-1 text-base text-gray-900">{member.fullName}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Identificación</p>
                        <p className="mt-1 text-base text-gray-900">{member.identification}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Calidad</p>
                        <p className="mt-1 text-base text-gray-900">
                            {member.qualityName}
                            {member.levelName && ` - ${member.levelName}`}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {accounts.map((account) => (
                    <Card key={account.accountId}>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {account.displayName}
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm text-gray-500">Saldo Actual</p>
                                    <p className="text-2xl font-bold text-primary-600">
                                        {formatCurrency(account.currentBalance)}
                                    </p>
                                </div>
                                {account.lastFiscalYearBalance > 0 && (
                                    <div className="pt-2 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">Saldo Año Fiscal Anterior</p>
                                        <p className="text-sm text-gray-600">
                                            {formatCurrency(account.lastFiscalYearBalance)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Contribution Status */}
            {contributionStatus && (
                <Card title={`Estado de Aportaciones - Año Fiscal ${contributionStatus.fiscalYear}`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Tractos Pagados</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {contributionStatus.tractsPaid} de {contributionStatus.tractsRequired}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total Aportado</p>
                                <p className="text-lg font-semibold text-primary-600">
                                    {formatCurrency(contributionStatus.totalContributed)}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Progreso</span>
                                <span className={contributionStatus.isComplete ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                                    {Math.round((contributionStatus.tractsPaid / contributionStatus.tractsRequired) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-300 ${
                                        contributionStatus.isComplete ? 'bg-green-600' : 'bg-primary-600'
                                    }`}
                                    style={{ width: `${(contributionStatus.tractsPaid / contributionStatus.tractsRequired) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Paid and Pending Tracts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            {contributionStatus.paidTracts.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-green-700 mb-2">✓ Tractos Pagados</p>
                                    <ul className="space-y-1">
                                        {contributionStatus.paidTracts.map((tract, index) => (
                                            <li key={index} className="text-sm text-gray-600">• {tract}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {contributionStatus.pendingTracts.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-orange-700 mb-2">○ Tractos Pendientes</p>
                                    <ul className="space-y-1">
                                        {contributionStatus.pendingTracts.map((tract, index) => (
                                            <li key={index} className="text-sm text-gray-600">• {tract}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <Card title="Solicitudes de Retiro Pendientes">
                    <div className="space-y-3">
                        {pendingRequests.map((request) => (
                            <div key={request.requestId} className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">
                                            {request.accountDisplayName}
                                            {request.transferTo && ` → ${request.transferTo}`}
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-1">{request.reason}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-yellow-900">
                                            {formatCurrency(request.amount)}
                                        </p>
                                        <p className="text-xs text-yellow-600">
                                            {formatDate(request.requestedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
                <Card title="Transacciones Recientes">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cuenta
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Monto
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentTransactions.map((tx) => (
                                    <tr key={tx.transactionId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(tx.transactionDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tx.accountDisplayName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                            <span className={tx.transactionType.includes('deposit') || tx.transactionType.includes('transfer_in') ? 'text-green-600' : 'text-gray-900'}>
                                                {formatCurrency(tx.amount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default MemberDashboardPage;