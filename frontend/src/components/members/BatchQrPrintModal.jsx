/**
 * @file BatchQrPrintModal.jsx
 * @description Modal for batch QR code printing
 * @module components/members
 */

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loading from '../common/Loading';
import Alert from '../common/Alert';
import Select from '../common/Select';
import { batchGenerateQRCodes } from '../../services/memberService';
import { printMemberCards } from '../../utils/printUtils';
import { GRADES } from '../../utils/constants';

/**
 * BatchQrPrintModal Component
 * Allows batch printing of QR codes for multiple members
 */
const BatchQrPrintModal = ({ isOpen, onClose, members, filterGrade }) => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('true'); // active by default
    const [gradeFilter, setGradeFilter] = useState(filterGrade || '');

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedMembers([]);
            setError(null);
            setStatusFilter('true');
            setGradeFilter(filterGrade || '');
        }
    }, [isOpen, filterGrade]);

    // Filter members based on status and grade
    const filteredMembers = members.filter(member => {
        const statusMatch = statusFilter === '' || member.isActive === (statusFilter === 'true');
        const gradeMatch = gradeFilter === '' || member.grade === parseInt(gradeFilter);
        return statusMatch && gradeMatch;
    });

    // Sort members by grade (ascending) and name (alphabetical)
    const sortedMembers = [...filteredMembers].sort((a, b) => {
        if (a.grade !== b.grade) {
            return a.grade - b.grade;
        }
        return a.fullName.localeCompare(b.fullName, 'es');
    });

    // Handle select all/none
    const handleSelectAll = () => {
        if (selectedMembers.length === sortedMembers.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(sortedMembers.map(m => m.memberId));
        }
    };

    // Handle individual member selection
    const handleToggleMember = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    // Generate QR codes and print directly
    const handleGenerateAndPrint = async () => {
        if (selectedMembers.length === 0) {
            setError('Por favor selecciona al menos un miembro');
            return;
        }

        if (selectedMembers.length > 100) {
            setError('El límite máximo es de 100 carnets por lote. Por favor, reduce la selección.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await batchGenerateQRCodes(selectedMembers);
            const qrData = response.data;

            // Filter out errors
            const successfulQRs = qrData.filter(qr => !qr.error);

            if (successfulQRs.length === 0) {
                setError('No se pudo generar ningún código QR');
                return;
            }

            // Sort QR codes by grade and name
            const sortedQRs = successfulQRs.sort((a, b) => {
                if (a.grade !== b.grade) {
                    return a.grade - b.grade;
                }
                return a.fullName.localeCompare(b.fullName, 'es');
            });

            // Open print window with cards
            printMemberCards({
                members: sortedQRs,
                cooperativeName: 'Coopesuma'
            });

            // Close modal after opening print window
            onClose();
        } catch (err) {
            setError(err.message || 'Error al generar códigos QR');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Impresión de Carnets Estudiantiles" size="lg">
            <div className="space-y-6">
                {/* Error Alert */}
                {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                {loading ? (
                    <div className="py-8">
                        <Loading message="Generando carnets..." />
                    </div>
                ) : (
                    <>
                        {/* Instructions */}
                        <div className="bg-primary-50 border-l-4 border-primary-500 p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm text-primary-700 leading-relaxed">
                                        Selecciona los miembros para generar sus carnets estudiantiles. Los carnets se imprimirán
                                        en formato de 4 por hoja (2x2) y se ordenarán por grado y nombre alfabéticamente.
                                    </p>
                                    <p className="text-sm text-primary-700 mt-2 font-medium">
                                        Límite máximo: 100 carnets por lote
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtros de Búsqueda</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Select
                                    label="Estado del Miembro"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    options={[
                                        { value: 'true', label: 'Solo Activos' },
                                        { value: 'false', label: 'Solo Inactivos' },
                                        { value: '', label: 'Todos' }
                                    ]}
                                />
                                <Select
                                    label="Grado"
                                    value={gradeFilter}
                                    onChange={(e) => setGradeFilter(e.target.value)}
                                    options={[
                                        { value: '', label: 'Todos los grados' },
                                        ...GRADES.map(g => ({ value: g.toString(), label: `${g}° grado` }))
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-200"></div>

                        {/* Selection Header */}
                        <div>
                            <div className="flex justify-between items-center mb-5 mt-1">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Miembros Disponibles</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium text-primary-600">{selectedMembers.length}</span> de {sortedMembers.length} seleccionados
                                        {selectedMembers.length > 100 && (
                                            <span className="text-red-600 font-semibold ml-2">
                                                ⚠ Excede el límite de 100
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleSelectAll}
                                    variant="outline"
                                    size="sm"
                                    className="whitespace-nowrap"
                                >
                                    {selectedMembers.length === sortedMembers.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                </Button>
                            </div>

                            {/* Members List */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="max-h-96 overflow-y-auto">
                                    {sortedMembers.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="mt-2 text-sm text-gray-500">No hay miembros que coincidan con los filtros seleccionados</p>
                                            <p className="text-xs text-gray-400 mt-1">Prueba ajustando los filtros de búsqueda</p>
                                        </div>
                                    ) : (
                                        sortedMembers.map((member, index) => (
                                            <label
                                                key={member.memberId}
                                                className={`grid grid-cols-[auto_auto_1fr_auto] gap-4 items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                                                    index !== sortedMembers.length - 1 ? 'border-b border-gray-200' : ''
                                                }`}
                                            >
                                                <div className="flex items-center justify-center pl-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMembers.includes(member.memberId)}
                                                        onChange={() => handleToggleMember(member.memberId)}
                                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                                                    />
                                                </div>

                                                {member.photoUrl && (
                                                    <img
                                                        src={member.photoUrl}
                                                        alt={member.fullName}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                                                    />
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{member.fullName}</p>
                                                    <p className="text-sm text-gray-500 mt-0.5">{member.identification}</p>
                                                </div>

                                                <div className="pr-2">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 whitespace-nowrap">
                                                        {member.grade}° Grado
                                                    </span>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 mt-6 border-t border-gray-200">
                            <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleGenerateAndPrint}
                                variant="primary"
                                disabled={selectedMembers.length === 0 || selectedMembers.length > 100}
                                className="w-full sm:w-auto"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir Carnets ({selectedMembers.length})
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default BatchQrPrintModal;
