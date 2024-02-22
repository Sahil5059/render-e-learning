"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticated = void 0;
const catchAsyncErrors_1 = require("./catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../utils/redis");
exports.isAuthenticated = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        return next(new ErrorHandler_1.default("Please login to access this resource", 400));
    }
    //now, we will verify the "access_token"
    const decoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN); //this will first verfiy the access_token and if verified, then it will store the information (which we stored inside the "jwt") as "payload" inside the const: "decoded". console log the "decoded" constant to see it's contents.
    if (!decoded) {
        return next(new ErrorHandler_1.default("access token is not valid", 400));
    }
    const user = await redis_1.redis.get(decoded.id); //because we are storing data in our redis cache
    if (!user) {
        return next(new ErrorHandler_1.default("Please login to access this resource", 400));
    }
    req.user = JSON.parse(user); //watch: 3:16:35 to 3:18:15
    next();
});
//now, go to "user.route.ts" after this step is over, comment the entire 27th STEP.
//OVER: 28("m": ../routes/user.route.ts)
//STEP: 30
//we will be validating user roles in this section
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler_1.default(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
        }
        next(); //watch: 3:22:33 to 3:23:35
    };
};
exports.authorizeRoles = authorizeRoles;
//OVER: 30("m": ../controllers/user.controller.ts)
