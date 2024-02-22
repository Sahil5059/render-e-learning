"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//STEP: 104
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const analytics_controller_1 = require("../controllers/analytics.controller");
const analyticsRouter = express_1.default.Router();
analyticsRouter.get("/get-users-analytics", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analytics_controller_1.getUserAnalytics); //Don't forget to import "isAuthenticated", "authorizeRoles()" & "getUserAnalytics".
//STEP: 107
analyticsRouter.get("/get-courses-analytics", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analytics_controller_1.getCourseAnalytics); //Don't forget to import "getCourseAnalytics"
analyticsRouter.get("/get-orders-analytics", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), analytics_controller_1.getOrderAnalytics); //Don't forget to import "getOrderAnalytics". Also, watch- 7:57:05 to 7:59:40
//now, we will set up the code for the backend-part of the layout of our website
//OVER: 107("c": ../models/layout.model.ts and "m": ../models/layout.model.ts)
exports.default = analyticsRouter;
//OVER: 104("m": ../app.ts)
