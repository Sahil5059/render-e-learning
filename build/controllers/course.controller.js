"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideoUrl = exports.deleteCourse = exports.getAllCoursessss = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.getCourseByUser = exports.getAllCourses = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
//IMPORT: 50
const course_service_1 = require("../services/course.service");
//IMPORT-OVER
//IMPORT: 54
const course_model_1 = __importDefault(require("../models/course.model"));
//IMPORT-OVER
//IMPORT: 56
const redis_1 = require("../utils/redis");
//IMPORT-OVER
//IMPORT: 62
const mongoose_1 = __importDefault(require("mongoose"));
//IMPORT-OVER
//IMPORT: 64
const sendMail_1 = __importDefault(require("../utils/sendMail"));
//IMPORT-OVER
//IMPORT: 82
const notification_model_1 = __importDefault(require("../models/notification.model"));
//IMPORT-OVER
//IMPORT: 89
const course_service_2 = require("../services/course.service");
//IMPORT-OVER
//creating code for uploading of course
exports.uploadCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        //uploading thumbnail of the course
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            };
        }
        //STEP: 50
        (0, course_service_1.createCourse)(data, res, next); //IMPORT
        //OVER: 50("c": ../routes/course.route.ts and "m": ../routes/course.route.ts)
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 48("c": ../services/course.service.ts and "m": ../services/course.service.ts)
//STEP: 54
//setting up code for editing the course
exports.editCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        //for updating thumbnail
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = await course_model_1.default.findById(courseId);
        if (thumbnail && !thumbnail.startsWith("https")) { //this logic means that the user is updating thumbnail
            if (courseData.thumbnail.public_id) {
                await cloudinary_1.default.v2.uploader.destroy(courseData.thumbnail.public_id); //we are basically deleting the thumbnail if it already exists
            }
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            }); //this tells cloudinary to create a folder named "courses" and upload the thumbnail image in it
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (thumbnail && thumbnail.startsWith("https")) { //this logic means that the user is not updating thumbnail
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            };
        }
        //now if we have modified data in the course, we need to update the data in mongo db too
        const course = await course_model_1.default.findByIdAndUpdate(courseId, { $set: data }, { new: true });
        const courses = await course_model_1.default.find();
        await redis_1.redis.set("allCourses", JSON.stringify(courses));
        //sending appropriate response
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 54("m": ../routes/course.route.ts)
//STEP: 56
exports.getSingleCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        //watch- "4:58:00 to 5:01:30" & "5:06:06 to 5:08:45" first
        const courseId = req.params.id;
        const isCacheExist = await redis_1.redis.get(courseId); //this line will see if redis already has the "desired course-info" as cache
        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const course = await course_model_1.default.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            await redis_1.redis.set(courseId, JSON.stringify(course), 'EX', 604800); //this will upload the "desired course-info" that is to be shown cache data in redis
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 56("m": ../routes/course.route.ts)
//STEP: 58
exports.getAllCourses = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const isCacheExist = await redis_1.redis.get("allCourses");
        if (isCacheExist) {
            const courses = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                courses,
            });
        }
        else {
            //const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            const courses = await course_model_1.default.find();
            await redis_1.redis.set("allCourses", JSON.stringify(courses));
            res.status(200).json({
                success: true,
                courses,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 58("m": ../routes/course.route.ts)
//STEP: 60
exports.getCourseByUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        //now that we have the user's course list and the id of the course that the user wants to visit, we will verify if that course exisits in the user's database or not
        const courseExists = userCourseList?.find((course) => course._id.toString() === courseId); //we are bascially verfying if the "id" of the course that the user is trying to enter matches with the "id" of any course prensent in the "courses" section of the user's mongo db database
        if (!courseExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 404));
        }
        const course = await course_model_1.default.findById(courseId);
        //getting course content
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            content
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addQuestion = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        //don't forget to import "mongoose" in the next step
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        //now,we will use a shorthand method of the following type of code: "const courseExists = userCourseList?.find((course:any) => course._id.toString() === courseId);"
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        //creating a new question object
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [], //this will be for the replies of the question asked by the user
        };
        //adding this question to our course content
        courseContent.questions.push(newQuestion);
        //STEP: 82
        //adding "question-asked" notification in mongo db
        await notification_model_1.default.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `You have a new question in ${courseContent.title}`, //this will specify the video from the course from where the question is asked by the user
        });
        //OVER: 82
        //saving the updated course
        await course?.save();
        const courses = await course_model_1.default.find();
        await redis_1.redis.set("allCourses", JSON.stringify(courses));
        await redis_1.redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //sending response
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addAnswer = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        //checking the existence of content id
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        //matching content id
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        //matching question id
        const question = courseContent?.questions?.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler_1.default("Invalid question id", 400));
        }
        //creating a new answer object
        const newAnswer = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updateAt: new Date().toISOString(),
        };
        //adding this answer to our course content
        question.questionReplies.push(newAnswer);
        //saving in mongo db database
        await course?.save();
        const courses = await course_model_1.default.find();
        await redis_1.redis.set("allCourses", JSON.stringify(courses));
        await redis_1.redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //watch- 5:39:15 to 5:41:20
        if (req.user?._id === question.user._id) {
            //create a notification later for admin
            //STEP: 83
            //adding "reply" notification in mongo db
            await notification_model_1.default.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have a new question reply received in ${courseContent.title}`,
            }); //I think that this code should be used in the "else" part also but I think Becodemy did not think about it.
            //now we will set up the code to delete read notifications automatically after a certain period of time using "cron". First, open "client" in the terminal and type: "npm i node-cron"& hit enter and then type: "npm i @types/node-cron" and then come back.
            //OVER: 83("m": ./notification.controller.ts)
        }
        else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            };
            //sending mail to the user that his comment got a reply. First create a mail layout in the file named "question-reply.ejs" in the folder "mails" and then come back.
            const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/question-reply.ejs"), data);
            try {
                await (0, sendMail_1.default)({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                });
            }
            catch (error) {
                return next(new ErrorHandler_1.default(error.message, 500));
            }
        }
        //sending response
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReview = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        //checking if courseId already exists in the userCourseList or not
        const courseExists = userCourseList?.some((course) => course._id.toString() === courseId.toString());
        if (!courseExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 404));
        }
        //getting course-data from mongo db database
        const course = await course_model_1.default.findById(courseId);
        const { review, rating } = req.body;
        //storing review data
        const reviewData = {
            user: req.user,
            rating,
            comment: review,
        };
        //adding "reviewData" in "reviews"
        course?.reviews.push(reviewData);
        //calculating average review for a course
        let avg = 0;
        course?.reviews.forEach((rev) => { avg += rev.rating; });
        if (course) {
            course.ratings = avg / course.reviews.length;
        }
        //saving our course
        await course?.save();
        const courses = await course_model_1.default.find();
        await redis_1.redis.set("allCourses", JSON.stringify(courses));
        await redis_1.redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //creating notification
        await notification_model_1.default.create({
            user: req.user?._id,
            title: "New Review Received",
            message: `${req.user?.name} has given a review in ${course?.name}`,
        });
        //sending response
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReplyToReview = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        //validating if course exisits
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        //validating if review exists
        const review = course?.reviews?.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new ErrorHandler_1.default("Review not found", 404));
        }
        //adding reply data in reviews
        const replyData = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updateAt: new Date().toISOString(),
        };
        //before pushing the reply by admin to "commentReplies", watch this- 6:12:50 to 6:13:10
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        //saving in mongo db database & redis
        await course?.save();
        const courses = await course_model_1.default.find();
        await redis_1.redis.set("allCourses", JSON.stringify(courses));
        await redis_1.redis.set(courseId, JSON.stringify(course), 'EX', 604800);
        //sending respones
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
//OVER: 68("m": ../routes/course.route.ts)
//STEP: 89
//get all courses ---admin only
exports.getAllCoursessss = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, course_service_2.getAllCoursesService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//OVER: 89("m": ../services/order.service.ts)
//STEP: 100
//setting up code for deleting course ---admin only
exports.deleteCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await course_model_1.default.findById(id);
        //checking if the user exists in the mongo db database
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        //deleting course from mongo db databse
        await course.deleteOne({ id });
        //deleting course from redis databse
        await redis_1.redis.del(id);
        //updating "allCourses" section in "redis" after a course is deleted (not done by Becodemy)
        const courses = await course_model_1.default.find();
        await redis_1.redis.set("allCourses", JSON.stringify(courses));
        //sending response
        res.status(200).json({
            success: true,
            message: "Course Deleted Successfully"
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//OVER: 100("m": ../routes/course.route.ts)
//made while coding front-end part
//generate video url
exports.generateVideoUrl = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { videoId } = req.body;
        const response = await axios_1.default.post(//don't forget import "axios"
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
            },
        });
        //sending response
        res.json(response.data);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//now, go to "course.route.ts" and post the necessary route
