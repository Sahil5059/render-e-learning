"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPayment = exports.sendStripePublishableKey = exports.getAllOrders = exports.createOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
//IMPORT: 74
const order_service_1 = require("../services/order.service");
//IMPORT-OVER
//IMPORT: 91
const order_service_2 = require("../services/order.service");
const redis_1 = require("../utils/redis");
//IMPORT-OVER
//creating order
exports.createOrder = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;
        //EXTRA-STEP(STRIPE-INTEGRATION(after the 92nd step)) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //watch- 1:20:45 to 1:22:25
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== "succeeded") {
                    return next(new ErrorHandler_1.default("Payment not authorized!", 400));
                }
            }
        }
        //OVER ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //searching for user
        const user = await user_model_1.default.findById(req.user?._id);
        //checking if the user has already purchased the course or not. If he has already purchased it, then he must not be able to buy it again.
        const courseExistInUser = user?.courses.some((course) => course._id.toString() === courseId);
        if (courseExistInUser) {
            return next(new ErrorHandler_1.default("You have already purchase this course", 400));
        }
        //searching if the course is present in mongo db database
        const course = await course_model_1.default.findById(courseId); //watch(part-3)- 5:23:20 to 5:23:35
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        //creating data for order
        const data = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        };
        //STEP: 74
        //creating confirmation mail to be sent to the user after successfull order creation. Also, first create an email layout in the "mails" folder for order confirmation e-mail and then come back.
        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), //for time of order creation
            }
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, '../mails/order-confirmation.ejs'), { order: mailData }); //i.e. we are sending data to email from "order" which is in the const "mailData"
        //sending confirmation email
        try {
            if (user) {
                await (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 500));
        }
        //adding the purchased course in the user
        user?.courses.push(course?._id);
        await redis_1.redis.set(req.user?._id, JSON.stringify(user));
        await user?.save();
        //creating notification (about purchase) to be sent to the admin-dashboard
        await notification_model_1.default.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order ${course?.name}`,
        });
        //increasing the purchase count of the course
        course.purchased = course.purchased + 1;
        await course.save();
        const courses = await course_model_1.default.find();
        await redis_1.redis.set("allCourses", JSON.stringify(courses));
        await redis_1.redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //creating order
        (0, order_service_1.newOrder)(data, res, next);
        //OVER: 74("c": ../routes.order.route.ts and "m": ../routes.order.route.ts)
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 72("m": ../services/order.service.ts)
//STEP: 91
//get all orders ---admin only
exports.getAllOrders = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, order_service_2.getAllOrdersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//integrating stripe with our backend
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.sendStripePublishableKey = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res) => {
    res.status(200).json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY //watch(part:3)- 1:15:30 to 1:17:35
    });
});
//new payment
exports.newPayment = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        //first, open the "server" folder in the terminal and type: "npm i stripe"
        const myPayment = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "INR",
            metadata: {
                company: "E-Learning",
            },
            automatic_payment_methods: {
                enabled: true,
            }
        });
        res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 91("m": ../routes/course.route.ts)
