//STEP: 110
import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layout.controller";
const layoutRouter = express.Router();
layoutRouter.post("/create-layout", isAuthenticated, authorizeRoles("admin"), createLayout); //don't forget to import "isAuthenticated", "authorizeRoles()" & "createLayout"

//STEP: 113
layoutRouter.put("/edit-layout", isAuthenticated, authorizeRoles("admin"), editLayout); //don't forget to import "editLayout". Also, watch- 8:30:10 to  8:34:30
//now, we will set up code for getting layout by "type" for every person who visits the website to see(doesn't matter if he is lagged in or not)
//OVER: 113("m": ../controllers/layout.controller.ts)

//STEP: 115
layoutRouter.get("/get-layout/:type", getLayoutByType); //don't forget to import "getLayoutByType". Also, watch- 8:36:45 to 8:39:00
//now, we shall understand and apply "ADVANCED CACHE MAINTAINENCE", watch- 8:39:00 to 8:54:59
//OVER: 115("../controllers/user.controller.ts")

export default layoutRouter;
//OVER: 110("m": ../app.ts)