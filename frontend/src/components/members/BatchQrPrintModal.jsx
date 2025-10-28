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
import MemberCard from './MemberCard';
import { GRADES } from '../../utils/constants';

/**
 * BatchQrPrintModal Component
 * Allows batch printing of QR codes for multiple members
 */
const BatchQrPrintModal = ({ isOpen, onClose, members, filterGrade }) => {
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [qrCodes, setQrCodes] = useState([]);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [statusFilter, setStatusFilter] = useState('true'); // active by default
    const [gradeFilter, setGradeFilter] = useState(filterGrade || '');

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedMembers([]);
            setQrCodes([]);
            setShowPrintPreview(false);
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

    // Generate QR codes for selected members
    const handleGenerateQRCodes = async () => {
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
            const qrData = response.data.data;

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

            setQrCodes(sortedQRs);
            setShowPrintPreview(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al generar códigos QR');
        } finally {
            setLoading(false);
        }
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    if (!isOpen) return null;

    return (
        <>
            <Modal isOpen={isOpen && !showPrintPreview} onClose={onClose} title="Impresión en Lote de Carnets" size="lg">
                <div className="space-y-4">
                    {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                    {loading ? (
                        <Loading message="Generando carnets..." />
                    ) : (
                        <>
                            {/* Instructions */}
                            <div className="bg-primary-50 border-l-4 border-primary-500 p-4">
                                <p className="text-sm text-primary-700">
                                    Selecciona los miembros para los cuales deseas imprimir carnets estudiantiles.
                                    Los carnets se ordenarán por grado y nombre alfabético.
                                </p>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Estado"
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

                            {/* Select All Button */}
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    {selectedMembers.length} de {sortedMembers.length} seleccionados
                                    {selectedMembers.length > 100 && <span className="text-red-600 font-semibold"> (Máx: 100)</span>}
                                </p>
                                <Button onClick={handleSelectAll} variant="outline" size="sm">
                                    {selectedMembers.length === sortedMembers.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                </Button>
                            </div>

                            {/* Members List */}
                            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                {sortedMembers.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No hay miembros que coincidan con los filtros seleccionados
                                    </div>
                                ) : (
                                    sortedMembers.map(member => (
                                    <label
                                        key={member.memberId}
                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(member.memberId)}
                                            onChange={() => handleToggleMember(member.memberId)}
                                            className="w-4 h-4 text-primary-600 rounded focus:ring-blue-500"
                                        />
                                        <div className="ml-3 flex items-center flex-1">
                                            {member.photoUrl && (
                                                <img
                                                    src={member.photoUrl}
                                                    alt={member.fullName}
                                                    className="w-10 h-10 rounded-full mr-3 object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{member.fullName}</p>
                                                <p className="text-sm text-gray-500">
                                                    {member.identification} - Grado {member.grade}°
                                                </p>
                                            </div>
                                        </div>
                                    </label>
                                    ))
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Button onClick={onClose} variant="outline">
                                    Cancelar
                                </Button>
                                <Button onClick={handleGenerateQRCodes} variant="primary" disabled={selectedMembers.length === 0 || selectedMembers.length > 100}>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Generar Carnets ({selectedMembers.length})
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Print Preview Modal */}
            {showPrintPreview && (
                <Modal isOpen={showPrintPreview} onClose={() => setShowPrintPreview(false)} title="Vista Previa de Carnets" size="xl">
                    <div className="space-y-4">
                        <Alert
                            type="success"
                            message={`Se generaron ${qrCodes.length} carnets exitosamente`}
                        />

                        {/* Print Controls */}
                        <div className="flex justify-end space-x-3 no-print">
                            <Button onClick={() => setShowPrintPreview(false)} variant="outline">
                                Cerrar
                            </Button>
                            <Button onClick={handlePrint} variant="primary">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir Carnets
                            </Button>
                        </div>

                        {/* Carnets Grid for Printing - 4 per page */}
                        <div className="carnets-grid">
                            {qrCodes.map((qr) => (
                                <div key={qr.memberId} className="carnet-wrapper">
                                    <MemberCard member={qr} showCutLines={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}

            {/* Print Styles */}
            <style>{`
                .carnets-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10mm;
                    padding: 10mm;
                }

                .carnet-wrapper {
                    page-break-inside: avoid;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                @media print {
                    body * {
                        visibility: hidden;
                    }

                    .carnets-grid,
                    .carnets-grid * {
                        visibility: visible;
                    }

                    .carnets-grid {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10mm;
                        padding: 10mm;
                    }

                    .no-print {
                        display: none !important;
                    }

                    .carnet-wrapper {
                        page-break-inside: avoid;
                    }

                    @page {
                        size: Letter portrait;
                        margin: 10mm;
                    }

                    /* Force page break after every 4 cards (2 rows) */
                    .carnet-wrapper:nth-child(4n) {
                        page-break-after: always;
                    }
                }
            `}</style>
        </>
    );
};

export default BatchQrPrintModal;
