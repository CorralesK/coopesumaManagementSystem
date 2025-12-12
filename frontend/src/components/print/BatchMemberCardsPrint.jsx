/**
 * BatchMemberCardsPrint Component
 * Componente para impresion de carnets de miembros en lote
 * Optimizado para imprimir 2 carnets por fila, 4 por pagina
 */

import PropTypes from 'prop-types';
import MemberCard from '../members/MemberCard';

const BatchMemberCardsPrint = ({
    members = [],
    cooperativeName = 'Coopesuma'
}) => {
    // Dividir miembros en grupos de 4 (2x2 por página)
    const pages = [];
    for (let i = 0; i < members.length; i += 4) {
        pages.push(members.slice(i, i + 4));
    }

    return (
        <div className="batch-cards-print">
            <style>{`
                .batch-cards-print {
                    background: white;
                    font-family: 'Arial', sans-serif;
                }
                .batch-cards-print .print-page {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-content: flex-start;
                    gap: 8mm;
                    page-break-after: always;
                    min-height: 250mm;
                    padding: 5mm 0;
                }
                .batch-cards-print .print-page:last-child {
                    page-break-after: auto;
                }
                .batch-cards-print .carnet-wrapper {
                    flex: 0 0 auto;
                }

                /* Override MemberCard container styles for batch print */
                .batch-cards-print .member-card-container {
                    margin: 0 !important;
                    padding: 0 !important;
                }

                @media print {
                    .batch-cards-print {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .batch-cards-print .print-page {
                        gap: 8mm !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        min-height: auto !important;
                        height: auto !important;
                    }
                    .batch-cards-print .carnet-wrapper {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .batch-cards-print .member-card-container {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .batch-cards-print .member-card {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                }

                @media screen {
                    .batch-cards-print .print-page {
                        border-bottom: 2px dashed #ccc;
                        margin-bottom: 10px;
                        padding-bottom: 10px;
                    }
                    .batch-cards-print .print-page:last-child {
                        border-bottom: none;
                    }
                }
            `}</style>

            {pages.map((pageMembers, pageIndex) => (
                <div key={pageIndex} className="print-page">
                    {pageMembers.map((member, index) => (
                        <div key={member.memberId || index} className="carnet-wrapper">
                            <MemberCard
                                member={member}
                                cooperativeName={cooperativeName}
                                showCutLines={false}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

BatchMemberCardsPrint.propTypes = {
    members: PropTypes.arrayOf(PropTypes.shape({
        memberId: PropTypes.number,
        fullName: PropTypes.string,
        identification: PropTypes.string,
        photoUrl: PropTypes.string,
        qrCodeDataUrl: PropTypes.string
    })),
    cooperativeName: PropTypes.string
};

export default BatchMemberCardsPrint;