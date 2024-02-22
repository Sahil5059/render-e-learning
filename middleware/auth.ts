//STEP: 28
import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
export const isAuthenticated = CatchAsyncError(async(req:Request, res:Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;
    if(!access_token){
        return next(new ErrorHandler("Please login to access this resource", 400));
    }
    //now, we will verify the "access_token"
    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload; //this will first verfiy the access_token and if verified, then it will store the information (which we stored inside the "jwt") as "payload" inside the const: "decoded". console log the "decoded" constant to see it's contents.
    if(!decoded){
        return next(new ErrorHandler("access token is not valid", 400));
    }
    const user = await redis.get(decoded.id); //because we are storing data in our redis cache
    if(!user){
        return next(new ErrorHandler("Please login to access this resource", 400));
    }
    req.user = JSON.parse(user); //watch: 3:16:35 to 3:18:15
    next();
});
//now, go to "user.route.ts" after this step is over, comment the entire 27th STEP.
//OVER: 28("m": ../routes/user.route.ts)

//STEP: 30
//we will be validating user roles in this section
export const authorizeRoles = (...roles: string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        if(!roles.includes(req.user?.role || '')){
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
        }
        next(); //watch: 3:22:33 to 3:23:35
    }
}
//OVER: 30("m": ../controllers/user.controller.ts)