"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCoursesService = exports.createCourse = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const redis_1 = require("../utils/redis");
//setting up code to "create course"
exports.createCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (data, res) => {
    const course = await course_model_1.default.create(data);
    //now, the next two lines of code are written by me. Keep in mind that if a data is fetched from "redis" and not "mongo db", everytime you set up a code to change/delete that data from "mongo db", you must ensure that that data is also updated in "redis" or else the user will be shown the old version of that data stored in "redis"
    //const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
    const courses = await course_model_1.default.find();
    await redis_1.redis.set("allCourses", JSON.stringify(courses));
    res.status(201).json({
        success: true,
        course
    });
});
//OVER: 49("m": ../controllers/course.controller.ts)
//STEP: 88
//getting all courses
const getAllCoursesService = async (res) => {
    const courses = await course_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        courses,
    });
};
exports.getAllCoursesService = getAllCoursesService;
//OVER: 88("m": ../controllers/course.controller.ts)
