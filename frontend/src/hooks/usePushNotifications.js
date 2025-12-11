/**
 * usePushNotifications Hook
 * Manages push notification subscription state and actions
 */

import { useState, useEffect, useCallback } from 'react';
import pushService from '../services/pushService';

export const usePushNotifications = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check initial state
    useEffect(() => {
        const checkPushState = async () => {
            try {
                setLoading(true);
                setError(null);

                const supported = pushService.isPushSupported();
                setIsSupported(supported);

                if (supported) {
                    setPermission(pushService.getPermissionStatus());
                    const subscribed = await pushService.isSubscribed();
                    setIsSubscribed(subscribed);
                }
            } catch (err) {
                console.error('Error checking push state:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        checkPushState();
    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        if (!isSupported) {
            setError('Push notifications not supported');
            return false;
        }

        try {
            setLoading(true);
            setError(null);

            await pushService.subscribe();

            setPermission('granted');
            setIsSubscribed(true);

            return true;
        } catch (err) {
            console.error('Error subscribing to push:', err);
            setError(err.message);
            setPermission(pushService.getPermissionStatus());
            return false;
        } finally {
            setLoading(false);
        }
    }, [isSupported]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            await pushService.unsubscribe();
            setIsSubscribed(false);

            return true;
        } catch (err) {
            console.error('Error unsubscribing from push:', err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    // Toggle subscription
    const toggle = useCallback(async () => {
        if (isSubscribed) {
            return unsubscribe();
        } else {
            return subscribe();
        }
    }, [isSubscribed, subscribe, unsubscribe]);

    return {
        isSupported,
        permission,
        isSubscribed,
        loading,
        error,
        subscribe,
        unsubscribe,
        toggle,
        // Computed states
        canSubscribe: isSupported && permission !== 'denied' && !isSubscribed,
        isDenied: permission === 'denied'
    };
};

export default usePushNotifications;