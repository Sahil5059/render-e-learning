"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//STEP: 7
//watch: 1:29:00 to 1:34:20
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ErrorHandler;
//now, we will create a middleware for handling error
//OVER: 7 ("c": ../middleware & ../middleware/error.ts and "m": ../middleware/error.ts)
