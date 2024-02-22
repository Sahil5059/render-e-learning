//STEP: 48
import { NextFunction,Request,Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import ejs from "ejs";
import path from "path";
import axios from "axios";

//IMPORT: 50
import { createCourse } from "../services/course.service";
//IMPORT-OVER

//IMPORT: 54
import CourseModel from "../models/course.model";
//IMPORT-OVER

//IMPORT: 56
import { redis } from "../utils/redis";
//IMPORT-OVER

//IMPORT: 62
import mongoose from "mongoose";
//IMPORT-OVER

//IMPORT: 64
import sendMail from "../utils/sendMail";
//IMPORT-OVER

//IMPORT: 82
import NotificationModel from "../models/notification.model";
//IMPORT-OVER

//IMPORT: 89
import { getAllCoursesService } from "../services/course.service";
//IMPORT-OVER

//creating code for uploading of course
export const uploadCourse = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const data = req.body;
        //uploading thumbnail of the course
        const thumbnail = data.thumbnail;
        if(thumbnail){
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        //STEP: 50
        createCourse(data,res,next); //IMPORT
        //OVER: 50("c": ../routes/course.route.ts and "m": ../routes/course.route.ts)
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 48("c": ../services/course.service.ts and "m": ../services/course.service.ts)

//STEP: 54
//setting up code for editing the course
export const editCourse = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const data = req.body;
        //for updating thumbnail
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = await CourseModel.findById(courseId) as any;
        if(thumbnail && !thumbnail.startsWith("https")){  //this logic means that the user is updating thumbnail
            if(courseData.thumbnail.public_id){
                await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id); //we are basically deleting the thumbnail if it already exists
            }
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses",
            }); //this tells cloudinary to create a folder named "courses" and upload the thumbnail image in it
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if(thumbnail && thumbnail.startsWith("https")){ //this logic means that the user is not updating thumbnail
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            };
        }
        //now if we have modified data in the course, we need to update the data in mongo db too
        const course = await CourseModel.findByIdAndUpdate(courseId, {$set: data}, {new: true});
        const courses = await CourseModel.find();
        await redis.set("allCourses", JSON.stringify(courses));
        //sending appropriate response
        res.status(201).json({
            success: true,
            course,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 54("m": ../routes/course.route.ts)

//STEP: 56
export const getSingleCourse = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        //watch- "4:58:00 to 5:01:30" & "5:06:06 to 5:08:45" first
        const courseId = req.params.id;
        const isCacheExist = await redis.get(courseId); //this line will see if redis already has the "desired course-info" as cache
        if(isCacheExist){
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        }else{
            const course = await CourseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            await redis.set(courseId, JSON.stringify(course), 'EX', 604800); //this will upload the "desired course-info" that is to be shown cache data in redis
            res.status(200).json({
                success: true,
                course,
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 56("m": ../routes/course.route.ts)

//STEP: 58
export const getAllCourses = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const isCacheExist = await redis.get("allCourses");
        if(isCacheExist){
            const courses = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                courses,
            });
        }else{
            //const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            const courses = await CourseModel.find();
            await redis.set("allCourses", JSON.stringify(courses));
            res.status(200).json({
                success: true,
                courses,
            });
        }
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 58("m": ../routes/course.route.ts)

//STEP: 60
export const getCourseByUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        //now that we have the user's course list and the id of the course that the user wants to visit, we will verify if that course exisits in the user's database or not
        const courseExists = userCourseList?.find((course:any) => course._id.toString() === courseId); //we are bascially verfying if the "id" of the course that the user is trying to enter matches with the "id" of any course prensent in the "courses" section of the user's mongo db database
        if(!courseExists){
            return next(new ErrorHandler("You are not eligible to access this course", 404));
        }
        const course = await CourseModel.findById(courseId);
        //getting course content
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            content
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 60("m": ../routes/course.route.ts)//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//STEP: 62//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
interface IAddQuestionData{
    question: string;
    courseId: string;
    contentId: string;
}
export const addQuestion = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {question,courseId,contentId}:IAddQuestionData = req.body;
        const course = await CourseModel.findById(courseId);
        //don't forget to import "mongoose" in the next step
        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid content id", 400));
        }
        //now,we will use a shorthand method of the following type of code: "const courseExists = userCourseList?.find((course:any) => course._id.toString() === courseId);"
        const courseContent = course?.courseData?.find((item:any) => item._id.equals(contentId));
        if(!courseContent){
            return next(new ErrorHandler("Invalid content id", 400));
        }
        //creating a new question object
        const newQuestion:any = {
            user: req.user,
            question,
            questionReplies: [], //this will be for the replies of the question asked by the user
        };
        //adding this question to our course content
        courseContent.questions.push(newQuestion);

        //STEP: 82
        //adding "question-asked" notification in mongo db
        await NotificationModel.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `You have a new question in ${courseContent.title}`, //this will specify the video from the course from where the question is asked by the user
        });
        //OVER: 82
        
        //saving the updated course
        await course?.save();
        const courses = await CourseModel.find();
        await redis.set("allCourses", JSON.stringify(courses));
        await redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //sending response
        res.status(200).json({
            success: true,
            course,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 62("m": ../routes/course.route.ts)////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//STEP: 64////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
interface IAddAnswerData{
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}
export const addAnswer = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {answer,courseId,contentId,questionId}:IAddAnswerData = req.body;
        const course = await CourseModel.findById(courseId);
        //checking the existence of content id
        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid content id", 400));
        }
        //matching content id
        const courseContent = course?.courseData?.find((item:any) => item._id.equals(contentId));
        if(!courseContent){
            return next(new ErrorHandler("Invalid content id", 400));
        }
        //matching question id
        const question = courseContent?.questions?.find((item:any) => item._id.equals(questionId));
        if(!question){
            return next(new ErrorHandler("Invalid question id", 400));
        }
        //creating a new answer object
        const newAnswer:any = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updateAt: new Date().toISOString(),
        }
        //adding this answer to our course content
        question.questionReplies.push(newAnswer);
        //saving in mongo db database
        await course?.save();
        const courses = await CourseModel.find();
        await redis.set("allCourses", JSON.stringify(courses));
        await redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //watch- 5:39:15 to 5:41:20
        if(req.user?._id === question.user._id){
            //create a notification later for admin
            
            //STEP: 83
            //adding "reply" notification in mongo db
            await NotificationModel.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have a new question reply received in ${courseContent.title}`,
            })//I think that this code should be used in the "else" part also but I think Becodemy did not think about it.
            //now we will set up the code to delete read notifications automatically after a certain period of time using "cron". First, open "client" in the terminal and type: "npm i node-cron"& hit enter and then type: "npm i @types/node-cron" and then come back.
            //OVER: 83("m": ./notification.controller.ts)

        }else{
            const data = {
                name: question.user.name,
                title: courseContent.title,
            }
            //sending mail to the user that his comment got a reply. First create a mail layout in the file named "question-reply.ejs" in the folder "mails" and then come back.
            const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data);
            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                });
            } catch (error:any) {
                return next(new ErrorHandler(error.message, 500));
            }
        }
        //sending response
        res.status(200).json({
            success: true,
            course,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 64("m": ../routes/course.route.ts)

//STEP: 66
interface IAddReviewData {
    review: string;
    rating: number;
    userId: string;
}
export const addReview = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        //checking if courseId already exists in the userCourseList or not
        const courseExists = userCourseList?.some((course:any) => course._id.toString() === courseId.toString());
        if(!courseExists){
            return next(new ErrorHandler("You are not eligible to access this course", 404));
        }
        //getting course-data from mongo db database
        const course = await CourseModel.findById(courseId);
        const {review,rating} = req.body as IAddReviewData;
        //storing review data
        const reviewData:any = {
            user: req.user,
            rating,
            comment: review,
        }
        //adding "reviewData" in "reviews"
        course?.reviews.push(reviewData);
        //calculating average review for a course
        let avg = 0;
        course?.reviews.forEach((rev:any) => {avg += rev.rating});
        if(course){
            course.ratings = avg / course.reviews.length;
        }
        //saving our course
        await course?.save();
        const courses = await CourseModel.find();
        await redis.set("allCourses", JSON.stringify(courses));
        await redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //creating notification
        await NotificationModel.create({
            user: req.user?._id,
            title: "New Review Received",
            message: `${req.user?.name} has given a review in ${course?.name}`,
        })
        //sending response
        res.status(200).json({
            success: true,
            course,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});
//OVER: 66("m": ../routes/course.route.ts)

//STEP: 68
interface IAddReviewData{
    comment: string;
    courseId: string;
    reviewId: string;
}
export const addReplyToReview = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {comment,courseId,reviewId} = req.body as IAddReviewData;
        //validating if course exisits
        const course = await CourseModel.findById(courseId);
        if(!course){
            return next(new ErrorHandler("Course not found", 404));
        }
        //validating if review exists
        const review = course?.reviews?.find((rev:any) => rev._id.toString() === reviewId);
        if(!review){
            return next(new ErrorHandler("Review not found", 404));
        }
        //adding reply data in reviews
        const replyData:any = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updateAt: new Date().toISOString(),
        }
        //before pushing the reply by admin to "commentReplies", watch this- 6:12:50 to 6:13:10
        if(!review.commentReplies){
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        //saving in mongo db database & redis
        await course?.save();
        const courses = await CourseModel.find();
        await redis.set("allCourses", JSON.stringify(courses));
        await redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //sending respones
        res.status(200).json({
            success: true,
            course,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})
//OVER: 68("m": ../routes/course.route.ts)

//STEP: 89
//get all courses ---admin only
export const getAllCoursessss = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        getAllCoursesService(res);
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 89("m": ../services/order.service.ts)

//STEP: 100
//setting up code for deleting course ---admin only
export const deleteCourse = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;
        const course = await CourseModel.findById(id);
        //checking if the user exists in the mongo db database
        if(!course){
            return next(new ErrorHandler("Course not found", 404));
        }
        //deleting course from mongo db databse
        await course.deleteOne({id});
        //deleting course from redis databse
        await redis.del(id);
        //updating "allCourses" section in "redis" after a course is deleted (not done by Becodemy)
        const courses = await CourseModel.find();
        await redis.set("allCourses", JSON.stringify(courses));
        //sending response
        res.status(200).json({
            success: true,
            message: "Course Deleted Successfully"
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 100("m": ../routes/course.route.ts)

//made while coding front-end part
//generate video url
export const generateVideoUrl = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {videoId} = req.body;
        const response = await axios.post( //don't forget import "axios"
            `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
            { ttl: 300 },
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
                },
            }
        );
        //sending response
        res.json(response.data);
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//now, go to "course.route.ts" and post the necessary route