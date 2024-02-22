//STEP: 13
//open the "server" folder in therminal and type: "npm i ejs nodemailer" once it's installed, then type "npm i --save-dev @types/ejs", install it and then type:"npm i --save-dev @types/nodemailer"
require('dotenv').config();
import { Request,Response,NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, { JwtPayload, Secret } from "jsonwebtoken"; //JSON Web Tokens (or JWT) are a compact, URL-safe way to transfer pieces of data between two parties
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

//IMPORT: 24 & 31
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
//IMPORT-OVER: 24 & 31

//IMPORT: 29
import { redis } from "../utils/redis";
//IMPORT-OVER: 29

//IMPORT: 34
import { getUserById } from "../services/user.service";
//IMPORT-OVER

//STEP: 42
import cloudinary from "cloudinary";
//OVER: 42

//IMPORT: 87
import { getAllUsersService } from "../services/user.service";
//IMPORT-OVER

//IMPORT: 96
import { updateUserRoleService } from "../services/user.service";
//IMPORT-OVER

//now that we are done importing, we shall start coding user-registration
interface IRegistrationBody{
    name: string;
    email: string;
    password: string;
    avatar?: string;
}
export const registrationUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name,email,password} = req.body;
        //now, we will see if the entered email already exists in the database and display appropriate error if it already exists in the databse
        const isEmailExist = await userModel.findOne({email});
        if(isEmailExist){
            return next(new ErrorHandler("Email already exists", 400))
        };
        //now, we need our user
        const user:IRegistrationBody = {
            name,
            email,
            password
        };
        //now, we will generate the "activation token" for the user
        const activationToken = createActivationToken(user); //create this function "createActivationToken" in the "ACTIVATION-TOKEN" section of this page and then come back
        //now, we will send the "activationCode" inside the "activationToken" to the email of the user
        const activationCode = activationToken.activationCode;
        const data = {user: {name:user.name}, activationCode};
        //now, create a folder named "mails" and a then create file inside it named "activation-mail.ejs", write the necessary code for the template that email and then come back here.
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);
        //now, create a new file named "sendMail.ts" inside the "utils" folder, code in it and then come back
        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            });
            res.status(201).json({
                success:true,
                message:`Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token,
            });
        } catch (error:any) {
            return next(new ErrorHandler(error.message,400))
        }

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400))
    }
});
//OVER: 13 ("c": ../routes & ../routes/user.route.ts and "m": ../routes/user.route.ts)

//ACTIVATION-TOKEN
interface IActivationToken{
    token: string;
    activationCode: string;
}
export const createActivationToken = (user: any): IActivationToken => {
    //now, we will create our own activation token
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    //now, we will create "token". Note that: "the jwt.sign function is usually part of a library that provides JWT functionality". But, first create "ACTIVATION_SECRET" in ".env" file and put any random numbers in it and come back.
    const token = jwt.sign({
        user,activationCode
    },process.env.ACTIVATION_SECRET as Secret,{
        expiresIn:"5m", //you will get an error if you don't write "as Secret" in the above line
    });
    return {token,activationCode};
}
//OVER

//STEP: 17
//setting up user activation
interface IActivationRequest{
    activation_token: string;
    activation_code: string;
}
export const activateUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {activation_token,activation_code} = req.body as IActivationRequest;
        const newUser: {user:IUser; activationCode:string} = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as {user:IUser; activationCode:string};
        //now, we shall verfiy the activation code sent to the user's email
        if(newUser.activationCode !== activation_code){
            return next(new ErrorHandler("Invalid activation code", 400));
        }
        const {name,email,password} = newUser.user;
        //now, we will check if the email given by the user already exists in the database or not
        const existUser = await userModel.findOne({email});
        if(existUser){
            return next(new ErrorHandler("Email already exists", 400));
        }
        //uploading user data to database
        const user = await userModel.create({
            name,
            email,
            password
        });
        //and then sending appropriate response
        res.status(201).json({
            success: true,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 17 ("m": ../routes/user.route.js)

//STEP: 21
//seeting up a controller for "user-login"
interface ILoginRequest {
    email: string;
    password: string;
}
export const loginUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email,password} = req.body as ILoginRequest;
        if(!email || !password){
            return next(new ErrorHandler("Please enter email and password", 400));
        };
        const user = await userModel.findOne({email}).select("+password");
        //now, will display appropriate error if the user does not exist in the database
        if(!user){
            return next(new ErrorHandler("Invalid email or password", 400));
        };
        const isPasswordMatch = await user.comparePassword(password); //this will compare the enterd password with the "hashed" version of user-password stored in our database
        //now, we will display appropriate error if the enterd password is incorrect
        if(!isPasswordMatch){
            return next(new ErrorHandler("Invalid email or password", 400));
        };
        
        //STEP: 24
        //Importing "sendToken"
        sendToken(user,200,res);
        //OVER: 24 ("m": ../routes/user.route.ts)

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 21("c": ../utils.jwt.ts and "m": ../utils.jwt.ts)

//STEP: 26
//setting controller for "user-logout". We will be basically emptying the cookie stored for user login which will automatically logout the user.
export const logoutUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        res.cookie("access_token", "", {maxAge: 1});
        res.cookie("refresh_token", "", {maxAge: 1});

        //STEP: 29
        const userId = req.user?._id || "";
        redis.del(userId);
        //OVER: 29

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
})
//OVER: 26("m": ../routes/user.route.ts)

//STEP: 31
//our access token will be expiring every 5 mins, so, setting up the code to update it frequently
export const updateAccessToken = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
        const message = 'Could not refresh token';
        if(!decoded){
            return next(new ErrorHandler(message, 400));
        }
        const session = await redis.get(decoded.id as string);
        if(!session){
            return next(new ErrorHandler("Please login to access this resource", 400));
        }
        //now, we will store the redis data of the user
        const user = JSON.parse(session);
        //now, we will create a new access token
        const accessToken = jwt.sign({id: user._id}, process.env.ACCESS_TOKEN as string, {
            expiresIn: "5m",
        });
        //now, we will create a new refresh token
        const refreshToken = jwt.sign({id: user._id}, process.env.REFRESH_TOKEN as string, {
            expiresIn: "3d",
        }); //note that in the ".env" file, we had named "REFRESH_TOKEN_SECRET" as "REFRESH_TOKEN", so don't get confused, it is "REFRESH_TOKEN_SECRET" even though we named it "REFRESH_TOKEN" by mistake. Same goes for "ACCESS_TOKEN" in the ".env" file.
        //now, we will update the user-cookie with the new token(s)
        req.user = user;
        res.cookie("access_token", accessToken, accessTokenOptions); //don't forget to import "accessTokenOptions"
        res.cookie("refresh_token", refreshToken, refreshTokenOptions); //don't forget to import "refreshTokenOptions"
        
        //STEP: 116
        //now, we will set up code such that the user is updated in redis whenever the "access-token" is refreshed and also, the user-info stored in redis will have an expiry timer of "7 weeks"
        await redis.set(user._id, JSON.stringify(user), 'EX', 604800);
        //OVER: 116(BACK-END OVER)

        //sending response
        res.status(200).json({
            status: "success",
            accessToken,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
})
//OVER: 31("m": ../routes/user.route.ts)

//STEP: 34
export const getUserInfo = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userId = req.user?._id;
        getUserById(userId, res);
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 34("m": ../routes/user.route.ts)

//STEP: 36
interface ISocialAuthBody{
    email: string;
    name: string;
    avatar: string;
}
//creating social authentication process for back-end
export const socialAuth = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        //requiring name, email and avatar from front end
        const {email, name, avatar} = req.body as ISocialAuthBody;
        const user = await userModel.findOne({email});
        //creating a new user (in the "if" part below) if user does not exist
        if(!user){
            const newUser = await userModel.create({email, name, avatar});
            sendToken(newUser, 200, res);
        }
        else{
            sendToken(user, 200, res);
        }
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 36("m": ../routes/user.route.ts)

//STEP: 38
interface IupdateUserInfo {
    name?: string;
    email?: string;
}
export const updateUserInfo = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name} = req.body as IupdateUserInfo;
        const userId = req.user?._id;
        const user = await userModel.findById(userId);
        //creating logic for updating name
        if(name && user){
            user.name = name; //no checking in database for duplicate user names because two different people can have the save name
        }
        //saving new user-data in mongo db database
        await user?.save();
        //now, updating the user-info in redis cache
        await redis.set(userId, JSON.stringify(user));
        //sending response
        res.status(201).json({
            success: true,
            user,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 38("m": ../routes/user.route.ts)

//STEP: 40
//setting up code for updating user password
interface IUpdatePassword{
    oldPassword: string;
    newPassword: string;
}
export const updatePassword = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {oldPassword, newPassword} = req.body as IUpdatePassword;
        //displaying appropriate error message if the user forgot to enter either of old or new password or both
        if(!oldPassword || !newPassword){
            return next(new ErrorHandler("Please enter old and new password", 400));
        }
        const user = await userModel.findById(req.user?._id).select("+password"); //we had written "select: false" for "password" in the const "userSchema" in "user.model.ts" and hence our password will not be selected in the const "user" of this line of code until and unless we add ".select("+password")" at the end.
        //now, we know that people who made their account via social-authentication will not have any password in their user account by default. So, if they don't have any possword to begin with, how will thy update it. So, displaying appropriate for that.
        if(user?.password === undefined){
            return next(new ErrorHandler("Invalid user", 400));
        }
        //now we will compare the entered "old password" with the user password present in the database(in hashed form) using the function "comparePassword()" we created in "user.model.ts".
        const isPasswordMatch = await user?.comparePassword(oldPassword);
        if(!isPasswordMatch){
            return next(new ErrorHandler("Invalid old password", 400));
        }
        //replacing old password with new password
        user.password = newPassword;
        //saving updated password in mongo db database and redis cache
        await user.save();
        await redis.set(req.user?._id, JSON.stringify(user));
        //sending appropriate response
        res.status(201).json({
            success: true,
            user,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
})
//OVER: 40("m": ../routes/user.route.ts)

//OVER: 43
//setting up code for updating avatar i.e. profile-picture
interface IUpdateProfilePicture{
    avatar: string;
}
export const updateProfilePicture = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {avatar} = req.body;
        const userId = req.user?._id;
        const user = await userModel.findById(userId);
        if(avatar && user){
            //now, we will delete the user profile picture if it already exisits & then upload the new avatar in cloudinary and if it does not exist, we will simply upload the new avatar in cloudinary
            if(user?.avatar?.public_id){
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars", //this will create a folder named "avatars" inside cloudinary and store the avatar images in it
                    width: 150, //this will set the width of the avatar images that will uploaded to cloudinary
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                }
            }else{
                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                }
            }
        }
        //saving the updtated avatar in the mongo db database and redis cache
        await user?.save();
        await redis.set(userId, JSON.stringify(user));
        //sending appropriate response
        res.status(200).json({
            success: true,
            user
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 43("m": ../server.ts)

//STEP: 87
//get all users ---admin only
export const getAllUsers = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        getAllUsersService(res);
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 87("m": ../services/course.service.ts)

//STEP: 96
//setting up code to update user role (---admin only)
export const updateUserRole = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {id,role} = req.body;
        updateUserRoleService(res,id,role);
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 96("m": ../routes/user.route.ts)

//STEP: 98
//setting up code for deleting user ---admin only
export const deleteUser = CatchAsyncError(async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;
        const user = await userModel.findById(id);
        //checking if the user exists in the mongo db database
        if(!user){
            return next(new ErrorHandler("User not found", 404));
        }
        //deleteing user from mongo db databse
        await user.deleteOne({id});
        //deleting user from redis databse
        await redis.del(id);
        //sending response
        res.status(200).json({
            success: true,
            message: "User Deleted Successfully"
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});
//OVER: 98("m": ../routes/user.route.ts)