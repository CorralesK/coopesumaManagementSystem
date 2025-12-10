/**
 * Contributions Management Page
 * Admin page for managing member contributions
 */

import React, { useState, useEffect } from 'react';
import Alert from '../../components/common/Alert';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency, normalizeText } from '../../utils/formatters';

const ContributionsManagementPage = () => {
    const [report, setReport] = useState([]);
    const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        tractNumber: '',
        description: ''
    });
    const [paymentType, setPaymentType] = useState('tract'); // 'tract' or 'full'
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchContributionsReport();
    }, [fiscalYear]);

    const fetchContributionsReport = async () => {
        try {
            setLoading(true);
            const response = await api.get('/contributions/report', {
                params: { fiscalYear }
            });
            setReport(response.data.data || []);
        } catch (error) {
            console.error('Error fetching contributions report:', error);
            setError('Error al cargar reporte de aportaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPaymentModal = (member) => {
        setSelectedMember(member);
        setPaymentData({ amount: '', tractNumber: '', description: '' });
        setPaymentType('tract');
        setShowPaymentModal(true);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();

        let finalAmount = parseFloat(paymentData.amount);
        let finalTractNumber = paymentData.tractNumber;

        if (paymentType === 'full') {
            finalAmount = 900;
            finalTractNumber = null; // El backend lo dividirá automáticamente
        }

        if (!finalAmount || finalAmount <= 0) {
            setError('El monto debe ser mayor a cero');
            return;
        }

        if (paymentType === 'tract' && (!finalTractNumber || finalTractNumber < 1 || finalTractNumber > 3)) {
            setError('Debe seleccionar un tracto válido (1, 2 o 3)');
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post('/contributions/register', {
                memberId: selectedMember.member_id,
                amount: finalAmount,
                tractNumber: finalTractNumber,
                description: paymentData.description || `Aportación - ${selectedMember.full_name}`,
                transactionDate: new Date().toISOString()
            });

            if (response.data.data.isFullPayment) {
                setSuccessMessage('Pago completo registrado y dividido en 3 tractos automáticamente');
            } else {
                setSuccessMessage(`Aportación registrada exitosamente para el tracto ${finalTractNumber}`);
            }

            setShowPaymentModal(false);
            setPaymentData({ amount: '', tractNumber: '', description: '' });
            fetchContributionsReport();
        } catch (error) {
            console.error('Error registering contribution:', error);
            setError(error.response?.data?.message || 'Error al registrar aportación');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredReport = report.filter(member => {
        const normalizedSearch = normalizeText(searchTerm);
        return normalizeText(member.full_name).includes(normalizedSearch) ||
            normalizeText(member.member_code).includes(normalizedSearch) ||
            member.identification?.includes(searchTerm);
    });

    const getCompletionBadge = (member) => {
        const completed = member.tracts_completed || 0;
        if (completed >= 3) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Completo</span>;
        } else if (completed > 0) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">{completed}/3 Tractos</span>;
        } else {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Pendiente</span>;
        }
    };

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push(i);
        }
        return years;
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Aportaciones</h1>
                <p className="text-gray-600">
                    Administra las aportaciones de todos los miembros (₡900 anuales en 3 tractos)
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre, código o cédula..."
                            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                title="Limpiar"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <div>
                    <select
                        value={fiscalYear}
                        onChange={(e) => setFiscalYear(parseInt(e.target.value))}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {generateYearOptions().map(year => (
                            <option key={year} value={year}>
                                Año Fiscal {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Info Banner */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 text-sm text-blue-700">
                        <p><strong>Sistema de Aportaciones:</strong></p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Total anual: ₡900.00 dividido en 3 tractos de ₡300.00 cada uno</li>
                            <li>Puede pagar por tracto individual o pago completo (se divide automáticamente)</li>
                            <li>La cuota de afiliación (₡500) se cobra una sola vez al crear el miembro</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <p className="mt-2 text-gray-600">Cargando datos...</p>
                        </div>
                    ) : filteredReport.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">No se encontraron miembros</p>
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
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tractos Completados
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Aportado
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReport.map((member) => (
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {[1, 2, 3].map(tract => (
                                                    <div
                                                        key={tract}
                                                        className={`w-3 h-3 rounded-full ${
                                                            (member.tracts_completed || 0) >= tract
                                                                ? 'bg-green-500'
                                                                : 'bg-gray-300'
                                                        }`}
                                                        title={`Tracto ${tract}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500 mt-1 block">
                                                {member.tracts_completed || 0}/3
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(member.total_contributed || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getCompletionBadge(member)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {(member.tracts_completed || 0) < 3 && (
                                                <button
                                                    onClick={() => handleOpenPaymentModal(member)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Registrar Pago
                                                </button>
                                            )}
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

            {/* Payment Modal */}
            {showPaymentModal && selectedMember && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowPaymentModal(false)} />

                        <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Registrar Aportación
                                </h3>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
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
                                    <strong>Tractos completados:</strong> {selectedMember.tracts_completed || 0}/3
                                </p>
                            </div>

                            {/* Payment Type Selection */}
                            <div className="mb-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentType('tract')}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        paymentType === 'tract'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Pago por Tracto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentType('full')}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        paymentType === 'full'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Pago Completo (₡900)
                                </button>
                            </div>

                            <form onSubmit={handleSubmitPayment}>
                                <div className="space-y-4">
                                    {paymentType === 'tract' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Seleccionar Tracto *
                                                </label>
                                                <select
                                                    value={paymentData.tractNumber}
                                                    onChange={(e) => setPaymentData({ ...paymentData, tractNumber: e.target.value, amount: '300' })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    required
                                                >
                                                    <option value="">Seleccione un tracto</option>
                                                    <option value="1">Tracto 1 (₡300)</option>
                                                    <option value="2">Tracto 2 (₡300)</option>
                                                    <option value="3">Tracto 3 (₡300)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Monto *
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500">₡</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={paymentData.amount}
                                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                        placeholder="300.00"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <p className="text-sm text-green-700">
                                                <strong>Pago Completo: ₡900.00</strong>
                                            </p>
                                            <p className="text-xs text-green-600 mt-1">
                                                El sistema dividirá automáticamente este pago en 3 tractos de ₡300 cada uno
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nota (Opcional)
                                        </label>
                                        <textarea
                                            value={paymentData.description}
                                            onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Descripción de la aportación..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
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
                                                Registrar Aportación
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

export default ContributionsManagementPage;