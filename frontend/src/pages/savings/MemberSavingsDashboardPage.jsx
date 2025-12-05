/**
 * Member Savings Dashboard Page
 * Personal dashboard for member's savings account
 * Allows Admin and Treasurer to make deposits and withdrawals
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberSavings, getSavingsLedger, registerDeposit, registerWithdrawal } from '../../services/savingsService';
import { getMemberById } from '../../services/memberService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';

const MemberSavingsDashboardPage = () => {
    const { memberId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [member, setMember] = useState(null);
    const [savingsData, setSavingsData] = useState(null);
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Modal states
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [depositForm, setDepositForm] = useState({
        amount: '',
        description: ''
    });
    const [withdrawalForm, setWithdrawalForm] = useState({
        amount: '',
        receiptNumber: '',
        description: ''
    });

    // Check if user can manage savings
    const canManageSavings = user?.role === 'administrator' || user?.role === 'manager';

    useEffect(() => {
        fetchData();
    }, [memberId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [memberData, savingsResponse, ledgerResponse] = await Promise.all([
                getMemberById(parseInt(memberId)),
                getMemberSavings(parseInt(memberId)),
                getSavingsLedger(parseInt(memberId), { limit: 50 })
            ]);

            setMember(memberData);
            setSavingsData(savingsResponse.data.data);
            setLedger(ledgerResponse.data.data.transactions || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();

        if (!depositForm.amount || parseFloat(depositForm.amount) <= 0) {
            setError('El monto debe ser mayor a cero');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            await registerDeposit({
                memberId: parseInt(memberId),
                amount: parseFloat(depositForm.amount),
                description: depositForm.description || `Depósito de ahorros - ${member.full_name}`
            });

            setSuccessMessage('Depósito registrado exitosamente');
            setShowDepositModal(false);
            setDepositForm({ amount: '', description: '' });
            fetchData();
        } catch (err) {
            console.error('Error registering deposit:', err);
            setError(err.response?.data?.message || 'Error al registrar depósito');
        } finally {
            setSubmitting(false);
        }
    };

    const handleWithdrawal = async (e) => {
        e.preventDefault();

        if (!withdrawalForm.amount || parseFloat(withdrawalForm.amount) <= 0) {
            setError('El monto debe ser mayor a cero');
            return;
        }

        if (!withdrawalForm.receiptNumber) {
            setError('El número de recibo es requerido');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            await registerWithdrawal({
                memberId: parseInt(memberId),
                amount: parseFloat(withdrawalForm.amount),
                receiptNumber: withdrawalForm.receiptNumber,
                description: withdrawalForm.description || `Retiro de ahorros - ${member.full_name}`
            });

            setSuccessMessage('Retiro registrado exitosamente');
            setShowWithdrawalModal(false);
            setWithdrawalForm({ amount: '', receiptNumber: '', description: '' });
            fetchData();
        } catch (err) {
            console.error('Error registering withdrawal:', err);
            setError(err.response?.data?.message || 'Error al registrar retiro');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Loading message="Cargando datos de ahorros..." />;
    }

    if (!member || !savingsData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">No se encontraron datos</p>
                <Button onClick={() => navigate('/savings')} className="mt-4">
                    Volver
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Cuenta de Ahorros
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {member.member_code} - {member.full_name}
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/savings')}
                    >
                        ← Volver
                    </Button>
                </div>
            </div>

            {error && (
                <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />
            )}

            {successMessage && (
                <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} className="mb-4" />
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-green-100">Saldo Actual</h3>
                            <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-4xl font-bold">
                            {formatCurrency(savingsData.account.current_balance)}
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Transacciones</h3>
                        <p className="text-3xl font-bold text-gray-900">{ledger.length}</p>
                        <p className="text-sm text-gray-500 mt-1">Historial completo</p>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Última Transacción</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {ledger.length > 0 ? formatDate(ledger[0].transaction_date) : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {ledger.length > 0 ? ledger[0].transaction_type === 'deposit' ? 'Depósito' : 'Retiro' : ''}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Action Buttons */}
            {canManageSavings && (
                <div className="mb-6 flex gap-3">
                    <Button
                        variant="primary"
                        onClick={() => setShowDepositModal(true)}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        }
                    >
                        Registrar Depósito
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => setShowWithdrawalModal(true)}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        }
                    >
                        Registrar Retiro
                    </Button>
                </div>
            )}

            {/* Transaction History */}
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Transacciones</h2>

                    {ledger.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="font-medium">No hay transacciones registradas</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Recibo
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
                                    {ledger.map((transaction) => (
                                        <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(transaction.transaction_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    transaction.transaction_type === 'deposit'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.transaction_type === 'deposit' ? 'Depósito' : 'Retiro'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {transaction.receipt_number || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {transaction.description}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                                                transaction.transaction_type === 'deposit'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}>
                                                {transaction.transaction_type === 'withdrawal' && '-'}
                                                {formatCurrency(transaction.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => !submitting && setShowDepositModal(false)} />

                        <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Registrar Depósito de Ahorros
                                </h3>
                                <button
                                    onClick={() => !submitting && setShowDepositModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                    disabled={submitting}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Miembro:</strong> {member.full_name}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    <strong>Saldo actual:</strong> {formatCurrency(savingsData.account.current_balance)}
                                </p>
                            </div>

                            <form onSubmit={handleDeposit}>
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
                                                value={depositForm.amount}
                                                onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="0.00"
                                                required
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción (Opcional)
                                        </label>
                                        <textarea
                                            value={depositForm.description}
                                            onChange={(e) => setDepositForm({ ...depositForm, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Descripción del depósito..."
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowDepositModal(false)}
                                        disabled={submitting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={submitting}
                                        loading={submitting}
                                    >
                                        {submitting ? 'Procesando...' : 'Registrar Depósito'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdrawal Modal */}
            {showWithdrawalModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => !submitting && setShowWithdrawalModal(false)} />

                        <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Registrar Retiro de Ahorros
                                </h3>
                                <button
                                    onClick={() => !submitting && setShowWithdrawalModal(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                    disabled={submitting}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-sm text-gray-700">
                                    <strong>Miembro:</strong> {member.full_name}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    <strong>Saldo actual:</strong> {formatCurrency(savingsData.account.current_balance)}
                                </p>
                            </div>

                            <form onSubmit={handleWithdrawal}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Monto del Retiro *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500">₡</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                max={savingsData.account.current_balance}
                                                value={withdrawalForm.amount}
                                                onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="0.00"
                                                required
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Número de Recibo *
                                        </label>
                                        <input
                                            type="text"
                                            value={withdrawalForm.receiptNumber}
                                            onChange={(e) => setWithdrawalForm({ ...withdrawalForm, receiptNumber: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Número de recibo"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción (Opcional)
                                        </label>
                                        <textarea
                                            value={withdrawalForm.description}
                                            onChange={(e) => setWithdrawalForm({ ...withdrawalForm, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Descripción del retiro..."
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowWithdrawalModal(false)}
                                        disabled={submitting}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="danger"
                                        disabled={submitting}
                                        loading={submitting}
                                    >
                                        {submitting ? 'Procesando...' : 'Registrar Retiro'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberSavingsDashboardPage;