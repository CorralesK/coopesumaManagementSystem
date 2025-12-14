/**
 * @file MemberDashboardPage.jsx
 * @description Personal dashboard for members to view their savings account and request withdrawals
 * @module pages/members
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

/**
 * MemberDashboardPage Component
 * Displays personal financial information for logged-in members
 */
const MemberDashboardPage = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Withdrawal request modal state
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [withdrawalData, setWithdrawalData] = useState({
        requestedAmount: '',
        requestNotes: ''
    });
    const [withdrawalErrors, setWithdrawalErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/members/me/dashboard');
            setDashboardData(response.data);
        } catch (err) {
            setError(err.message || 'Error al cargar el dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get savings account balance
    const getSavingsBalance = () => {
        if (!dashboardData?.accounts) return 0;
        const savingsAccount = dashboardData.accounts.find(
            account => account.accountType === 'savings' || account.displayName?.toLowerCase().includes('ahorro')
        );
        return savingsAccount?.currentBalance || 0;
    };

    // Filter only savings transactions
    const getSavingsTransactions = () => {
        if (!dashboardData?.recentTransactions) return [];
        return dashboardData.recentTransactions.filter(tx =>
            tx.accountType === 'savings' || tx.accountDisplayName?.toLowerCase().includes('ahorro')
        ).slice(0, 5); // Show only last 5
    };

    // Handle withdrawal request
    const handleWithdrawalInputChange = (e) => {
        const { name, value } = e.target;
        setWithdrawalData(prev => ({ ...prev, [name]: value }));
        if (withdrawalErrors[name]) {
            setWithdrawalErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateWithdrawal = () => {
        const errors = {};
        const amount = parseFloat(withdrawalData.requestedAmount);
        const balance = getSavingsBalance();

        if (!withdrawalData.requestedAmount || amount <= 0) {
            errors.requestedAmount = 'El monto debe ser mayor a 0';
        } else if (amount > balance) {
            errors.requestedAmount = `El monto no puede ser mayor al saldo disponible (${formatCurrency(balance)})`;
        }

        setWithdrawalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitWithdrawal = async (e) => {
        e.preventDefault();

        if (!validateWithdrawal()) return;

        try {
            setSubmitting(true);
            await api.post('/withdrawal-requests', {
                memberId: dashboardData.member.memberId,
                accountType: 'savings',
                requestedAmount: parseFloat(withdrawalData.requestedAmount),
                requestNotes: withdrawalData.requestNotes || null
            });

            setSuccessMessage('Solicitud de retiro enviada exitosamente');
            setShowWithdrawalModal(false);
            setWithdrawalData({ requestedAmount: '', requestNotes: '' });
            fetchDashboard(); // Refresh data
        } catch (err) {
            setWithdrawalErrors({
                submit: err.message || 'Error al enviar la solicitud'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const openWithdrawalModal = () => {
        setWithdrawalData({ requestedAmount: '', requestNotes: '' });
        setWithdrawalErrors({});
        setShowWithdrawalModal(true);
    };

    if (loading) {
        return <Loading message="Cargando tu información..." />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Dashboard</h1>
                </div>
                <Alert type="error" message={error} />
                <div className="flex justify-center">
                    <Button onClick={fetchDashboard} variant="primary">
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Dashboard</h1>
                </div>
                <Alert type="warning" message="No se pudo cargar tu información" />
            </div>
        );
    }

    const { pendingRequests } = dashboardData;
    const savingsBalance = getSavingsBalance();
    const recentTransactions = getSavingsTransactions();

    return (
        <div className="space-y-6">
            {/* Success Alert */}
            {successMessage && (
                <Alert
                    type="success"
                    message={successMessage}
                    onClose={() => setSuccessMessage('')}
                />
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Saldo de Ahorros</h1>
            </div>

            {/* Account Balance Card */}
            <Card>
                <div
                    onClick={() => navigate('/my-transactions')}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-600">
                        {formatCurrency(savingsBalance)}
                    </p>
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Ver movimientos
                    </p>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                    onClick={openWithdrawalModal}
                    variant="primary"
                    fullWidth
                    disabled={savingsBalance <= 0}
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Solicitar Retiro
                </Button>
                <Button
                    onClick={() => navigate('/my-profile')}
                    variant="outline"
                    fullWidth
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Ver Mi Perfil
                </Button>
            </div>

            {/* Pending Requests */}
            {pendingRequests && pendingRequests.length > 0 && (
                <Card title="Solicitudes Pendientes">
                    <div className="space-y-1">
                        {pendingRequests.map((request) => (
                            <div
                                key={request.requestId}
                                className="flex items-center justify-between py-3 px-3 bg-yellow-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-100">
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            Retiro de Ahorros
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {formatDate(request.requestedAt)}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-base font-semibold flex-shrink-0 text-yellow-600">
                                    {formatCurrency(request.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Recent Transactions */}
            <Card title="Transacciones Recientes">
                {recentTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                        <p className="text-gray-500">No hay transacciones registradas</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {recentTransactions.map((tx) => (
                            <div
                                key={tx.transactionId}
                                className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        tx.transactionType.includes('deposit') || tx.transactionType.includes('transfer_in')
                                            ? 'bg-green-100'
                                            : 'bg-red-100'
                                    }`}>
                                        {tx.transactionType.includes('deposit') || tx.transactionType.includes('transfer_in') ? (
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {tx.transactionType.includes('deposit') || tx.transactionType.includes('transfer_in')
                                                ? 'Depósito'
                                                : 'Retiro'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {formatDate(tx.transactionDate)}
                                        </p>
                                    </div>
                                </div>
                                <p className={`text-base font-semibold flex-shrink-0 ${
                                    tx.transactionType.includes('deposit') || tx.transactionType.includes('transfer_in')
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {tx.transactionType.includes('deposit') || tx.transactionType.includes('transfer_in') ? '+' : '-'}
                                    {formatCurrency(tx.amount)}
                                </p>
                            </div>
                        ))}

                        {/* View All Button */}
                        <div className="pt-4 border-t border-gray-100">
                            <Button
                                onClick={() => navigate('/my-transactions')}
                                variant="ghost"
                                fullWidth
                            >
                                Ver todas las transacciones
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Withdrawal Request Modal */}
            <Modal
                isOpen={showWithdrawalModal}
                onClose={() => setShowWithdrawalModal(false)}
                title="Solicitar Retiro de Ahorros"
                size="md"
            >
                <form onSubmit={handleSubmitWithdrawal} className="space-y-6">
                    {/* Current Balance Info */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">Saldo disponible</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {formatCurrency(savingsBalance)}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {withdrawalErrors.submit && (
                        <Alert type="error" message={withdrawalErrors.submit} />
                    )}

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monto a retirar *</label>
                        <div className={`flex items-center border rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 bg-white ${withdrawalErrors.requestedAmount ? 'border-red-500' : 'border-gray-300'}`}>
                            <span className="pl-3 text-gray-500">₡</span>
                            <input
                                type="number"
                                name="requestedAmount"
                                step="0.01"
                                min="0"
                                max={savingsBalance}
                                value={withdrawalData.requestedAmount}
                                onChange={handleWithdrawalInputChange}
                                placeholder="0.00"
                                className="flex-1 px-2 py-2 border-0 focus:ring-0 focus:outline-none bg-transparent"
                                required
                            />
                        </div>
                        {withdrawalErrors.requestedAmount && (
                            <p className="mt-1 text-sm text-red-600">{withdrawalErrors.requestedAmount}</p>
                        )}
                    </div>

                    {/* Notes Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas (opcional)
                        </label>
                        <textarea
                            name="requestNotes"
                            value={withdrawalData.requestNotes}
                            onChange={handleWithdrawalInputChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Motivo del retiro..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={() => setShowWithdrawalModal(false)}
                            variant="outline"
                            disabled={submitting}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                            className="w-full sm:w-auto"
                        >
                            {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MemberDashboardPage;