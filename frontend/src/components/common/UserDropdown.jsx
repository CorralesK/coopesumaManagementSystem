/**
 * @file UserDropdown.jsx
 * @description Professional user dropdown component for header (desktop only)
 * @module components/common
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { USER_ROLES } from '../../utils/constants';

/**
 * UserDropdown Component
 * Displays user information and logout button in a dropdown menu
 * Only visible on desktop (lg screens and up)
 */
const UserDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const getRoleLabel = (role) => {
        const roleLabels = {
            [USER_ROLES.ADMINISTRATOR]: 'Administrador',
            [USER_ROLES.REGISTRAR]: 'Registrador',
            [USER_ROLES.TREASURER]: 'Tesorero',
            [USER_ROLES.STUDENT]: 'Estudiante'
        };
        return roleLabels[role] || role;
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Icon Button - Professional & Minimalist */}
            <button
                onClick={toggleDropdown}
                className="flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
                aria-label="Menú de usuario"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {/* User Icon - Heroicons style */}
                <svg className="w-8 h-8 lg:w-9 lg:h-9" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                </svg>
            </button>

            {/* Dropdown Menu - Professional Design */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 animate-fadeIn">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.fullName}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {getRoleLabel(user?.role)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="p-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onLogout();
                            }}
                            className="group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 hover:shadow-md hover:font-semibold"
                        >
                            <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

UserDropdown.propTypes = {
    user: PropTypes.shape({
        fullName: PropTypes.string,
        role: PropTypes.string
    }),
    onLogout: PropTypes.func.isRequired
};

export default UserDropdown;
