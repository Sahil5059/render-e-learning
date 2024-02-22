"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//STEP: 78
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRouter = express_1.default.Router();
notificationRouter.get("/get-all-notifications", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), notification_controller_1.getNotifications); //Don't frget to import "isAuthenticated", "authorizeRples()" & "getNotifications"
exports.default = notificationRouter;
//STEP: 81
notificationRouter.put("/update-notification/:id", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), notification_controller_1.updateNotification); //Don't forget to import "updateNotification". Watch- 7:00:35 to 7:01:50
//OVER: 81("m": ../controllers/course.controller.ts)
//OVER: 78("m": ../app.ts)
