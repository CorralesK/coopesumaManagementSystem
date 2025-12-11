/**
 * @file SavingsManagementPage.jsx
 * @description Page for managing member savings with Excel-like monthly view
 * @module pages/savings
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSavingsInventoryByYear } from '../../hooks/useSavingsInventory';
import { formatCurrency, normalizeText } from '../../utils/formatters';
import { printSavingsReceipt } from '../../utils/printUtils';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import api from '../../services/api';

const MONTHS = [
    { key: 'february', label: 'Feb' },
    { key: 'march', label: 'Mar' },
    { key: 'april', label: 'Abr' },
    { key: 'may', label: 'May' },
    { key: 'june', label: 'Jun' },
    { key: 'july', label: 'Jul' },
    { key: 'august', label: 'Ago' },
    { key: 'september', label: 'Sep' },
    { key: 'october', label: 'Oct' },
    { key: 'november', label: 'Nov' },
    { key: 'december', label: 'Dic' }
];

const ITEMS_PER_PAGE = 10;

const SavingsManagementPage = () => {
    const currentYear = new Date().getFullYear();
    const [calendarYear, setCalendarYear] = useState(2025);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [depositData, setDepositData] = useState({ amount: '', description: '' });
    const [withdrawalData, setWithdrawalData] = useState({ amount: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const { data: inventory, loading, error: fetchError, refetch } = useSavingsInventoryByYear(calendarYear);

    const handleOpenDepositModal = () => {
        setSelectedMember(null);
        setMemberSearchTerm('');
        setDepositData({ amount: '', description: '' });
        setShowDepositModal(true);
    };

    const handleOpenWithdrawalModal = () => {
        setSelectedMember(null);
        setMemberSearchTerm('');
        setWithdrawalData({ amount: '', description: '' });
        setShowWithdrawalModal(true);
    };

    const handleSelectMember = (member) => {
        setSelectedMember({
            member_id: member.memberId,
            full_name: member.fullName,
            member_code: member.memberCode,
            current_balance: member.totalSaved,
            is_active: member.isActive !== false // Default to true if not specified
        });
        setMemberSearchTerm('');
    };

    const handleSubmitDeposit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validations
        if (!selectedMember) {
            setError('Debe seleccionar un miembro');
            return;
        }

        if (selectedMember.is_active === false) {
            setError('No se pueden realizar transacciones para miembros inactivos');
            return;
        }

        const amount = parseFloat(depositData.amount);
        if (!depositData.amount || amount <= 0) {
            setError('El monto debe ser mayor a cero');
            return;
        }

        const previousBalance = parseFloat(selectedMember.current_balance) || 0;
        const newBalance = previousBalance + amount;
        const transactionDate = new Date();

        try {
            setSubmitting(true);
            const response = await api.post('/savings/deposits', {
                memberId: selectedMember.member_id,
                amount: amount,
                description: depositData.description || `Depósito de ahorros - ${selectedMember.full_name}`,
                transactionDate: transactionDate.toISOString()
            });

            // Print receipt after successful transaction
            printSavingsReceipt({
                transactionType: 'deposit',
                member: selectedMember,
                amount: amount,
                previousBalance: previousBalance,
                newBalance: newBalance,
                description: depositData.description,
                transactionDate: transactionDate,
                transactionId: response?.data?.transactionId || ''
            });

            setSuccessMessage('Depósito registrado exitosamente. Imprimiendo recibo...');
            setShowDepositModal(false);
            setDepositData({ amount: '', description: '' });
            setSelectedMember(null);
            refetch();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al registrar depósito';
            setError(`Error en el depósito: ${errorMessage}. La transacción no se ha guardado.`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitWithdrawal = async (e) => {
        e.preventDefault();
        setError(null);

        // Validations
        if (!selectedMember) {
            setError('Debe seleccionar un miembro');
            return;
        }

        if (selectedMember.is_active === false) {
            setError('No se pueden realizar transacciones para miembros inactivos');
            return;
        }

        const currentBalance = parseFloat(selectedMember.current_balance) || 0;

        if (currentBalance <= 0) {
            setError('El miembro no tiene saldo disponible para retirar');
            return;
        }

        const amount = parseFloat(withdrawalData.amount);
        if (!withdrawalData.amount || amount <= 0) {
            setError('El monto debe ser mayor a cero');
            return;
        }

        if (amount > currentBalance) {
            setError(`El monto de retiro (${formatCurrency(amount)}) no puede ser mayor al saldo disponible (${formatCurrency(currentBalance)})`);
            return;
        }

        const previousBalance = currentBalance;
        const newBalance = previousBalance - amount;
        const transactionDate = new Date();

        try {
            setSubmitting(true);
            const response = await api.post('/savings/withdrawals', {
                memberId: selectedMember.member_id,
                amount: amount,
                description: withdrawalData.description || `Retiro de ahorros - ${selectedMember.full_name}`,
                transactionDate: transactionDate.toISOString()
            });

            // Print receipt after successful transaction
            printSavingsReceipt({
                transactionType: 'withdrawal',
                member: selectedMember,
                amount: amount,
                previousBalance: previousBalance,
                newBalance: newBalance,
                description: withdrawalData.description,
                transactionDate: transactionDate,
                transactionId: response?.data?.transactionId || ''
            });

            setSuccessMessage('Retiro registrado exitosamente. Imprimiendo recibo...');
            setShowWithdrawalModal(false);
            setWithdrawalData({ amount: '', description: '' });
            setSelectedMember(null);
            refetch();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error al registrar retiro';
            setError(`Error en el retiro: ${errorMessage}. La transacción no se ha guardado.`);
        } finally {
            setSubmitting(false);
        }
    };

    // Filter members by search term (supports search with or without accents)
    const filteredMembers = useMemo(() => {
        const members = inventory?.members || [];
        if (!searchTerm) return members;
        const normalizedSearch = normalizeText(searchTerm);
        return members.filter(member =>
            normalizeText(member.fullName).includes(normalizedSearch) ||
            normalizeText(member.memberCode).includes(normalizedSearch)
        );
    }, [inventory?.members, searchTerm]);

    // Filter members for modal search (supports search with or without accents)
    const modalFilteredMembers = useMemo(() => {
        const members = inventory?.members || [];
        if (!memberSearchTerm) return [];
        const normalizedSearch = normalizeText(memberSearchTerm);
        return members.filter(member =>
            normalizeText(member.fullName).includes(normalizedSearch) ||
            normalizeText(member.memberCode).includes(normalizedSearch)
        ).slice(0, 10); // Limit to 10 results
    }, [inventory?.members, memberSearchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMembers, currentPage]);

    // Reset to page 1 when search changes
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    if (loading && !inventory) {
        return <Loading message="Cargando ahorros..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Ahorros</h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        onClick={handleOpenDepositModal}
                        variant="primary"
                        className="whitespace-nowrap flex-1 sm:flex-none"
                        disabled={!inventory?.members?.length || loading}
                        title={!inventory?.members?.length ? 'No hay miembros disponibles' : ''}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Depositar
                    </Button>
                    <Button
                        onClick={handleOpenWithdrawalModal}
                        variant="outline"
                        className="whitespace-nowrap flex-1 sm:flex-none"
                        disabled={!inventory?.members?.length || loading}
                        title={!inventory?.members?.length ? 'No hay miembros disponibles' : ''}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                        Retirar
                    </Button>
                </div>
            </div>

            {/* Alerts */}
            {(error || fetchError) && <Alert type="error" message={error || fetchError} onClose={() => setError(null)} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Year Filter Card */}
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-100 rounded-full">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Año</p>
                            <div className="flex items-center gap-3 mt-1">
                                {calendarYear > 2025 && (
                                    <button
                                        onClick={() => setCalendarYear(prev => prev - 1)}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}
                                <span className="text-2xl font-bold text-primary-600">
                                    {calendarYear}
                                </span>
                                {calendarYear < currentYear && (
                                    <button
                                        onClick={() => setCalendarYear(prev => prev + 1)}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Total en Ahorros */}
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Total en Ahorros</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(inventory?.totals?.totalSaved || 0)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Miembros con Ahorros */}
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Miembros con Ahorros</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {inventory?.totalMembers || 0}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Año Anterior */}
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Año Anterior</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(inventory?.totals?.previousYearBalance || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card title="Filtros de Búsqueda">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        label="Buscar"
                        name="search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onClear={() => handleSearchChange('')}
                        placeholder="Buscar nombre o número de asociado..."
                    />
                </div>
            </Card>

            {/* Members Table */}
            <Card padding="none">
                {loading ? (
                    <div className="py-8">
                        <Loading message="Cargando..." />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider lg:sticky lg:left-0 bg-gray-50 lg:z-10">
                                            Asociado
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider lg:sticky lg:left-[88px] bg-gray-50 lg:z-10">
                                            Nombre
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                                            Año Ant.
                                        </th>
                                        {MONTHS.map(month => (
                                            <th
                                                key={month.key}
                                                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                {month.label}
                                            </th>
                                        ))}
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedMembers.length === 0 ? (
                                        <tr>
                                            <td colSpan={14} className="px-4 py-12 text-center text-gray-500">
                                                No se encontraron miembros
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {paginatedMembers.map((member) => (
                                                <tr key={member.memberId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-center lg:sticky lg:left-0 bg-white lg:z-10">
                                                        <Link
                                                            to={`/members/${member.memberId}`}
                                                            className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                                        >
                                                            {member.memberCode}
                                                        </Link>
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap lg:sticky lg:left-[88px] bg-white lg:z-10">
                                                        <Link
                                                            to={`/members/${member.memberId}`}
                                                            className="font-semibold text-sm text-primary-600 hover:text-primary-700 hover:underline"
                                                        >
                                                            {member.fullName}
                                                        </Link>
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-right bg-blue-50">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {parseFloat(member.previousYearBalance) > 0
                                                                ? formatCurrency(member.previousYearBalance)
                                                                : '—'}
                                                        </span>
                                                    </td>
                                                    {MONTHS.map(month => (
                                                        <td
                                                            key={month.key}
                                                            className="px-2 py-3 whitespace-nowrap text-right"
                                                        >
                                                            <span className={`text-sm font-medium ${
                                                                parseFloat(member[month.key]) > 0
                                                                    ? 'text-green-600'
                                                                    : parseFloat(member[month.key]) < 0
                                                                    ? 'text-red-600'
                                                                    : 'text-gray-400'
                                                            }`}>
                                                                {parseFloat(member[month.key]) !== 0
                                                                    ? formatCurrency(member[month.key])
                                                                    : '—'}
                                                            </span>
                                                        </td>
                                                    ))}
                                                    <td className="px-3 py-3 whitespace-nowrap text-right bg-green-50">
                                                        <span className="text-sm font-bold text-green-700">
                                                            {formatCurrency(member.totalSaved || 0)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* Totals Row */}
                                            {inventory?.totals && (
                                                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                                    <td colSpan="2" className="px-4 py-3 text-sm lg:sticky lg:left-0 bg-gray-100 lg:z-10">
                                                        TOTALES
                                                    </td>
                                                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm text-blue-700 bg-blue-100">
                                                        {formatCurrency(inventory.totals.previousYearBalance || 0)}
                                                    </td>
                                                    {MONTHS.map(month => (
                                                        <td
                                                            key={month.key}
                                                            className="px-2 py-3 whitespace-nowrap text-right text-sm text-gray-900"
                                                        >
                                                            {formatCurrency(inventory.totals[month.key] || 0)}
                                                        </td>
                                                    ))}
                                                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm text-green-800 bg-green-100">
                                                        {formatCurrency(inventory.totals.totalSaved || 0)}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-3">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </>
                )}
            </Card>

            {/* Deposit Modal */}
            <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="Registrar Depósito" size="lg">
                <form onSubmit={handleSubmitDeposit} className="space-y-6">
                    {error && (
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    )}

                    {/* Member Selection */}
                    {!selectedMember ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Miembro *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={memberSearchTerm}
                                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Buscar nombre o número de asociado..."
                                    autoFocus
                                />
                                {memberSearchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setMemberSearchTerm('')}
                                        className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                        title="Limpiar"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                {modalFilteredMembers.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {modalFilteredMembers.map(member => (
                                            <button
                                                key={member.memberId}
                                                type="button"
                                                onClick={() => handleSelectMember(member)}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-100 flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                            >
                                                <span className="text-sm font-medium text-gray-900">{member.fullName}</span>
                                                <span className="text-xs text-gray-500">{member.memberCode}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-700"><strong>Miembro:</strong> {selectedMember.full_name} ({selectedMember.member_code})</p>
                                    <p className="text-sm text-gray-700 mt-1"><strong>Saldo actual:</strong> {formatCurrency(selectedMember.current_balance || 0)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMember(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                    title="Cambiar miembro"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monto del Depósito *</label>
                        <div className={`flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 ${!selectedMember ? 'bg-gray-100' : 'bg-white'}`}>
                            <span className="pl-3 text-gray-500">₡</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={depositData.amount}
                                onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                                className="flex-1 py-2 pl-1 pr-3 border-0 bg-transparent focus:outline-none focus:ring-0"
                                placeholder="0.00"
                                required
                                disabled={!selectedMember}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nota (Opcional)</label>
                        <textarea
                            value={depositData.description}
                            onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Descripción del depósito..."
                            disabled={!selectedMember}
                        />
                    </div>

                    <div className="flex justify-center space-x-3">
                        <Button type="button" onClick={() => setShowDepositModal(false)} variant="outline">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting || !selectedMember}>
                            {submitting ? 'Procesando...' : 'Registrar Depósito'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Withdrawal Modal */}
            <Modal isOpen={showWithdrawalModal} onClose={() => setShowWithdrawalModal(false)} title="Registrar Retiro" size="lg">
                <form onSubmit={handleSubmitWithdrawal} className="space-y-6">
                    {error && (
                        <Alert type="error" message={error} onClose={() => setError(null)} />
                    )}

                    {/* Member Selection */}
                    {!selectedMember ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Miembro *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={memberSearchTerm}
                                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Buscar nombre o número de asociado..."
                                    autoFocus
                                />
                                {memberSearchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setMemberSearchTerm('')}
                                        className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                        title="Limpiar"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                {modalFilteredMembers.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {modalFilteredMembers.map(member => (
                                            <button
                                                key={member.memberId}
                                                type="button"
                                                onClick={() => handleSelectMember(member)}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-100 flex justify-between items-center border-b border-gray-100 last:border-b-0"
                                            >
                                                <span className="text-sm font-medium text-gray-900">{member.fullName}</span>
                                                <span className="text-xs text-gray-500">{member.memberCode} - {formatCurrency(member.totalSaved || 0)}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-700"><strong>Miembro:</strong> {selectedMember.full_name} ({selectedMember.member_code})</p>
                                    <p className="text-sm text-gray-700 mt-1"><strong>Saldo disponible:</strong> {formatCurrency(selectedMember.current_balance || 0)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMember(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                    title="Cambiar miembro"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {parseFloat(selectedMember.current_balance) <= 0 && (
                                <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
                                    <div className="flex">
                                        <svg className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm text-orange-700">
                                            Este miembro no tiene saldo disponible para realizar retiros. Por favor, seleccione otro miembro o realice un depósito primero.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monto del Retiro *</label>
                        <div className={`flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 ${!selectedMember ? 'bg-gray-100' : 'bg-white'}`}>
                            <span className="pl-3 text-gray-500">₡</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={selectedMember?.current_balance}
                                value={withdrawalData.amount}
                                onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                                className="flex-1 py-2 pl-1 pr-3 border-0 bg-transparent focus:outline-none focus:ring-0"
                                placeholder="0.00"
                                required
                                disabled={!selectedMember}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nota (Opcional)</label>
                        <textarea
                            value={withdrawalData.description}
                            onChange={(e) => setWithdrawalData({ ...withdrawalData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Motivo del retiro..."
                            disabled={!selectedMember}
                        />
                    </div>

                    <div className="flex justify-center space-x-3">
                        <Button type="button" onClick={() => setShowWithdrawalModal(false)} variant="outline">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={submitting || !selectedMember || parseFloat(selectedMember?.current_balance) <= 0}>
                            {submitting ? 'Procesando...' : 'Registrar Retiro'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SavingsManagementPage;