/**
 * Cooperative Context
 * Manages cooperative information for the application
 * Currently hardcoded to cooperative_id = 1 (will be multiempresa in the future)
 */

import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import apiService from '../services/apiService';

const CooperativeContext = createContext(null);

export const CooperativeProvider = ({ children }) => {
    const [cooperative, setCooperative] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load cooperative data on mount
    useEffect(() => {
        const fetchCooperative = async () => {
            try {
                setLoading(true);
                // Currently hardcoded to cooperative_id = 1
                // In the future, this will be determined by user/school context
                const response = await apiService.get('/cooperatives/1');
                setCooperative(response.data);
                setError(null);
            } catch (err) {
                console.error('Error loading cooperative:', err);
                setError('Error cargando información de la cooperativa');
                // Set default values if fetch fails
                setCooperative({
                    cooperativeId: 1,
                    tradeName: 'Coopesuma R.L.',
                    legalName: 'Cooperativa Estudiantil Unida Motivando el Ahorro',
                    schoolName: 'Escuela Los Chiles Aguas Zarcas'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCooperative();
    }, []);

    const value = {
        cooperative,
        loading,
        error,
        // Helper getters
        getTradeName: () => cooperative?.tradeName || 'Coopesuma R.L.',
        getLegalName: () => cooperative?.legalName || 'Cooperativa Estudiantil Unida Motivando el Ahorro',
        getSchoolName: () => cooperative?.schoolName || 'Escuela Los Chiles Aguas Zarcas'
    };

    return (
        <CooperativeContext.Provider value={value}>
            {children}
        </CooperativeContext.Provider>
    );
};

CooperativeProvider.propTypes = {
    children: PropTypes.node.isRequired
};

// Custom hook for using cooperative context
export const useCooperative = () => {
    const context = useContext(CooperativeContext);
    if (!context) {
        throw new Error('useCooperative must be used within a CooperativeProvider');
    }
    return context;
};

export default CooperativeContext;
