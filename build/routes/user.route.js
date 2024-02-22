"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//STEP: 14
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const userRouter = express_1.default.Router();
userRouter.post('/registration', user_controller_1.registrationUser);
//STEP: 18
userRouter.post('/activate-user', user_controller_1.activateUser); //don't forget to import "activateUser"
//watch: 2:40:21 to 2:46:16
//now, will set up "user login-logout". Watch: 2:46:17 to 2:47:45
//OVER: 18 ("m": ../models.user.model.ts)
//STEP: 25
userRouter.post('/login', user_controller_1.loginUser); //don't forget to import "loginUser". Also, watch: 3:08:08 to 3:09:31 
//OVER: 25("m": ../controllers/user.controller.ts)
// //STEP: 27
// userRouter.get('/logout', logoutUser); //don't forget to import "logoutUser". Also, watch- 3:11:15 to 3:13:00
// //OVER: 27("c": ../middleware/auth.ts and "m": ../midddleware/auth.ts)
//STEP: 28
userRouter.get('/logout', auth_1.isAuthenticated, user_controller_1.logoutUser); //don't forget to import "isAuthenticated". Also, watch- 3:18:35 to 3:21:36
//OVER: 28 ("m": ../controllers/user.controller.ts)
//STEP: 32
userRouter.get("/refresh", user_controller_1.updateAccessToken); //don't forget to import "updateAccessToken". Also, watch- 3:35:35 to 3:38:15
//now, we will start seeting up code for "getting user-info"
//OVER: 32("c": ../services & ../services/user.service.ts and "m": ../services/user.service.ts)
//STEP: 35
userRouter.get("/me", auth_1.isAuthenticated, user_controller_1.getUserInfo); //don't forget to import "getUserInfo". Also, watch- 3:41:30 to 3:43:00
//OVER: 35
//STEP: 37
userRouter.post("/social-auth", user_controller_1.socialAuth); //don't forget to import "socialAuth". Also, watch- 3:45:21 to 3:49:05
//now, we will set up the code for updating user info, password and avatar
//OVER: 37("m": ../controllers/user.controller.ts)
//STEP: 39
userRouter.put("/update-user-info", auth_1.isAuthenticated, user_controller_1.updateUserInfo); //don't forget to import "updateUserInfo". Also, watch- 3:56:50 to 3:59:40
//OVER: 39("m": ../controllers/user.controller.ts)
//STEP: 41
userRouter.put("/update-user-password", auth_1.isAuthenticated, user_controller_1.updatePassword); //don't forget to import "updatePassword". Also, watch- 4:03:50 - 4:07:05
//open the "server" folder terminal and type: "npm i cloudinary"
//OVER: 41("m": ../controllers/user.controller.ts)
//STEP: 46
userRouter.put("/update-user-avatar", auth_1.isAuthenticated, user_controller_1.updateProfilePicture); //don't forget to import "updateProfilePicture". Also, watch- 4:18:10 to
//now that we are done the the "Handling-errors and user-authentication" section(PLEASE NOTE THAT BECODEMY HAS NOT TAUGHT TWO THINGS: "FORGOT PASSWORD & DELETE MY ACCOUNT. MAKE THEM ON YOUR OWN"), we will we towards "Course-model and course-creation section". First, we shall design the course model backend.
//OVER: 46("c": ../models/course.model.ts and "m": ../models/course.model.ts)
//STEP: 94
userRouter.get("/get-users", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), user_controller_1.getAllUsers); //don't forget to import "athorizeRoles()" & "getAllUsers". Also, watch- 7:20:50 to 7:23:45
//now, we will set up code to "add memebers" and "get members" in admin dashboard 
//OVER: 94("m": ../services/user.service.ts)
//STEP: 97
userRouter.put("/update-user", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), user_controller_1.updateUserRole); //don't forget to import "updateUserRole". Also, watch- 7:27:00 to 7:28:45.
//now, we will set up course for deleting user
//OVER: 97("m": ../controllers/user.controller.ts)
//STEP: 99
userRouter.delete("/delete-user/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), user_controller_1.deleteUser); //don't forget to import "deleteUser". Also, watch- 7:31:25 to 7:33:15
//note that "becodemy" has not taught how a user can delete his own account, so do it yourself
//now, we will set up course for deleting course
//OVER: 99("m": ../controllers/course.controller.ts)
exports.default = userRouter;
//OVER: 14 ("m": ../app.ts)
