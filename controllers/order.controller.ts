//STEP: 72
import { NextFunction,Request,Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, {IOrder} from "../models/order.model";
import userModel from "../models/user.model";
import CourseModel, { ICourse } from "../models/course.model";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";

//IMPORT: 74
import { newOrder } from "../services/order.service";
//IMPORT-OVER

//IMPORT: 91
import { getAllOrdersService } from "../services/order.service";
import { redis } from "../utils/redis";
//IMPORT-OVER

//creating order
export const createOrder = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {courseId,payment_info} = req.body as IOrder;

        //EXTRA-STEP(STRIPE-INTEGRATION(after the 92nd step)) ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //watch- 1:20:45 to 1:22:25
        if(payment_info){
            if("id" in payment_info){
                const paymentIntentId = payment_info.id;
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                if(paymentIntent.status !== "succeeded"){
                    return next(new ErrorHandler("Payment not authorized!", 400));
                }
            }
        }
        //OVER ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        //searching for user
        const user = await userModel.findById(req.user?._id);
        //checking if the user has already purchased the course or not. If he has already purchased it, then he must not be able to buy it again.
        const courseExistInUser = user?.courses.some((course:any) => course._id.toString() === courseId);
        if(courseExistInUser){
            return next(new ErrorHandler("You have already purchase this course", 400));
        }
        //searching if the course is present in mongo db database
        const course:ICourse | null = await CourseModel.findById(courseId); //watch(part-3)- 5:23:20 to 5:23:35
        if(!course){
            return next(new ErrorHandler("Course not found", 404));
        }
        //creating data for order
        const data:any = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        }

        //STEP: 74
        //creating confirmation mail to be sent to the user after successfull order creation. Also, first create an email layout in the "mails" folder for order confirmation e-mail and then come back.
        const mailData = {
            order:{
                _id: course._id.toString().slice(0,6), //without "toString()", "slice()" will not work because originally, "id" is an object-id and not a string
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'}), //for time of order creation
            }
        }
        const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirmation.ejs'), {order:mailData}); //i.e. we are sending data to email from "order" which is in the const "mailData"
        //sending confirmation email
        try {
            if(user){
                await sendMail({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        } catch (error:any) {
            return next(new ErrorHandler(error.message, 500));
        }
        //adding the purchased course in the user
        user?.courses.push(course?._id);
        await redis.set(req.user?._id, JSON.stringify(user));
        await user?.save();
        //creating notification (about purchase) to be sent to the admin-dashboard
        await NotificationModel.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order ${course?.name}`,
        });
        //increasing the purchase count of the course
        course.purchased = course.purchased + 1;
        await course.save();
        const courses = await CourseModel.find();
        await redis.set("allCourses", JSON.stringify(courses));
        await redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //creating order
        newOrder(data,res,next);
        //OVER: 74("c": ../routes.order.route.ts and "m": ../routes.order.route.ts)
        
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 72("m": ../services/order.service.ts)

//STEP: 91
//get all orders ---admin only
export const getAllOrders = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        getAllOrdersService(res);
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//integrating stripe with our backend
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
export const sendStripePublishableKey = CatchAsyncError(async(req:Request, res:Response) => {
    res.status(200).json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY //watch(part:3)- 1:15:30 to 1:17:35
    })
});
//new payment
export const newPayment = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
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
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})
//OVER: 91("m": ../routes/course.route.ts)