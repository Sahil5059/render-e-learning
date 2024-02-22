//STEP: 51
import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { addAnswer, addQuestion, addReplyToReview, addReview, deleteCourse, editCourse, generateVideoUrl, getAllCourses, getAllCoursessss, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controller";
const courseRouter = express.Router();
//keep in mind that only admin can create course, not users
courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse); //Don't forget to import "isAuthenticated", "authorizeRoles" & "uploadCourse".

//STEP: 55
courseRouter.put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse); //Don't forget to import "editCourse". Also, watch- 4:54:45 to 4:57:10
//now, we will set up code so that any user can view any single course information(other than the purchasable course content)
//OVER: 55("m": ../controllers/course.controller.ts)

//STEP: 57
courseRouter.get("/get-course/:id", getSingleCourse); //Don't forget to import "getSingleCourse". Also, watch- 5:02:20 to 5:03:35 then watch- 5:11:00 to 5:12:25
//now, we will set up code so that any user can view all courses information(other than the purchasable course content)
//OVER: 57("m": ../controllers/course.controller.ts)

//STEP: 59
courseRouter.get("/get-all-courses", getAllCourses); //Don't forget to import "getALLCourses". Also, watch- 5:05:30 to 5:06:05 and then watch- 5:13:05 to 5:14:30
//now, we will set up code to get course content for valid users
//OVER: 59("m": ../controllers/course.controller.ts)

//STEP: 61
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser); //Don't forget to import "getCourseByUser". Also, watch- 5:19:20 to 5:25:20
//now, we will set up the code for asking a question in a course
//OVER: 61("m": ../controllers/course.controller.ts)

//STEP: 63
courseRouter.put("/add-question", isAuthenticated, addQuestion); //Don't forget to import "addQuestion". Also, watch- 5:32:20 to 5:34:30
//now, we will set up the code for adding answer in the course question
//OVER: 63("m": ../controllers/course.controller.ts)

//STEP: 65
courseRouter.put("/add-answer", isAuthenticated, addAnswer); //Don't forget to import "addAnswer". Also, watch- 5:47:40 to 5:51:00
//now, we will set up the code for adding review in course
//OVER: 65("m": ../controllers/course.controller.ts)

//STEP: 67
courseRouter.put("/add-review/:id", isAuthenticated, addReview); //Don't forget to import "addAReview". Also, watch- 6:02:20 to 6:04:00
//now, we will set up the code for adding reply in the review(for admin only)
//OVER: 67("m": ../controllers/course.controller.ts)

//STEP: 69
courseRouter.put("/add-reply", isAuthenticated, authorizeRoles("admin"), addReplyToReview); //Don't  forget to import "addReplyToReview". Also, watch- 6:08:50 to 6:14:50
//now, we will create order model and notification model
//OVER: 69("c": ../models/orderModel.ts and "m": ../models/orderModel.ts)

//STEP: 92
courseRouter.get("/get-courses", isAuthenticated, authorizeRoles("admin"), getAllCoursessss); //Don't forget to import "getAllCoursessss"
//OVER: 92("m": ./order.route.ts)

courseRouter.post("/getVdoCipherOTP",generateVideoUrl); //made while coding front-end part

//STEP: 101
courseRouter.delete("/delete-course/:id", isAuthenticated, authorizeRoles("admin"), deleteCourse); //Don't forget to import "deleteCourses". Also, watch- 7:36:30 to 7:37:30
//now, we will set up code for admin dashboard analytics
//OVER: 101("c": ../utils/analytics.generator.ts and "m": ../utils/analytics.generator.ts)

export default courseRouter;
//OVER: 51("m": ../app.ts)