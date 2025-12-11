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
    return 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Check current notification permission status
 * @returns {'granted' | 'denied' | 'default'}
 */
export const getPermissionStatus = () => {
    if (!isPushSupported()) return 'denied';
    return Notification.permission;
};

/**
 * Request notification permission from user
 * @returns {Promise<'granted' | 'denied' | 'default'>}
 */
export const requestPermission = async () => {
    if (!isPushSupported()) {
        throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
};

/**
 * Get VAPID public key from server
 * @returns {Promise<string>}
 */
export const getVapidPublicKey = async () => {
    const response = await api.get(`${PUSH_API}/vapid-public-key`);
    return response.data.data.publicKey;
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
    if (!isPushSupported()) {
        throw new Error('Push notifications not supported');
    }

    // Request permission first
    const permission = await requestPermission();
    if (permission !== 'granted') {
        throw new Error('Notification permission denied');
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key
    const vapidPublicKey = await getVapidPublicKey();
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
    });

    // Send subscription to server
    await api.post(`${PUSH_API}/subscribe`, { subscription });

    console.log('Push subscription successful');
    return subscription;
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribe = async () => {
    if (!isPushSupported()) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        // Notify server
        await api.post(`${PUSH_API}/unsubscribe`, {
            endpoint: subscription.endpoint
        });

        // Unsubscribe locally
        await subscription.unsubscribe();
        console.log('Push unsubscription successful');
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
        return !!subscription;
    } catch {
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
    } catch {
        return null;
    }
};

export default {
    isPushSupported,
    getPermissionStatus,
    requestPermission,
    subscribe,
    unsubscribe,
    isSubscribed,
    getSubscription
};