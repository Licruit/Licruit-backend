"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const errorMiddleware = (error, req, res, next) => {
    const status = error.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    res.json({
        status: status,
        message: error.message
    });
};
exports.default = errorMiddleware;
