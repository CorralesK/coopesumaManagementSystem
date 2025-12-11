/**
 * Service Worker - Push Notifications Handler
 * This file is imported by the main service worker
 */

// Handle push notification events
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received', event);

    let data = {
        title: 'COOPESUMA',
        body: 'Tienes una nueva notificación',
        icon: '/logo.png',
        badge: '/logo.png',
        url: '/notifications'
    };

    try {
        if (event.data) {
            data = { ...data, ...event.data.json() };
        }
    } catch (e) {
        console.error('[SW] Error parsing push data:', e);
    }

    const options = {
        body: data.body,
        icon: data.icon || '/logo.png',
        badge: data.badge || '/logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/notifications',
            dateOfArrival: Date.now(),
            ...data.data
        },
        actions: [
            {
                action: 'open',
                title: 'Ver'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ],
        requireInteraction: true,
        tag: data.data?.notificationId || 'notification-' + Date.now()
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click received', event);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/notifications';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(urlToOpen);
                    return;
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed', event);
});