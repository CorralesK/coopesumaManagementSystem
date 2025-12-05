/**
 * Savings Management Page
 * Admin page for managing member savings accounts
 */

import React, { useState, useEffect } from 'react';
import Alert from '../../components/common/Alert';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const SavingsManagementPage = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [depositData, setDepositData] = useState({
        amount: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        fetchSavingsSummary();
    }, []);

    const fetchSavingsSummary = async () => {
        try {
            setLoading(true);
            const response = await api.get('/savings/summary');

            console.log('Response:', response); // Debug

            // La respuesta viene en response.data.data
            const summaryData = response.data?.data || {};

            setSummary(summaryData.summary || {});
            setMembers(summaryData.members || []);
        } catch (error) {
            console.error('Error fetching savings summary:', error);
            setError(error.response?.data?.message || 'Error al cargar datos de ahorros');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDepositModal = (member) => {
        setSelectedMember(member);
        setDepositData({ amount: '', description: '' });
        setShowDepositModal(true);
    };

    const handleSubmitDeposit = async (e) => {
        e.preventDefault();

        if (!depositData.amount || parseFloat(depositData.amount) <= 0) {
            setError('El monto debe ser mayor a cero');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/savings/deposits', {
                memberId: selectedMember.member_id,
                amount: parseFloat(depositData.amount),
                description: depositData.description || `Depósito de ahorros - ${selectedMember.full_name}`,
                transactionDate: new Date().toISOString()
            });

            setSuccessMessage('Depósito registrado exitosamente');
            setShowDepositModal(false);
            setDepositData({ amount: '', description: '' });
            fetchSavingsSummary();
        } catch (error) {
            console.error('Error registering deposit:', error);
            setError(error.response?.data?.message || 'Error al registrar depósito');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMembers = members.filter(member =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.member_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.identification?.includes(searchTerm)
    );

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Ahorros</h1>
                        <p className="text-gray-600">
                            Administra los depósitos de ahorros de todos los miembros
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/savings/inventory/${new Date().getFullYear()}`)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ver Inventario Anual
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total en Ahorros</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(summary.totalSavings)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Miembros con Ahorros</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {summary.totalMembers}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Promedio por Miembro</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(summary.averageBalance)}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, código o cédula..."
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <p className="mt-2 text-gray-600">Cargando datos...</p>
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-gray-50">
                            <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-base text-gray-500">No se encontraron miembros</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Miembro
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Saldo Actual
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Transacciones
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMembers.map((member) => (
                                    <tr key={member.member_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <span className="text-primary-600 font-semibold">
                                                        {member.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {member.full_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {member.identification}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{member.member_code}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-green-600">
                                                {formatCurrency(member.current_balance || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {member.transaction_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleOpenDepositModal(member)}
                                                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Depósito
                                            </button>
                                            <Link
                                                to={`/members/${member.member_id}`}
                                                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                            >
                                                Ver Detalle
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && selectedMember && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDepositModal(false)} />

                        <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Registrar Depósito de Ahorros
                                </h3>
                                <button
                                    onClick={() => setShowDepositModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Miembro:</strong> {selectedMember.full_name}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    <strong>Saldo actual:</strong> {formatCurrency(selectedMember.current_balance || 0)}
                                </p>
                            </div>

                            <form onSubmit={handleSubmitDeposit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Monto del Depósito *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500">₡</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={depositData.amount}
                                                onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nota (Opcional)
                                        </label>
                                        <textarea
                                            value={depositData.description}
                                            onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Descripción del depósito..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowDepositModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Registrar Depósito
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsManagementPage;