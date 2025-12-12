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

    // Check initial state and auto-subscribe if possible
    useEffect(() => {
        const checkAndAutoSubscribe = async () => {
            try {
                setLoading(true);
                setError(null);

                const supported = pushService.isPushSupported();
                setIsSupported(supported);

                if (!supported) {
                    setLoading(false);
                    return;
                }

                const currentPermission = pushService.getPermissionStatus();
                setPermission(currentPermission);

                // If permission is denied, nothing we can do
                if (currentPermission === 'denied') {
                    setIsSubscribed(false);
                    setLoading(false);
                    return;
                }

                // If permission is granted, check if already subscribed
                if (currentPermission === 'granted') {
                    const subscribed = await pushService.isSubscribed();
                    if (subscribed) {
                        setIsSubscribed(true);
                        setLoading(false);
                        return;
                    }
                    // Not subscribed yet, auto-subscribe
                    try {
                        await pushService.subscribe();
                        setIsSubscribed(true);
                    } catch (err) {
                        console.error('Auto-subscribe failed:', err);
                        setIsSubscribed(false);
                    }
                    setLoading(false);
                    return;
                }

                // Permission is 'default' - try to request and subscribe
                // This will prompt the user for permission
                try {
                    await pushService.subscribe();
                    setPermission('granted');
                    setIsSubscribed(true);
                } catch (err) {
                    // User denied or error occurred
                    const newPermission = pushService.getPermissionStatus();
                    setPermission(newPermission);
                    setIsSubscribed(false);
                    // Don't set error for permission denial - it's expected
                    if (newPermission !== 'denied') {
                        console.error('Auto-subscribe failed:', err);
                    }
                }
            } catch (err) {
                console.error('Error in push state check:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        checkAndAutoSubscribe();
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

            // Verify the actual state after subscription
            const currentPermission = pushService.getPermissionStatus();
            const actuallySubscribed = await pushService.isSubscribed();

            setPermission(currentPermission);
            setIsSubscribed(actuallySubscribed);

            return actuallySubscribed;
        } catch (err) {
            console.error('Error subscribing to push:', err);
            setError(err.message);
            // Update permission state to reflect actual status
            const currentPermission = pushService.getPermissionStatus();
            setPermission(currentPermission);
            setIsSubscribed(false);
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