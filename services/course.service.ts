//STEP: 49
import { Response } from "express";
import CourseModel from "../models/course.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { redis } from "../utils/redis";
//setting up code to "create course"
export const createCourse = CatchAsyncError(async(data:any, res:Response) => {
    const course = await CourseModel.create(data);
    //now, the next two lines of code are written by me. Keep in mind that if a data is fetched from "redis" and not "mongo db", everytime you set up a code to change/delete that data from "mongo db", you must ensure that that data is also updated in "redis" or else the user will be shown the old version of that data stored in "redis"
    //const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
    const courses = await CourseModel.find();
    await redis.set("allCourses", JSON.stringify(courses));
    res.status(201).json({
        success: true,
        course
    });
});
//OVER: 49("m": ../controllers/course.controller.ts)

//STEP: 88
//getting all courses
export const getAllCoursesService = async (res: Response) => {
    const courses = await CourseModel.find().sort({createdAt: -1});
    res.status(201).json({
        success: true,
        courses,
    });
}
//OVER: 88("m": ../controllers/course.controller.ts)