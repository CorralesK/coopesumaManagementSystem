/**
 * Push Notifications Service
 * Handles Web Push subscription and permission management
 */

import api from './api';

// API base URL for push endpoints
const PUSH_API = '/push';

/**
 * Check if push notifications are supported
 */
export const isPushSupported = () => {
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const hasNotification = 'Notification' in window;
    const supported = hasServiceWorker && hasPushManager && hasNotification;

    console.log('[PushService] Support check:', {
        serviceWorker: hasServiceWorker,
        pushManager: hasPushManager,
        notification: hasNotification,
        supported
    });

    return supported;
};

/**
 * Check current notification permission status
 * @returns {'granted' | 'denied' | 'default'}
 */
export const getPermissionStatus = () => {
    if (!isPushSupported()) return 'denied';
    const permission = Notification.permission;
    console.log('[PushService] Permission status:', permission);
    return permission;
};

/**
 * Request notification permission from user
 * @returns {Promise<'granted' | 'denied' | 'default'>}
 */
export const requestPermission = async () => {
    console.log('[PushService] Requesting permission...');

    if (!isPushSupported()) {
        throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('[PushService] Permission result:', permission);
    return permission;
};

/**
 * Get VAPID public key from server
 * @returns {Promise<string>}
 */
export const getVapidPublicKey = async () => {
    console.log('[PushService] Fetching VAPID public key...');
    const response = await api.get(`${PUSH_API}/vapid-public-key`);
    const publicKey = response.data.data.publicKey;
    console.log('[PushService] VAPID key received:', publicKey?.substring(0, 20) + '...');
    return publicKey;
};

/**
 * Convert VAPID key from base64 to Uint8Array
 */
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
};

/**
 * Subscribe to push notifications
 * @returns {Promise<PushSubscription>}
 */
export const subscribe = async () => {
    console.log('[PushService] Starting subscription process...');

    if (!isPushSupported()) {
        throw new Error('Push notifications not supported');
    }

    // Request permission first
    const permission = await requestPermission();
    if (permission !== 'granted') {
        throw new Error('Notification permission denied');
    }

    // Get service worker registration
    console.log('[PushService] Waiting for service worker...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[PushService] Service worker ready:', registration.scope);

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
        console.log('[PushService] Already subscribed, reusing existing subscription');
    } else {
        // Get VAPID public key
        const vapidPublicKey = await getVapidPublicKey();
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        console.log('[PushService] Subscribing to push manager...');
        // Subscribe to push
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });
        console.log('[PushService] Push subscription created:', subscription.endpoint?.substring(0, 50) + '...');
    }

    // Send subscription to server
    console.log('[PushService] Sending subscription to server...');
    await api.post(`${PUSH_API}/subscribe`, { subscription: subscription.toJSON() });

    console.log('[PushService] Subscription successful!');
    return subscription;
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribe = async () => {
    console.log('[PushService] Starting unsubscription process...');

    if (!isPushSupported()) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        // Notify server
        console.log('[PushService] Notifying server of unsubscription...');
        try {
            await api.post(`${PUSH_API}/unsubscribe`, {
                endpoint: subscription.endpoint
            });
        } catch (error) {
            console.warn('[PushService] Server unsubscribe failed, continuing local unsubscribe:', error);
        }

        // Unsubscribe locally
        await subscription.unsubscribe();
        console.log('[PushService] Unsubscription successful');
    } else {
        console.log('[PushService] No subscription to unsubscribe');
    }
};

/**
 * Check if user is currently subscribed
 * @returns {Promise<boolean>}
 */
export const isSubscribed = async () => {
    if (!isPushSupported()) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        const subscribed = !!subscription;
        console.log('[PushService] Is subscribed:', subscribed);
        return subscribed;
    } catch (error) {
        console.error('[PushService] Error checking subscription:', error);
        return false;
    }
};

/**
 * Get current subscription
 * @returns {Promise<PushSubscription | null>}
 */
export const getSubscription = async () => {
    if (!isPushSupported()) return null;

    try {
        const registration = await navigator.serviceWorker.ready;
        return await registration.pushManager.getSubscription();
    } catch (error) {
        console.error('[PushService] Error getting subscription:', error);
        return null;
    }
};

/**
 * Test notification locally (for debugging)
 */
export const testLocalNotification = async () => {
    console.log('[PushService] Testing local notification...');

    if (!isPushSupported()) {
        throw new Error('Notifications not supported');
    }

    const permission = getPermissionStatus();
    if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('Test Notification', {
        body: 'This is a test notification from COOPLINKCR',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'test-notification'
    });

    console.log('[PushService] Test notification sent');
};

export default {
    isPushSupported,
    getPermissionStatus,
    requestPermission,
    subscribe,
    unsubscribe,
    isSubscribed,
    getSubscription,
    testLocalNotification
};
