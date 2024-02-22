"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//STEP: 110
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const layout_controller_1 = require("../controllers/layout.controller");
const layoutRouter = express_1.default.Router();
layoutRouter.post("/create-layout", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), layout_controller_1.createLayout); //don't forget to import "isAuthenticated", "authorizeRoles()" & "createLayout"
//STEP: 113
layoutRouter.put("/edit-layout", auth_1.isAuthenticated, (0, auth_1.authorizeRoles)("admin"), layout_controller_1.editLayout); //don't forget to import "editLayout". Also, watch- 8:30:10 to  8:34:30
//now, we will set up code for getting layout by "type" for every person who visits the website to see(doesn't matter if he is lagged in or not)
//OVER: 113("m": ../controllers/layout.controller.ts)
//STEP: 115
layoutRouter.get("/get-layout/:type", layout_controller_1.getLayoutByType); //don't forget to import "getLayoutByType". Also, watch- 8:36:45 to 8:39:00
//now, we shall understand and apply "ADVANCED CACHE MAINTAINENCE", watch- 8:39:00 to 8:54:59
//OVER: 115("../controllers/user.controller.ts")
exports.default = layoutRouter;
//OVER: 110("m": ../app.ts)
