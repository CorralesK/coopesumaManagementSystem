/**
 * BatchMemberCardsPrint Component
 * Componente para impresion de carnets de miembros en lote
 * Reutiliza el componente MemberCard para mantener consistencia
 */

import PropTypes from 'prop-types';
import MemberCard from '../members/MemberCard';

const BatchMemberCardsPrint = ({
    members = [],
    cooperativeName = 'Coopesuma'
}) => {
    return (
        <div className="batch-cards-print">
            <style>{`
                .batch-cards-print {
                    background: white;
                    font-family: 'Arial', sans-serif;
                }
                .batch-cards-print .carnets-grid {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 5mm;
                }
                .batch-cards-print .carnet-wrapper {
                    page-break-inside: avoid;
                }
                @media print {
                    .batch-cards-print {
                        padding: 0 !important;
                    }
                    .batch-cards-print .carnets-grid {
                        gap: 5mm !important;
                    }
                    .batch-cards-print .carnet-wrapper:nth-child(4n) {
                        page-break-after: always;
                    }
                }
            `}</style>

            <div className="carnets-grid">
                {members.map((member, index) => (
                    <div key={member.memberId || index} className="carnet-wrapper">
                        <MemberCard
                            member={member}
                            cooperativeName={cooperativeName}
                            showCutLines={false}
                        />
                    </div>
                ))}
            </div>
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