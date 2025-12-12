/**
 * BatchMemberCardsPrint Component
 * Componente para impresion de carnets de miembros en lote
 * Optimizado para imprimir 2 carnets por fila, 3 filas por pagina (6 por pagina)
 */

import PropTypes from 'prop-types';
import MemberCard from '../members/MemberCard';

const BatchMemberCardsPrint = ({
    members = [],
    cooperativeName = 'Coopesuma'
}) => {
    // Dividir miembros en grupos de 6 (2x3 por página)
    const pages = [];
    for (let i = 0; i < members.length; i += 6) {
        pages.push(members.slice(i, i + 6));
    }

    return (
        <div className="batch-cards-print">
            <style>{`
                .batch-cards-print {
                    background: white;
                    font-family: 'Arial', sans-serif;
                }
                .batch-cards-print .print-page {
                    display: grid;
                    grid-template-columns: repeat(2, 100mm);
                    grid-template-rows: repeat(3, auto);
                    gap: 4mm 6mm;
                    justify-content: center;
                    align-content: start;
                    page-break-after: always;
                    padding: 2mm 0;
                }
                .batch-cards-print .print-page:last-child {
                    page-break-after: auto;
                }
                .batch-cards-print .carnet-wrapper {
                    width: 100mm;
                    height: 63mm;
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
                        gap: 4mm 6mm !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .batch-cards-print .carnet-wrapper,
                    .batch-cards-print .member-card-container,
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