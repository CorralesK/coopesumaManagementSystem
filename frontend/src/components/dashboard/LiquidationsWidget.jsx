/**
 * @file LiquidationsWidget.jsx
 * @description Dashboard widget showing liquidation statistics and pending members
 * @module components/dashboard
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLiquidationStats } from '../../services/liquidationService';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * LiquidationsWidget Component
 * Shows liquidation stats and alerts for pending liquidations
 */
const LiquidationsWidget = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await getLiquidationStats();
            setStats(response.data);
        } catch (err) {
            setError(err.message || 'Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `₡${Number(amount || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (loading) {
        return (
            <Card title="Liquidaciones">
                <Loading message="Cargando estadísticas..." />
            </Card>
        );
    }

    if (error) {
        return (
            <Card title="Liquidaciones">
                <p className="text-red-600 text-sm">{error}</p>
            </Card>
        );
    }

    const hasPending = stats?.pending?.count > 0;
    const hasUrgent = stats?.pending?.topMembers?.some(m => m.yearsSinceLastLiquidation >= 10);

    return (
        <Card
            title="Liquidaciones"
            className={hasPending ? 'border-l-4 border-yellow-400' : ''}
        >
            <div className="space-y-4">
                {/* Pending Alert */}
                {hasPending ? (
                    <div className={`p-4 rounded-lg ${hasUrgent ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg
                                    className={`h-6 w-6 ${hasUrgent ? 'text-red-400' : 'text-yellow-400'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className={`text-sm font-medium ${hasUrgent ? 'text-red-800' : 'text-yellow-800'}`}>
                                    {stats.pending.count} {stats.pending.count === 1 ? 'Miembro Pendiente' : 'Miembros Pendientes'} de Liquidación
                                </h3>
                                <div className="mt-2 text-sm text-gray-700">
                                    {hasUrgent && (
                                        <p className="text-red-700 font-medium mb-2">
                                            ⚠️ Algunos miembros tienen 10+ años sin liquidar
                                        </p>
                                    )}
                                    <ul className="space-y-1">
                                        {stats.pending.topMembers?.slice(0, 3).map((member, index) => (
                                            <li key={index} className="flex items-center justify-between text-xs">
                                                <span
                                                    className="hover:underline cursor-pointer text-primary-600"
                                                    onClick={() => navigate(`/members/${member.memberId}`)}
                                                >
                                                    {member.fullName}
                                                </span>
                                                <span className={`font-semibold ${member.yearsSinceLastLiquidation >= 10 ? 'text-red-600' : 'text-yellow-700'}`}>
                                                    {member.yearsSinceLastLiquidation} años
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    {stats.pending.count > 3 && (
                                        <p className="text-xs text-gray-600 mt-2">
                                            + {stats.pending.count - 3} más...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">
                                No hay liquidaciones pendientes
                            </span>
                        </div>
                    </div>
                )}

                {/* Stats This Year */}
                <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-3">Liquidaciones Este Año</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.thisYear?.total || 0}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-700">Periódicas</p>
                            <p className="text-2xl font-bold text-blue-900">{stats?.thisYear?.periodic || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-700">Por Retiro</p>
                            <p className="text-2xl font-bold text-purple-900">{stats?.thisYear?.exit || 0}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-xs text-green-700">Monto Total</p>
                            <p className="text-sm font-bold text-green-900">
                                {formatCurrency(stats?.thisYear?.totalAmount || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                {hasPending && (
                    <Button
                        onClick={() => {
                            // Navigate to first pending member
                            if (stats.pending.topMembers && stats.pending.topMembers.length > 0) {
                                navigate(`/members/${stats.pending.topMembers[0].memberId}`);
                            }
                        }}
                        variant="primary"
                        fullWidth
                        size="sm"
                    >
                        Ver Miembro Más Urgente
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default LiquidationsWidget;