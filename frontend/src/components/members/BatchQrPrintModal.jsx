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
import { batchGenerateQRCodes } from '../../services/memberService';

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

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedMembers([]);
            setQrCodes([]);
            setShowPrintPreview(false);
            setError(null);
        }
    }, [isOpen]);

    // Handle select all/none
    const handleSelectAll = () => {
        if (selectedMembers.length === members.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(members.map(m => m.memberId));
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

            setQrCodes(successfulQRs);
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
            <Modal isOpen={isOpen && !showPrintPreview} onClose={onClose} title="Impresión en Lote de Códigos QR" size="lg">
                <div className="space-y-4">
                    {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

                    {loading ? (
                        <Loading message="Generando códigos QR..." />
                    ) : (
                        <>
                            {/* Instructions */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                <p className="text-sm text-blue-700">
                                    Selecciona los miembros para los cuales deseas imprimir códigos QR.
                                    {filterGrade && ` (Filtrando por grado ${filterGrade}°)`}
                                </p>
                            </div>

                            {/* Select All Button */}
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    {selectedMembers.length} de {members.length} seleccionados
                                </p>
                                <Button onClick={handleSelectAll} variant="outline" size="sm">
                                    {selectedMembers.length === members.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                </Button>
                            </div>

                            {/* Members List */}
                            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                {members.map(member => (
                                    <label
                                        key={member.memberId}
                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(member.memberId)}
                                            onChange={() => handleToggleMember(member.memberId)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Button onClick={onClose} variant="outline">
                                    Cancelar
                                </Button>
                                <Button onClick={handleGenerateQRCodes} variant="primary" disabled={selectedMembers.length === 0}>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Generar e Imprimir ({selectedMembers.length})
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Print Preview Modal */}
            {showPrintPreview && (
                <Modal isOpen={showPrintPreview} onClose={() => setShowPrintPreview(false)} title="Vista Previa de Impresión" size="xl">
                    <div className="space-y-4">
                        <Alert
                            type="success"
                            message={`Se generaron ${qrCodes.length} códigos QR exitosamente`}
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
                                Imprimir
                            </Button>
                        </div>

                        {/* QR Codes Grid for Printing */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3">
                            {qrCodes.map((qr) => (
                                <div key={qr.memberId} className="border-2 border-gray-300 rounded-lg p-4 text-center page-break-inside-avoid">
                                    <div className="bg-white p-2 rounded">
                                        <img
                                            src={qr.qrCodeDataUrl}
                                            alt={`QR ${qr.fullName}`}
                                            className="w-full max-w-[200px] mx-auto"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <p className="font-semibold text-sm">{qr.fullName}</p>
                                        <p className="text-xs text-gray-600">{qr.identification}</p>
                                        <p className="text-xs text-gray-500">Grado {qr.grade}°</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                    }
                    @page {
                        margin: 0.5cm;
                    }
                }
            `}</style>
        </>
    );
};

export default BatchQrPrintModal;
