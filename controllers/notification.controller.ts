//STEP: 77
import NotificationModel from "../models/notification.model";
import { NextFunction,Request,Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

//STEP: 84
import cron from "node-cron";
//OVER: 84

export const getNotifications = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        //getting all notifications --this feature is only for admin
        const notifications = await NotificationModel.find().sort({createdAt: -1}); //watch- 6:50:55 to 6:51:35
        res.status(201).json({
            success: true,
            notifications,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 77("c": ../routes/notification.route.ts and "m": ../routes/notification.route.ts)

//STEP: 80
//setting up code for "updating notification status" --admin only
export const updateNotification = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const notification = await NotificationModel.findById(req.params.id);
        if(!notification){
            return next(new ErrorHandler("Notification not found", 404));
        }else{
            notification.status = "read";
        }
        //saving updated notification data
        await notification.save();
        //updating notifications data for frontend admin panel
        const notifications = await NotificationModel.find().sort({createdAt: -1});
        res.status(201).json({
            success: true,
            notifications,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 80("m": ../routes/notification.route.ts)

//STEP: 85
//watch-7:08:45 to 7:14:16
cron.schedule("0 0 0 * * *", async() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await NotificationModel.deleteMany({status:"read", createdAt: {$lt: thirtyDaysAgo}});
    console.log("Deleted read successfully");
});
//now we will set up code for "getting all users, courses, orders"
//OVER: 85("m": ../services/user.services.ts)