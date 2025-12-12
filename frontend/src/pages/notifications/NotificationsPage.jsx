/**
 * Notifications Page
 * Admin page for viewing system notifications and sending broadcasts
 * Redesigned to match the app's design system
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { checkWithdrawalRequestStatus } from '../../services/withdrawalService';
import { usePermissions } from '../../hooks/usePermissions';
import usePushNotifications from '../../hooks/usePushNotifications';

const ITEMS_PER_PAGE = 10;

const NotificationsPage = () => {
    const navigate = useNavigate();
    const permissions = usePermissions();
    const push = usePushNotifications();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        title: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [filter, setFilter] = useState('all'); // all, read, unread
    const [withdrawalStatuses, setWithdrawalStatuses] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Fetch withdrawal request statuses for withdrawal_request notifications
    useEffect(() => {
        const fetchWithdrawalStatuses = async () => {
            const withdrawalNotifications = notifications.filter(
                n => n.notification_type === 'withdrawal_request' && n.related_entity_id
            );

            for (const notification of withdrawalNotifications) {
                if (!withdrawalStatuses[notification.related_entity_id]) {
                    try {
                        const response = await checkWithdrawalRequestStatus(notification.related_entity_id);
                        setWithdrawalStatuses(prev => ({
                            ...prev,
                            [notification.related_entity_id]: response.data.data
                        }));
                    } catch (err) {
                        console.error('Error fetching withdrawal status:', err);
                    }
                }
            }
        };

        if (notifications.length > 0) {
            fetchWithdrawalStatuses();
        }
    }, [notifications]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications');
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
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
        } catch (error) {
            console.error('Error marking notification as read:', error);
            setError('Error al marcar como leída');
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();

        if (!broadcastData.title.trim() || !broadcastData.message.trim()) {
            setError('Título y mensaje son requeridos');
            return;
        }

        try {
            setSending(true);
            await api.post('/notifications/broadcast', broadcastData);
            setSuccessMessage('Notificación enviada a todos los miembros');
            setShowBroadcastModal(false);
            setBroadcastData({ title: '', message: '' });
            fetchNotifications();
        } catch (error) {
            console.error('Error sending broadcast:', error);
            setError(error.response?.data?.message || 'Error al enviar notificación');
        } finally {
            setSending(false);
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
            case 'withdrawal_request':
                return (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                    <p className="text-gray-600 mt-1">
                        {permissions.canSendNotifications
                            ? 'Gestiona las notificaciones del sistema y envía mensajes a los miembros'
                            : 'Revisa tus notificaciones del sistema'}
                    </p>
                </div>
                {permissions.canSendNotifications && (
                    <Button
                        onClick={() => setShowBroadcastModal(true)}
                        variant="primary"
                        className="whitespace-nowrap"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        Enviar Notificación
                    </Button>
                )}
            </div>

            {/* Alerts */}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            {/* Push Notifications Card - Only show if permissions are denied */}
            {push.isSupported && push.isDenied && (
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-yellow-100">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Notificaciones Push deshabilitadas</p>
                            <p className="text-sm text-gray-500">
                                Los permisos de notificación están bloqueados. Para recibir notificaciones, habilítalos en la configuración de tu navegador.
                            </p>
                        </div>
                    </div>
                </Card>
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
                        <p className="text-sm mt-1">Las notificaciones aparecerán aquí</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-200">
                            {paginatedNotifications.map((notification) => {
                                const withdrawalStatus = notification.notification_type === 'withdrawal_request'
                                    ? withdrawalStatuses[notification.related_entity_id]
                                    : null;
                                const isProcessed = withdrawalStatus?.isProcessed;

                                return (
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

                                                        {/* Show withdrawal request status */}
                                                        {notification.notification_type === 'withdrawal_request' && withdrawalStatus && (
                                                            <div className="mt-3">
                                                                {isProcessed ? (
                                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                                        withdrawalStatus.status === 'approved'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {withdrawalStatus.status === 'approved' ? (
                                                                            <>
                                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                                Aprobada
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                                </svg>
                                                                                Rechazada
                                                                            </>
                                                                        )}
                                                                        {withdrawalStatus.reviewedByName && ` por ${withdrawalStatus.reviewedByName}`}
                                                                    </span>
                                                                ) : (
                                                                    <Button
                                                                        onClick={() => navigate('/withdrawals')}
                                                                        variant="primary"
                                                                        className="text-xs py-1 px-3"
                                                                    >
                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                        Gestionar Solicitud
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
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
                                                                Marcar leída
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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

            {/* Broadcast Modal */}
            <Modal
                isOpen={showBroadcastModal}
                onClose={() => setShowBroadcastModal(false)}
                title="Enviar Notificación"
                size="lg"
            >
                <form onSubmit={handleBroadcast} className="space-y-6">
                    {/* Info Banner */}
                    <Alert
                        type="info"
                        message="Esta notificación se enviará a todos los miembros activos del sistema."
                        autoClose={false}
                        className="!mb-0"
                    />

                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={broadcastData.title}
                            onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Ej: Asamblea General"
                            required
                            disabled={sending}
                        />
                    </div>

                    {/* Message Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mensaje <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={broadcastData.message}
                            onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Escribe tu mensaje aquí..."
                            required
                            disabled={sending}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={() => setShowBroadcastModal(false)}
                            variant="outline"
                            disabled={sending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={sending}
                        >
                            {sending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Enviando...
                                </>
                            ) : (
                                'Enviar'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default NotificationsPage;