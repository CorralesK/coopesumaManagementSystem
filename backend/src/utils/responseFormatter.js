/**
 * Standardized API Response Formatter
 */

const successResponse = (res, message, data = null, statusCode = 200, pagination = null) => {
    const response = {
        success: true,
        message,
        data
    };

    if (pagination) {
        response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
};

const errorResponse = (res, message, errorCode = 'INTERNAL_ERROR', statusCode = 500, details = null) => {
    const response = {
        success: false,
        message,
        error: errorCode
    };

    if (details) {
        response.details = details;
    }

    return res.status(statusCode).json(response);
};

const paginatedResponse = (res, message, data, pagination) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit)
        }
    });
};

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse
};