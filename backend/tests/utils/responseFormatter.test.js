/**
 * Unit Tests for Response Formatter
 */

const {
    successResponse,
    errorResponse,
    paginatedResponse
} = require('../../src/utils/responseFormatter');

// Mock Express response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Response Formatter', () => {
    describe('successResponse', () => {
        test('should return success response with default status 200', () => {
            const res = mockResponse();
            const message = 'Operation successful';
            const data = { id: 1, name: 'Test' };

            successResponse(res, message, data);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message,
                data
            });
        });

        test('should return success response with custom status code', () => {
            const res = mockResponse();
            const message = 'Resource created';
            const data = { id: 1 };

            successResponse(res, message, data, 201);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('should include pagination if provided', () => {
            const res = mockResponse();
            const message = 'List retrieved';
            const data = [{ id: 1 }, { id: 2 }];
            const pagination = { page: 1, limit: 10, total: 2 };

            successResponse(res, message, data, 200, pagination);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message,
                data,
                pagination
            });
        });

        test('should handle null data', () => {
            const res = mockResponse();
            const message = 'No content';

            successResponse(res, message, null);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message,
                data: null
            });
        });
    });

    describe('errorResponse', () => {
        test('should return error response with default status 500', () => {
            const res = mockResponse();
            const message = 'Internal server error';

            errorResponse(res, message);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                error: 'INTERNAL_ERROR'
            });
        });

        test('should return error response with custom error code and status', () => {
            const res = mockResponse();
            const message = 'Resource not found';
            const errorCode = 'NOT_FOUND';

            errorResponse(res, message, errorCode, 404);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                error: errorCode
            });
        });

        test('should include details if provided', () => {
            const res = mockResponse();
            const message = 'Validation failed';
            const errorCode = 'VALIDATION_ERROR';
            const details = [
                { field: 'email', message: 'Invalid email format' }
            ];

            errorResponse(res, message, errorCode, 400, details);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message,
                error: errorCode,
                details
            });
        });
    });

    describe('paginatedResponse', () => {
        test('should return paginated response with correct structure', () => {
            const res = mockResponse();
            const message = 'Members retrieved';
            const data = [
                { id: 1, name: 'Member 1' },
                { id: 2, name: 'Member 2' }
            ];
            const pagination = {
                page: 1,
                limit: 10,
                total: 25
            };

            paginatedResponse(res, message, data, pagination);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message,
                data,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 25,
                    totalPages: 3 // Math.ceil(25 / 10)
                }
            });
        });

        test('should calculate totalPages correctly', () => {
            const res = mockResponse();
            const message = 'Data retrieved';
            const data = [];
            const pagination = {
                page: 1,
                limit: 20,
                total: 100
            };

            paginatedResponse(res, message, data, pagination);

            const jsonCall = res.json.mock.calls[0][0];
            expect(jsonCall.pagination.totalPages).toBe(5); // 100 / 20
        });

        test('should handle partial pages correctly', () => {
            const res = mockResponse();
            const message = 'Data retrieved';
            const data = [];
            const pagination = {
                page: 1,
                limit: 10,
                total: 23
            };

            paginatedResponse(res, message, data, pagination);

            const jsonCall = res.json.mock.calls[0][0];
            expect(jsonCall.pagination.totalPages).toBe(3); // Math.ceil(23 / 10)
        });
    });
});