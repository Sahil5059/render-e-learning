//STEP: 103
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { generateLast12MonthsData } from "../utils/analytics.genterator";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import OrderModel from "../models/order.model";
//setting up code for getting "How many users were created in the last 28 days and per month upto last year" (---admin only)
export const getUserAnalytics = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const users = await generateLast12MonthsData(userModel);
        res.status(200).json({
            success: true,
            users,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 103 ("c": ../routes/analytics.route.ts and "m": ../routes/analytics.route.ts)

//STEP: 106
//setting up code for getting "How many courses were created in the last 28 days and per month upto last year" (---admin only)
export const getCourseAnalytics = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const courses = await generateLast12MonthsData(CourseModel);
        res.status(200).json({
            success: true,
            courses,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//setting up code for getting "How many orders were created in the last 28 days and per month upto last year" (---admin only)
export const getOrderAnalytics = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const orders = await generateLast12MonthsData(OrderModel);
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 106("m": "../routes/analytics.route.ts")