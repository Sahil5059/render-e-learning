//STEP: 104
import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from "../controllers/analytics.controller";
const analyticsRouter = express.Router();
analyticsRouter.get("/get-users-analytics", isAuthenticated, authorizeRoles("admin"), getUserAnalytics); //Don't forget to import "isAuthenticated", "authorizeRoles()" & "getUserAnalytics".

//STEP: 107
analyticsRouter.get("/get-courses-analytics", isAuthenticated, authorizeRoles("admin"), getCourseAnalytics); //Don't forget to import "getCourseAnalytics"
analyticsRouter.get("/get-orders-analytics", isAuthenticated, authorizeRoles("admin"), getOrderAnalytics); //Don't forget to import "getOrderAnalytics". Also, watch- 7:57:05 to 7:59:40
//now, we will set up the code for the backend-part of the layout of our website
//OVER: 107("c": ../models/layout.model.ts and "m": ../models/layout.model.ts)

export default analyticsRouter;
//OVER: 104("m": ../app.ts)