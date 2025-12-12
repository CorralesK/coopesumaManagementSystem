/**
 * @file useQrScanner.js
 * @description Custom hook for QR code scanning using html5-qrcode library
 * @module hooks/useQrScanner
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for QR code scanning functionality
 * Requires html5-qrcode library to be installed
 *
 * @param {Object} options - Scanner configuration options
 * @param {string} options.elementId - ID of the element to render scanner (default: 'qr-reader')
 * @param {number} options.fps - Frames per second for scanning (default: 10)
 * @param {number} options.qrbox - Size of the scanning box (default: 250)
 * @param {Function} options.onScanSuccess - Callback when QR is scanned successfully
 * @param {Function} options.onScanError - Callback when scanning fails
 * @returns {Object} Scanner state and control functions
 */
export const useQrScanner = (options = {}) => {
    const {
        elementId = 'qr-reader',
        fps = 10,
        qrbox = 250,
        onScanSuccess,
        onScanError
    } = options;

    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [scannedData, setScannedData] = useState(null);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);

    const scannerRef = useRef(null);
    const initAttempts = useRef(0);
    const maxInitAttempts = 3;

    /**
     * Initialize the scanner
     */
    const initScanner = useCallback(async () => {
        try {
            // Check if the DOM element exists
            const element = document.getElementById(elementId);
            if (!element) {
                // Element not ready yet, retry after a short delay
                if (initAttempts.current < maxInitAttempts) {
                    initAttempts.current += 1;
                    setTimeout(() => initScanner(), 100);
                    return;
                }
                // Max attempts reached, fail silently - user can click "Iniciar Escaneo" manually
                console.warn('QR scanner element not found after max attempts, waiting for user action');
                return;
            }

            // Reset attempts on success
            initAttempts.current = 0;

            // Check if browser supports camera access
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Tu navegador no soporta acceso a la cámara');
            }

            // Check if page is in secure context (HTTPS or localhost)
            if (!window.isSecureContext) {
                throw new Error('Se requiere HTTPS o localhost para acceder a la cámara');
            }

            // Dynamically import html5-qrcode
            const { Html5Qrcode } = await import('html5-qrcode');

            // Get available cameras
            const devices = await Html5Qrcode.getCameras();

            if (!devices || devices.length === 0) {
                throw new Error('No se encontraron cámaras disponibles');
            }

            setCameras(devices);

            // Select rear camera by default if available
            const rearCamera = devices.find(device =>
                device.label.toLowerCase().includes('back') ||
                device.label.toLowerCase().includes('rear') ||
                device.label.toLowerCase().includes('trasera')
            );
            setSelectedCamera(rearCamera || devices[0]);

            // Create scanner instance
            scannerRef.current = new Html5Qrcode(elementId);
        } catch (err) {
            console.error('Error initializing QR scanner:', err);
            // Provide user-friendly error messages
            let userMessage = 'Error al inicializar el escáner. ';
            if (err.message?.includes('cámara')) {
                userMessage += err.message;
            } else if (err.message?.includes('HTTPS')) {
                userMessage += err.message;
            } else if (err.message?.includes('NotAllowedError') || err.message?.includes('Permission')) {
                userMessage += 'Por favor, permite el acceso a la cámara.';
            } else if (err.message?.includes('NotFoundError')) {
                userMessage += 'No se encontró una cámara disponible.';
            } else {
                userMessage += 'Por favor, recarga la página e intenta de nuevo.';
            }
            setError(userMessage);
        }
    }, [elementId]);

    /**
     * Start scanning
     */
    const startScanning = useCallback(async () => {
        if (isScanning) return;

        try {
            setError(null);

            // If scanner is not initialized, try to initialize it first
            if (!scannerRef.current) {
                const element = document.getElementById(elementId);
                if (!element) {
                    setError('El escáner no está listo. Por favor, espera un momento e intenta de nuevo.');
                    return;
                }

                // Try to initialize
                const { Html5Qrcode } = await import('html5-qrcode');

                // Get cameras if not already fetched
                if (cameras.length === 0) {
                    const devices = await Html5Qrcode.getCameras();
                    if (!devices || devices.length === 0) {
                        setError('No se encontraron cámaras disponibles.');
                        return;
                    }
                    setCameras(devices);
                    const rearCamera = devices.find(device =>
                        device.label.toLowerCase().includes('back') ||
                        device.label.toLowerCase().includes('rear') ||
                        device.label.toLowerCase().includes('trasera')
                    );
                    setSelectedCamera(rearCamera || devices[0]);
                }

                scannerRef.current = new Html5Qrcode(elementId);
            }

            setIsScanning(true);

            // Request camera permissions explicitly
            try {
                await navigator.mediaDevices.getUserMedia({ video: true });
            } catch (permErr) {
                throw new Error('Permisos de cámara denegados. Por favor, permite el acceso a la cámara.');
            }

            const cameraId = selectedCamera?.id || { facingMode: 'environment' };

            await scannerRef.current.start(
                cameraId,
                {
                    fps: 30, // Increased from 10 to 30 for faster scanning
                    qrbox: { width: 250, height: 250 }, // Better detection area
                    aspectRatio: 1.0,
                    disableFlip: false, // Allow horizontal flip for better detection
                    videoConstraints: {
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                },
                (decodedText, decodedResult) => {
                    setScannedData(decodedText);
                    if (onScanSuccess) {
                        onScanSuccess(decodedText, decodedResult);
                    }
                },
                (errorMessage) => {
                    // Only log actual errors, not "no QR found" messages
                    if (!errorMessage.includes('No MultiFormat Readers')) {
                        if (onScanError) {
                            onScanError(errorMessage);
                        }
                    }
                }
            );
        } catch (err) {
            console.error('Error starting QR scanner:', err);
            // Provide user-friendly error messages
            let userMessage = 'Error al iniciar el escaneo. ';
            if (err.message?.includes('Permisos') || err.message?.includes('Permission')) {
                userMessage = err.message;
            } else if (err.message?.includes('NotAllowedError')) {
                userMessage += 'Por favor, permite el acceso a la cámara.';
            } else if (err.message?.includes('NotFoundError') || err.message?.includes('not found')) {
                userMessage += 'No se encontró una cámara disponible.';
            } else if (err.message?.includes('NotReadableError')) {
                userMessage += 'La cámara está siendo usada por otra aplicación.';
            } else {
                userMessage += 'Por favor, recarga la página e intenta de nuevo.';
            }
            setError(userMessage);
            setIsScanning(false);
        }
    }, [selectedCamera, cameras, elementId, fps, qrbox, onScanSuccess, onScanError, isScanning]);

    /**
     * Stop scanning
     */
    const stopScanning = useCallback(async () => {
        if (!scannerRef.current || !isScanning) return;

        try {
            await scannerRef.current.stop();
            setIsScanning(false);
        } catch (err) {
            console.error('Error stopping scanner:', err);
            // Don't show error to user for stop failures, just update state
            setIsScanning(false);
        }
    }, [isScanning]);

    /**
     * Switch camera
     * @param {string} cameraId - Camera ID to switch to
     */
    const switchCamera = useCallback(async (cameraId) => {
        const camera = cameras.find(c => c.id === cameraId);
        if (!camera) return;

        const wasScanning = isScanning;

        // Stop current scanning
        if (wasScanning) {
            await stopScanning();
        }

        // Switch camera
        setSelectedCamera(camera);

        // Resume scanning if it was active
        if (wasScanning) {
            await startScanning();
        }
    }, [cameras, isScanning, stopScanning, startScanning]);

    /**
     * Clear scanned data
     */
    const clearScannedData = useCallback(() => {
        setScannedData(null);
    }, []);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        initScanner();

        return () => {
            if (scannerRef.current && isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    return {
        isScanning,
        error,
        scannedData,
        cameras,
        selectedCamera,
        startScanning,
        stopScanning,
        switchCamera,
        clearScannedData
    };
};

/**
 * Simplified hook for one-time QR scanning
 * Automatically starts scanning on mount and stops after successful scan
 *
 * @param {Function} onScan - Callback when QR is scanned
 * @returns {Object} Scanner state
 */
export const useQrScanOnce = (onScan) => {
    const [hasScanned, setHasScanned] = useState(false);

    const handleScanSuccess = useCallback((decodedText, decodedResult) => {
        if (!hasScanned) {
            setHasScanned(true);
            onScan(decodedText, decodedResult);
        }
    }, [hasScanned, onScan]);

    const scanner = useQrScanner({
        onScanSuccess: handleScanSuccess
    });

    // Auto-start scanning on mount
    useEffect(() => {
        if (!scanner.isScanning && !hasScanned) {
            scanner.startScanning();
        }
    }, [scanner, hasScanned]);

    // Auto-stop after scan
    useEffect(() => {
        if (hasScanned && scanner.isScanning) {
            scanner.stopScanning();
        }
    }, [hasScanned, scanner]);

    return {
        ...scanner,
        hasScanned
    };
};

export default useQrScanner;
