/**
 * Unit Tests for Date Utilities
 */

const {
    formatDate,
    formatTime,
    formatDateTime,
    isPastDate,
    isFutureDate,
    isToday,
    addDays,
    getDateRange
} = require('../../src/utils/dateUtils');

describe('Date Utils', () => {
    describe('formatDate', () => {
        test('should format date to YYYY-MM-DD', () => {
            const date = new Date('2025-12-05T10:30:00');
            expect(formatDate(date)).toBe('2025-12-05');
        });

        test('should handle single digit months and days', () => {
            const date = new Date('2025-01-05T10:30:00');
            expect(formatDate(date)).toBe('2025-01-05');
        });
    });

    describe('formatTime', () => {
        test('should format time to HH:MM:SS', () => {
            const date = new Date('2025-12-05T14:30:45');
            expect(formatTime(date)).toBe('14:30:45');
        });

        test('should pad single digit values', () => {
            const date = new Date('2025-12-05T09:05:03');
            expect(formatTime(date)).toBe('09:05:03');
        });
    });

    describe('formatDateTime', () => {
        test('should format datetime correctly', () => {
            const date = new Date('2025-12-05T14:30:45');
            expect(formatDateTime(date)).toBe('2025-12-05 14:30:45');
        });
    });

    describe('isPastDate', () => {
        test('should return true for past dates', () => {
            const pastDate = new Date('2020-01-01');
            expect(isPastDate(pastDate)).toBe(true);
        });

        test('should return false for future dates', () => {
            const futureDate = new Date('2030-01-01');
            expect(isPastDate(futureDate)).toBe(false);
        });
    });

    describe('isFutureDate', () => {
        test('should return true for future dates', () => {
            const futureDate = new Date('2030-01-01');
            expect(isFutureDate(futureDate)).toBe(true);
        });

        test('should return false for past dates', () => {
            const pastDate = new Date('2020-01-01');
            expect(isFutureDate(pastDate)).toBe(false);
        });
    });

    describe('isToday', () => {
        test('should return true for today\'s date', () => {
            const today = new Date();
            expect(isToday(today)).toBe(true);
        });

        test('should return false for yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(isToday(yesterday)).toBe(false);
        });
    });

    describe('addDays', () => {
        test('should add days correctly', () => {
            const date = new Date('2025-12-05T12:00:00');
            const newDate = addDays(date, 5);
            expect(formatDate(newDate)).toBe('2025-12-10');
        });

        test('should handle negative days', () => {
            const date = new Date('2025-12-05T12:00:00');
            const newDate = addDays(date, -5);
            expect(formatDate(newDate)).toBe('2025-11-30');
        });
    });

    describe('getDateRange', () => {
        test('should return correct range for today', () => {
            const range = getDateRange('today');
            expect(range).toHaveProperty('startDate');
            expect(range).toHaveProperty('endDate');
            expect(isToday(range.startDate)).toBe(true);
        });

        test('should return correct range for week', () => {
            const range = getDateRange('week');
            expect(range).toHaveProperty('startDate');
            expect(range).toHaveProperty('endDate');
        });

        test('should return correct range for month', () => {
            const range = getDateRange('month');
            expect(range).toHaveProperty('startDate');
            expect(range).toHaveProperty('endDate');
        });

        test('should return correct range for year', () => {
            const range = getDateRange('year');
            const year = new Date().getFullYear();
            expect(formatDate(range.startDate)).toBe(`${year}-01-01`);
        });
    });
});