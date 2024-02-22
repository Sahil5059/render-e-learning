"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.getNotifications = void 0;
//STEP: 77
const notification_model_1 = __importDefault(require("../models/notification.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
//STEP: 84
const node_cron_1 = __importDefault(require("node-cron"));
//OVER: 84
exports.getNotifications = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        //getting all notifications --this feature is only for admin
        const notifications = await notification_model_1.default.find().sort({ createdAt: -1 }); //watch- 6:50:55 to 6:51:35
        res.status(201).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 77("c": ../routes/notification.route.ts and "m": ../routes/notification.route.ts)
//STEP: 80
//setting up code for "updating notification status" --admin only
exports.updateNotification = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const notification = await notification_model_1.default.findById(req.params.id);
        if (!notification) {
            return next(new ErrorHandler_1.default("Notification not found", 404));
        }
        else {
            notification.status = "read";
        }
        //saving updated notification data
        await notification.save();
        //updating notifications data for frontend admin panel
        const notifications = await notification_model_1.default.find().sort({ createdAt: -1 });
        res.status(201).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 80("m": ../routes/notification.route.ts)
//STEP: 85
//watch-7:08:45 to 7:14:16
node_cron_1.default.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notification_model_1.default.deleteMany({ status: "read", createdAt: { $lt: thirtyDaysAgo } });
    console.log("Deleted read successfully");
});
//now we will set up code for "getting all users, courses, orders"
//OVER: 85("m": ../services/user.services.ts)
