/**
 * Service Worker - Push Notifications Handler
 * This file is imported by the main service worker via importScripts
 */

console.log('[SW-Push] Push notification handler loaded');

// Handle push notification events
self.addEventListener('push', (event) => {
    console.log('[SW-Push] Push event received:', event);

    let data = {
        title: 'COOPLINKCR',
        body: 'Tienes una nueva notificacion',
        icon: '/logotipo.png',
        badge: '/logotipo.png',
        url: '/notifications'
    };

    try {
        if (event.data) {
            const payload = event.data.json();
            console.log('[SW-Push] Push payload:', payload);
            data = { ...data, ...payload };
        }
    } catch (e) {
        console.error('[SW-Push] Error parsing push data:', e);
        // Try to get text if JSON fails
        try {
            if (event.data) {
                data.body = event.data.text();
            }
        } catch (textError) {
            console.error('[SW-Push] Error getting text data:', textError);
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/logotipo.png',
        badge: data.badge || '/logotipo.png',
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
        tag: data.data?.notificationId ? `notification-${data.data.notificationId}` : `notification-${Date.now()}`
    };

    console.log('[SW-Push] Showing notification with options:', options);

    event.waitUntil(
        self.registration.showNotification(data.title, options)
            .then(() => console.log('[SW-Push] Notification shown successfully'))
            .catch((err) => console.error('[SW-Push] Error showing notification:', err))
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW-Push] Notification click received:', event.action, event.notification);

    event.notification.close();

    if (event.action === 'close') {
        console.log('[SW-Push] User clicked close');
        return;
    }

    const urlToOpen = event.notification.data?.url || '/notifications';
    const fullUrl = new URL(urlToOpen, self.location.origin).href;

    console.log('[SW-Push] Opening URL:', fullUrl);

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            console.log('[SW-Push] Found clients:', clientList.length);

            // Check if there's already a window open with our app
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    console.log('[SW-Push] Focusing existing window');
                    return client.focus().then((focusedClient) => {
                        if ('navigate' in focusedClient) {
                            return focusedClient.navigate(urlToOpen);
                        }
                    });
                }
            }

            // If no window is open, open a new one
            if (clients.openWindow) {
                console.log('[SW-Push] Opening new window');
                return clients.openWindow(fullUrl);
            }
        }).catch((err) => {
            console.error('[SW-Push] Error handling notification click:', err);
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('[SW-Push] Notification closed:', event.notification.tag);
});

// Handle push subscription change (browser may rotate keys)
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('[SW-Push] Push subscription changed, need to re-subscribe');

    event.waitUntil(
        self.registration.pushManager.subscribe({
            userVisibleOnly: true
        }).then((subscription) => {
            console.log('[SW-Push] Re-subscribed successfully');
        }).catch((err) => {
            console.error('[SW-Push] Failed to re-subscribe:', err);
        })
    );
});

console.log('[SW-Push] All event listeners registered');
