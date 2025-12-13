/**
 * @file MemberNotificationsPage.jsx
 * @description Page for members to view their personal notifications
 * @module pages/members
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import usePushNotifications from '../../hooks/usePushNotifications';

const ITEMS_PER_PAGE = 10;

const MemberNotificationsPage = () => {
    const push = usePushNotifications();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [filter, setFilter] = useState('all'); // all, read, unread
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data || []);
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
            setSuccessMessage('Notificación marcada como leída');
            fetchNotifications();
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Error al marcar como leída');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            setSuccessMessage('Todas las notificaciones marcadas como leídas');
            fetchNotifications();
        } catch (err) {
            console.error('Error marking all as read:', err);
            setError('Error al marcar todas como leídas');
        }
    };

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'read') return notification.isRead;
        if (filter === 'unread') return !notification.isRead;
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Stats
    const totalNotifications = notifications.length;
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const readCount = notifications.filter(n => n.isRead).length;

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
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString('es-ES');
    };

    if (loading && notifications.length === 0) {
        return <Loading message="Cargando notificaciones..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notificaciones</h1>
                    <p className="text-gray-600 mt-1">Revisa tus notificaciones del sistema</p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={handleMarkAllAsRead}
                        variant="outline"
                        className="whitespace-nowrap"
                    >
                        Marcar todas como leídas
                    </Button>
                )}
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Push Notifications Warning */}
            {push.isSupported && push.isDenied && (
                <Alert
                    type="warning"
                    title="Notificaciones Push deshabilitadas"
                    message="Los permisos de notificación están bloqueados. Para recibir notificaciones, habilítalos en la configuración de tu navegador."
                    autoClose={false}
                />
            )}

            {/* Filters Card */}
            <Card title="Filtros">
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
                        No leídas ({unreadCount})
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === 'read'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Leídas ({readCount})
                    </button>
                </div>
            </Card>

            {/* Notifications List */}
            <Card title={`Notificaciones (${filteredNotifications.length})`}>
                {paginatedNotifications.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-gray-500">
                            {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No hay notificaciones'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {paginatedNotifications.map((notification) => (
                            <div
                                key={notification.notificationId}
                                className={`p-4 transition-colors ${
                                    !notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {getNotificationIcon(notification.notificationType)}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <h3 className={`text-sm font-semibold ${
                                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                            }`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.isRead && (
                                                <span className="flex-shrink-0 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-2 break-words">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>{formatDate(notification.createdAt)}</span>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.notificationId)}
                                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    Marcar como leída
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MemberNotificationsPage;