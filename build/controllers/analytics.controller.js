"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderAnalytics = exports.getCourseAnalytics = exports.getUserAnalytics = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const analytics_genterator_1 = require("../utils/analytics.genterator");
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
//setting up code for getting "How many users were created in the last 28 days and per month upto last year" (---admin only)
exports.getUserAnalytics = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const users = await (0, analytics_genterator_1.generateLast12MonthsData)(user_model_1.default);
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 103 ("c": ../routes/analytics.route.ts and "m": ../routes/analytics.route.ts)
//STEP: 106
//setting up code for getting "How many courses were created in the last 28 days and per month upto last year" (---admin only)
exports.getCourseAnalytics = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const courses = await (0, analytics_genterator_1.generateLast12MonthsData)(course_model_1.default);
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//setting up code for getting "How many orders were created in the last 28 days and per month upto last year" (---admin only)
exports.getOrderAnalytics = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const orders = await (0, analytics_genterator_1.generateLast12MonthsData)(order_model_1.default);
        res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 106("m": "../routes/analytics.route.ts")
