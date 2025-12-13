/**
 * @file MemberNotificationsPage.jsx
 * @description Page for members to view their notifications (read-only, no broadcast)
 * @module pages/members
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';

const ITEMS_PER_PAGE = 10;

/**
 * MemberNotificationsPage Component
 * Displays notifications for logged-in members (read-only)
 */
const MemberNotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, read, unread
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data.data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Error al marcar como leida');
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'read') return notification.is_read;
        if (filter === 'unread') return !notification.is_read;
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
    const paginatedNotifications = filteredNotifications.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    // Stats calculations
    const totalNotifications = notifications.length;
    const unreadCount = notifications.filter(n => !n.is_read).length;
    const readCount = notifications.filter(n => n.is_read).length;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'withdrawal_approved':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'withdrawal_rejected':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            case 'liquidation_due':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'admin_message':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                );
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        if (diffDays < 7) return `Hace ${diffDays} dias`;
        return date.toLocaleDateString('es-CR');
    };

    if (loading && notifications.length === 0) {
        return <Loading message="Cargando notificaciones..." />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/my-dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notificaciones</h1>
                    <p className="text-gray-600 mt-1">Revisa tus notificaciones del sistema</p>
                </div>
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {/* Unread Count Banner */}
            {unreadCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-600">{unreadCount}</span>
                        </div>
                        <p className="text-sm text-blue-800">
                            Tienes <span className="font-semibold">{unreadCount}</span> {unreadCount === 1 ? 'notificacion nueva' : 'notificaciones nuevas'}
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <Card>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Todas ({totalNotifications})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'unread'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        No leidas ({unreadCount})
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'read'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Leidas ({readCount})
                    </button>
                </div>
            </Card>

            {/* Notifications List */}
            <Card padding="none">
                {loading ? (
                    <div className="py-8">
                        <Loading message="Cargando..." />
                    </div>
                ) : paginatedNotifications.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900">No hay notificaciones</p>
                        <p className="text-sm mt-1">Las notificaciones apareceran aqui</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-200">
                            {paginatedNotifications.map((notification) => (
                                <div
                                    key={notification.notification_id}
                                    className={`p-4 hover:bg-gray-50 transition-colors ${
                                        !notification.is_read ? 'bg-blue-50/50' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {getNotificationIcon(notification.notification_type)}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                Nueva
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                                        {formatDate(notification.created_at)}
                                                    </span>
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.notification_id)}
                                                            className="text-primary-600 hover:text-primary-700 text-xs font-medium whitespace-nowrap hover:underline"
                                                        >
                                                            Marcar leida
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="px-4 py-3 border-t border-gray-200">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default MemberNotificationsPage;