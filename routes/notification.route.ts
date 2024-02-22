//STEP: 78
import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getNotifications, updateNotification } from "../controllers/notification.controller";
const notificationRouter = express.Router();
notificationRouter.get("/get-all-notifications", isAuthenticated, authorizeRoles("admin"), getNotifications); //Don't frget to import "isAuthenticated", "authorizeRples()" & "getNotifications"
export default notificationRouter;

//STEP: 81
notificationRouter.put("/update-notification/:id",isAuthenticated, authorizeRoles("admin"), updateNotification); //Don't forget to import "updateNotification". Watch- 7:00:35 to 7:01:50
//OVER: 81("m": ../controllers/course.controller.ts)

//OVER: 78("m": ../app.ts)