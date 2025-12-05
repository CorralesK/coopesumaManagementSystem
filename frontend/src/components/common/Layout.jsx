/**
 * Layout Component
 * Main layout wrapper with navigation sidebar and header
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';
import UserDropdown from './UserDropdown';
import CoopesumaLogo from '../../assets/logos/CoopesumaLogo.png';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        // Use window.location instead of navigate to force full page reload
        // This clears all React state and prevents back button issues
        window.location.href = '/login';
    };

    const isAdministrator = user?.role === USER_ROLES.ADMINISTRATOR;
    const isRegistrar = user?.role === USER_ROLES.REGISTRAR;
    const isMember = user?.role === USER_ROLES.MEMBER;
    const isManager = user?.role === USER_ROLES.MANAGER;

    // Registrars don't have sidebar access
    const showSidebar = !isRegistrar;

    // Navigation menu items based on role
    const menuItems = [
        {
            name: isMember ? 'Mi Dashboard' : 'Dashboard',
            path: isMember ? '/my-dashboard' : '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            show: true
        },
        {
            name: 'Mis Retiros',
            path: '/my-withdrawals',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            show: isMember
        },
        {
            name: 'Miembros',
            path: '/members',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            show: isAdministrator
        },
        {
            name: 'Asambleas',
            path: '/assemblies',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            show: isAdministrator
        },
        {
            name: 'Ahorros',
            path: '/savings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            show: isAdministrator || isManager
        },
        {
            name: 'Aportaciones',
            path: '/contributions',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            show: isAdministrator || isManager
        },
        {
            name: 'Solicitudes de Retiro',
            path: '/withdrawals',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            show: isAdministrator || isManager
        },
        {
            name: 'Distribución Excedentes',
            path: '/surplus',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            show: isAdministrator || isManager
        },
        {
            name: 'Liquidaciones',
            path: '/liquidations',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            show: isAdministrator
        },
        {
            name: 'Usuarios',
            path: '/users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            show: isAdministrator
        },
        {
            name: 'Notificaciones',
            path: '/notifications',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
            show: isAdministrator
        },
        {
            name: 'Reportes',
            path: '/reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            show: isAdministrator
        }
    ];

    const visibleMenuItems = menuItems.filter(item => item.show);

    const isCurrentPath = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm z-40">
                <div className="flex items-center justify-between h-16 px-4 lg:px-6 max-w-full">
                    {/* Mobile Menu Button - Hide for registrars */}
                    {showSidebar && (
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden text-gray-600 hover:text-gray-900 p-3 mr-3 transition-all duration-200"
                    >
                        {isSidebarOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                    )}

                    {/* Brand: Logo + Name (always left aligned) */}
                    <div className="flex items-center gap-2">
                        <img
                            src={CoopesumaLogo}
                            alt="COOPESUMA"
                            className="h-10 w-auto sm:h-10 md:h-12"
                        />
                        <span className="text-lg sm:text-xl font-bold text-primary-600">COOPESUMA</span>
                    </div>

                    {/* Header Content */}
                    <div className="flex items-center justify-end flex-1">
                        {/* User Dropdown - Desktop Only for admins, Always visible for registrars */}
                        <div className={showSidebar ? "hidden lg:block" : "block"}>
                            <UserDropdown user={user} onLogout={handleLogout} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar - Hide for registrars */}
            {showSidebar && (
            <aside className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:shadow-lg`}>
                <div className="flex flex-col h-full px-6 pb-8 pt-4">
                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto">
                        {visibleMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`group flex items-center gap-4 px-6 py-5 rounded-lg transition-all duration-200 ${
                                    isCurrentPath(item.path)
                                        ? 'bg-gray-100 text-gray-900 shadow-md font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:font-semibold'
                                }`}
                            >
                                <div className={`flex-shrink-0 transition-transform duration-200 ${
                                    isCurrentPath(item.path) ? '' : 'group-hover:scale-110'
                                }`}>
                                    {item.icon}
                                </div>
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User Info & Logout - Mobile Only */}
                    <div className="lg:hidden pt-4 space-y-4 border-t border-gray-200">
                        {/* User Info */}
                        <div className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                        <svg className="w-7 h-7 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user?.fullName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {user?.role === USER_ROLES.ADMINISTRATOR && 'Administrador'}
                                        {user?.role === USER_ROLES.REGISTRAR && 'Registrador'}
                                        {user?.role === USER_ROLES.MANAGER && 'Gerente'}
                                        {user?.role === USER_ROLES.MEMBER && 'Miembro'}
                                        {user?.role === USER_ROLES.TREASURER && 'Gerente'}
                                        {user?.role === USER_ROLES.STUDENT && 'Miembro'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <div className="pb-2">
                            <button
                                onClick={handleLogout}
                                className="group w-full flex items-center gap-4 px-5 py-3.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:font-semibold"
                            >
                                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                                <span className="text-sm">Cerrar sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
            )}

            {/* Main Content */}
            <div className={`${showSidebar ? 'main-content' : ''} pt-16`}>
                {/* Page Content */}
                <main className="p-6 sm:p-8 lg:p-10">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile - Blurred backdrop - Hide for registrars */}
            {showSidebar && isSidebarOpen && (
                <div
                    className="fixed top-16 bottom-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

Layout.propTypes = {
    children: PropTypes.node.isRequired
};

export default Layout;
