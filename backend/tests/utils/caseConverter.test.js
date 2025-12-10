/**
 * Unit Tests for Case Converter Utility
 */

const {
    snakeToCamel,
    camelToSnake,
    keysToCamel,
    keysToSnake
} = require('../../src/utils/caseConverter');

describe('Case Converter', () => {
    describe('snakeToCamel', () => {
        test('should convert snake_case to camelCase', () => {
            expect(snakeToCamel('user_name')).toBe('userName');
            expect(snakeToCamel('first_name')).toBe('firstName');
            expect(snakeToCamel('member_id')).toBe('memberId');
        });

        test('should handle single word', () => {
            expect(snakeToCamel('user')).toBe('user');
        });

        test('should handle multiple underscores', () => {
            expect(snakeToCamel('user_full_name_field')).toBe('userFullNameField');
        });

        test('should handle empty string', () => {
            expect(snakeToCamel('')).toBe('');
        });
    });

    describe('camelToSnake', () => {
        test('should convert camelCase to snake_case', () => {
            expect(camelToSnake('userName')).toBe('user_name');
            expect(camelToSnake('firstName')).toBe('first_name');
            expect(camelToSnake('memberId')).toBe('member_id');
        });

        test('should handle single word', () => {
            expect(camelToSnake('user')).toBe('user');
        });

        test('should handle multiple capitals', () => {
            expect(camelToSnake('userFullNameField')).toBe('user_full_name_field');
        });

        test('should handle empty string', () => {
            expect(camelToSnake('')).toBe('');
        });
    });

    describe('keysToCamel', () => {
        test('should convert object keys from snake_case to camelCase', () => {
            const input = {
                user_name: 'John',
                first_name: 'John',
                last_name: 'Doe'
            };
            const expected = {
                userName: 'John',
                firstName: 'John',
                lastName: 'Doe'
            };
            expect(keysToCamel(input)).toEqual(expected);
        });

        test('should handle nested objects', () => {
            const input = {
                user_data: {
                    first_name: 'John',
                    contact_info: {
                        phone_number: '12345'
                    }
                }
            };
            const expected = {
                userData: {
                    firstName: 'John',
                    contactInfo: {
                        phoneNumber: '12345'
                    }
                }
            };
            expect(keysToCamel(input)).toEqual(expected);
        });

        test('should handle arrays of objects', () => {
            const input = [
                { user_name: 'John', member_id: 1 },
                { user_name: 'Jane', member_id: 2 }
            ];
            const expected = [
                { userName: 'John', memberId: 1 },
                { userName: 'Jane', memberId: 2 }
            ];
            expect(keysToCamel(input)).toEqual(expected);
        });

        test('should preserve Date objects', () => {
            const date = new Date('2025-12-05');
            const input = {
                created_at: date
            };
            const result = keysToCamel(input);
            expect(result.createdAt).toBe(date);
            expect(result.createdAt instanceof Date).toBe(true);
        });

        test('should handle null values', () => {
            expect(keysToCamel(null)).toBe(null);
        });

        test('should handle primitive values', () => {
            expect(keysToCamel('string')).toBe('string');
            expect(keysToCamel(123)).toBe(123);
            expect(keysToCamel(true)).toBe(true);
        });
    });

    describe('keysToSnake', () => {
        test('should convert object keys from camelCase to snake_case', () => {
            const input = {
                userName: 'John',
                firstName: 'John',
                lastName: 'Doe'
            };
            const expected = {
                user_name: 'John',
                first_name: 'John',
                last_name: 'Doe'
            };
            expect(keysToSnake(input)).toEqual(expected);
        });

        test('should handle nested objects', () => {
            const input = {
                userData: {
                    firstName: 'John',
                    contactInfo: {
                        phoneNumber: '12345'
                    }
                }
            };
            const expected = {
                user_data: {
                    first_name: 'John',
                    contact_info: {
                        phone_number: '12345'
                    }
                }
            };
            expect(keysToSnake(input)).toEqual(expected);
        });

        test('should handle arrays of objects', () => {
            const input = [
                { userName: 'John', memberId: 1 },
                { userName: 'Jane', memberId: 2 }
            ];
            const expected = [
                { user_name: 'John', member_id: 1 },
                { user_name: 'Jane', member_id: 2 }
            ];
            expect(keysToSnake(input)).toEqual(expected);
        });

        test('should preserve Date objects', () => {
            const date = new Date('2025-12-05');
            const input = {
                createdAt: date
            };
            const result = keysToSnake(input);
            expect(result.created_at).toBe(date);
            expect(result.created_at instanceof Date).toBe(true);
        });
    });

    describe('Bidirectional conversion', () => {
        test('should maintain data integrity when converting back and forth', () => {
            const original = {
                userName: 'John',
                firstName: 'John',
                contactInfo: {
                    phoneNumber: '12345',
                    emailAddress: 'john@example.com'
                }
            };

            const toSnake = keysToSnake(original);
            const backToCamel = keysToCamel(toSnake);

            expect(backToCamel).toEqual(original);
        });
    });
});