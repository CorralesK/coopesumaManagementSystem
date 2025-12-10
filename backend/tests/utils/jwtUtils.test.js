/**
 * Unit Tests for JWT Utilities
 */

const { generateToken, verifyToken, decodeToken } = require('../../src/utils/jwtUtils');

describe('JWT Utils', () => {
    const testPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'administrator'
    };

    describe('generateToken', () => {
        test('should generate a valid JWT token', () => {
            const token = generateToken(testPayload);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });

        test('should generate different tokens for different payloads', () => {
            const token1 = generateToken({ userId: 1 });
            const token2 = generateToken({ userId: 2 });
            expect(token1).not.toBe(token2);
        });
    });

    describe('verifyToken', () => {
        test('should verify and decode a valid token', () => {
            const token = generateToken(testPayload);
            const decoded = verifyToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(testPayload.userId);
            expect(decoded.email).toBe(testPayload.email);
            expect(decoded.role).toBe(testPayload.role);
        });

        test('should throw error for invalid token', () => {
            const invalidToken = 'invalid.token.here';
            expect(() => verifyToken(invalidToken)).toThrow();
        });

        test('should throw error for empty token', () => {
            expect(() => verifyToken('')).toThrow();
        });
    });

    describe('decodeToken', () => {
        test('should decode token without verification', () => {
            const token = generateToken(testPayload);
            const decoded = decodeToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(testPayload.userId);
            expect(decoded.email).toBe(testPayload.email);
        });

        test('should return null for invalid token format', () => {
            const invalidToken = 'not-a-jwt-token';
            const decoded = decodeToken(invalidToken);
            expect(decoded).toBeNull();
        });
    });

    describe('Token expiration', () => {
        test('generated token should have expiration time', () => {
            const token = generateToken(testPayload);
            const decoded = decodeToken(token);

            expect(decoded).toHaveProperty('exp');
            expect(decoded).toHaveProperty('iat');
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });
    });
});