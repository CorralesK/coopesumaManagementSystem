/**
 * @file WithdrawalRequestPage.jsx
 * @description Page for members to create and view their withdrawal requests
 * @module pages/withdrawals
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWithdrawalRequests } from '../../hooks/useWithdrawalRequests';
import { useWithdrawalOperations } from '../../hooks/useWithdrawalOperations';
import { getMemberById } from '../../services/memberService';
import { getMemberSavings } from '../../services/savingsService';
import { getMemberContributions } from '../../services/contributionsService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import Table from '../../components/common/Table';

/**
 * WithdrawalRequestPage Component
 * Allows members to request withdrawals from their accounts
 */
const WithdrawalRequestPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedAccount = searchParams.get('account');

    const [member, setMember] = useState(null);
    const [balances, setBalances] = useState({
        savings: 0,
        contributions: 0,
        surplus: 0
    });
    const [loadingData, setLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        accountType: preselectedAccount || '',
        requestedAmount: '',
        requestNotes: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Use hooks
    const { requests, loading: loadingRequests, refetch } = useWithdrawalRequests({ memberId: user?.memberId });
    const { createRequest, loading: submitting, error: operationError, success, clearState } = useWithdrawalOperations();

    // Load member data and balances
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true);

                const [memberRes, savingsRes, contribRes] = await Promise.all([
                    getMemberById(user?.memberId),
                    getMemberSavings(user?.memberId).catch(() => ({ data: { currentBalance: 0 } })),
                    getMemberContributions(user?.memberId).catch(() => ({ data: { currentBalance: 0 } }))
                ]);

                setMember(memberRes.data);
                setBalances({
                    savings: savingsRes.data?.currentBalance || 0,
                    contributions: contribRes.data?.currentBalance || 0,
                    surplus: 0 // Will be populated from surplus API when available
                });
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoadingData(false);
            }
        };

        if (user?.memberId) {
            fetchData();
        }
    }, [user?.memberId]);

    // Handle success
    useEffect(() => {
        if (success) {
            setSuccessMessage('Solicitud de retiro creada exitosamente');
            setFormData({
                accountType: '',
                requestedAmount: '',
                requestNotes: ''
            });
            refetch();
            setTimeout(() => {
                clearState();
                setSuccessMessage('');
            }, 3000);
        }
    }, [success, refetch, clearState]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Get current balance for selected account
    const getCurrentBalance = () => {
        switch (formData.accountType) {
            case 'savings':
                return balances.savings;
            case 'contributions':
                return balances.contributions;
            case 'surplus':
                return balances.surplus;
            default:
                return 0;
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.accountType) {
            newErrors.accountType = 'Debe seleccionar un tipo de cuenta';
        }

        if (!formData.requestedAmount || parseFloat(formData.requestedAmount) <= 0) {
            newErrors.requestedAmount = 'El monto debe ser mayor a 0';
        } else {
            const amount = parseFloat(formData.requestedAmount);
            const balance = getCurrentBalance();

            if (amount > balance) {
                newErrors.requestedAmount = `El monto no puede ser mayor al saldo disponible (₡${balance.toLocaleString('es-CR', { minimumFractionDigits: 2 })})`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await createRequest({
                memberId: user.memberId,
                accountType: formData.accountType,
                requestedAmount: parseFloat(formData.requestedAmount),
                requestNotes: formData.requestNotes || null
            });
        } catch (err) {
            // Error handled by hook
        }
    };

    // Account type options - Only savings account is allowed for withdrawal requests
    const accountTypeOptions = [
        { value: 'savings', label: 'Ahorro' }
    ];

    // Table columns for requests
    const requestColumns = [
        {
            key: 'createdAt',
            label: 'Fecha',
            render: (req) => new Date(req.createdAt).toLocaleDateString('es-CR')
        },
        {
            key: 'accountType',
            label: 'Cuenta',
            render: (req) => {
                const accountLabels = {
                    savings: 'Ahorro',
                    contributions: 'Aportaciones',
                    surplus: 'Excedentes'
                };
                return accountLabels[req.accountType] || req.accountType;
            }
        },
        {
            key: 'requestedAmount',
            label: 'Monto',
            render: (req) => `₡${Number(req.requestedAmount).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`
        },
        {
            key: 'status',
            label: 'Estado',
            render: (req) => {
                const statusConfig = {
                    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
                    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
                    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' }
                };
                const config = statusConfig[req.status] || statusConfig.pending;

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            key: 'requestNotes',
            label: 'Notas',
            render: (req) => req.requestNotes || '-'
        }
    ];

    if (loadingData) {
        return <Loading message="Cargando información..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Solicitudes de Retiro</h1>
                    <p className="text-gray-600 mt-1">Solicita retiros de tus cuentas</p>
                </div>
            </div>

            {/* Alerts */}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
            {operationError && <Alert type="error" message={operationError} onClose={clearState} />}

            {/* Account Balances Card */}
            <Card title="Saldos Disponibles">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-700">Ahorro</p>
                        <p className="text-2xl font-bold text-green-900">
                            ₡{balances.savings.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-700">Aportaciones</p>
                        <p className="text-2xl font-bold text-blue-900">
                            ₡{balances.contributions.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-700">Excedentes</p>
                        <p className="text-2xl font-bold text-purple-900">
                            ₡{balances.surplus.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Request Form */}
            <form onSubmit={handleSubmit}>
                <Card title="Nueva Solicitud de Retiro">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Select
                                label="Tipo de Cuenta"
                                name="accountType"
                                value={formData.accountType}
                                onChange={handleInputChange}
                                options={accountTypeOptions}
                                error={errors.accountType}
                                required
                                placeholder="Seleccione una cuenta"
                            />

                            <Input
                                label="Monto Solicitado"
                                name="requestedAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.requestedAmount}
                                onChange={handleInputChange}
                                error={errors.requestedAmount}
                                required
                                placeholder="0.00"
                            />
                        </div>

                        {formData.accountType && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    Saldo disponible en {accountTypeOptions.find(opt => opt.value === formData.accountType)?.label}:
                                    <span className="font-bold ml-2">
                                        ₡{getCurrentBalance().toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                                    </span>
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas (opcional)
                            </label>
                            <textarea
                                name="requestNotes"
                                value={formData.requestNotes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Motivo del retiro, instrucciones especiales, etc."
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                onClick={() => navigate('/my-dashboard')}
                                variant="outline"
                                disabled={submitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>

            {/* My Requests */}
            <Card title="Mis Solicitudes" padding="none">
                {loadingRequests ? (
                    <div className="py-8">
                        <Loading message="Cargando solicitudes..." />
                    </div>
                ) : (
                    <Table
                        columns={requestColumns}
                        data={requests}
                        emptyMessage="No tienes solicitudes de retiro"
                    />
                )}
            </Card>
        </div>
    );
};

export default WithdrawalRequestPage;