"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getAllUsers = exports.updateProfilePicture = exports.updatePassword = exports.updateUserInfo = exports.socialAuth = exports.getUserInfo = exports.updateAccessToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.createActivationToken = exports.registrationUser = void 0;
//STEP: 13
//open the "server" folder in therminal and type: "npm i ejs nodemailer" once it's installed, then type "npm i --save-dev @types/ejs", install it and then type:"npm i --save-dev @types/nodemailer"
require('dotenv').config();
const user_model_1 = __importDefault(require("../models/user.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); //JSON Web Tokens (or JWT) are a compact, URL-safe way to transfer pieces of data between two parties
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
//IMPORT: 24 & 31
const jwt_1 = require("../utils/jwt");
//IMPORT-OVER: 24 & 31
//IMPORT: 29
const redis_1 = require("../utils/redis");
//IMPORT-OVER: 29
//IMPORT: 34
const user_service_1 = require("../services/user.service");
//IMPORT-OVER
//STEP: 42
const cloudinary_1 = __importDefault(require("cloudinary"));
//OVER: 42
//IMPORT: 87
const user_service_2 = require("../services/user.service");
//IMPORT-OVER
//IMPORT: 96
const user_service_3 = require("../services/user.service");
exports.registrationUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        //now, we will see if the entered email already exists in the database and display appropriate error if it already exists in the databse
        const isEmailExist = await user_model_1.default.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler_1.default("Email already exists", 400));
        }
        ;
        //now, we need our user
        const user = {
            name,
            email,
            password
        };
        //now, we will generate the "activation token" for the user
        const activationToken = (0, exports.createActivationToken)(user); //create this function "createActivationToken" in the "ACTIVATION-TOKEN" section of this page and then come back
        //now, we will send the "activationCode" inside the "activationToken" to the email of the user
        const activationCode = activationToken.activationCode;
        const data = { user: { name: user.name }, activationCode };
        //now, create a folder named "mails" and a then create file inside it named "activation-mail.ejs", write the necessary code for the template that email and then come back here.
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/activation-mail.ejs"), data);
        //now, create a new file named "sendMail.ts" inside the "utils" folder, code in it and then come back
        try {
            await (0, sendMail_1.default)({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            });
            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token,
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 400));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
const createActivationToken = (user) => {
    //now, we will create our own activation token
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    //now, we will create "token". Note that: "the jwt.sign function is usually part of a library that provides JWT functionality". But, first create "ACTIVATION_SECRET" in ".env" file and put any random numbers in it and come back.
    const token = jsonwebtoken_1.default.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m", //you will get an error if you don't write "as Secret" in the above line
    });
    return { token, activationCode };
};
exports.createActivationToken = createActivationToken;
exports.activateUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { activation_token, activation_code } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET);
        //now, we shall verfiy the activation code sent to the user's email
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler_1.default("Invalid activation code", 400));
        }
        const { name, email, password } = newUser.user;
        //now, we will check if the email given by the user already exists in the database or not
        const existUser = await user_model_1.default.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler_1.default("Email already exists", 400));
        }
        //uploading user data to database
        const user = await user_model_1.default.create({
            name,
            email,
            password
        });
        //and then sending appropriate response
        res.status(201).json({
            success: true,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.loginUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler_1.default("Please enter email and password", 400));
        }
        ;
        const user = await user_model_1.default.findOne({ email }).select("+password");
        //now, will display appropriate error if the user does not exist in the database
        if (!user) {
            return next(new ErrorHandler_1.default("Invalid email or password", 400));
        }
        ;
        const isPasswordMatch = await user.comparePassword(password); //this will compare the enterd password with the "hashed" version of user-password stored in our database
        //now, we will display appropriate error if the enterd password is incorrect
        if (!isPasswordMatch) {
            return next(new ErrorHandler_1.default("Invalid email or password", 400));
        }
        ;
        //STEP: 24
        //Importing "sendToken"
        (0, jwt_1.sendToken)(user, 200, res);
        //OVER: 24 ("m": ../routes/user.route.ts)
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//OVER: 21("c": ../utils.jwt.ts and "m": ../utils.jwt.ts)
//STEP: 26
//setting controller for "user-logout". We will be basically emptying the cookie stored for user login which will automatically logout the user.
exports.logoutUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        //STEP: 29
        const userId = req.user?._id || "";
        redis_1.redis.del(userId);
        //OVER: 29
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//OVER: 26("m": ../routes/user.route.ts)
//STEP: 31
//our access token will be expiring every 5 mins, so, setting up the code to update it frequently
exports.updateAccessToken = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN);
        const message = 'Could not refresh token';
        if (!decoded) {
            return next(new ErrorHandler_1.default(message, 400));
        }
        const session = await redis_1.redis.get(decoded.id);
        if (!session) {
            return next(new ErrorHandler_1.default("Please login to access this resource", 400));
        }
        //now, we will store the redis data of the user
        const user = JSON.parse(session);
        //now, we will create a new access token
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
            expiresIn: "5m",
        });
        //now, we will create a new refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
            expiresIn: "3d",
        }); //note that in the ".env" file, we had named "REFRESH_TOKEN_SECRET" as "REFRESH_TOKEN", so don't get confused, it is "REFRESH_TOKEN_SECRET" even though we named it "REFRESH_TOKEN" by mistake. Same goes for "ACCESS_TOKEN" in the ".env" file.
        //now, we will update the user-cookie with the new token(s)
        req.user = user;
        res.cookie("access_token", accessToken, jwt_1.accessTokenOptions); //don't forget to import "accessTokenOptions"
        res.cookie("refresh_token", refreshToken, jwt_1.refreshTokenOptions); //don't forget to import "refreshTokenOptions"
        //STEP: 116
        //now, we will set up code such that the user is updated in redis whenever the "access-token" is refreshed and also, the user-info stored in redis will have an expiry timer of "7 weeks"
        await redis_1.redis.set(user._id, JSON.stringify(user), 'EX', 604800);
        //OVER: 116(BACK-END OVER)
        //sending response
        res.status(200).json({
            status: "success",
            accessToken,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//OVER: 31("m": ../routes/user.route.ts)
//STEP: 34
exports.getUserInfo = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        (0, user_service_1.getUserById)(userId, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//creating social authentication process for back-end
exports.socialAuth = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        //requiring name, email and avatar from front end
        const { email, name, avatar } = req.body;
        const user = await user_model_1.default.findOne({ email });
        //creating a new user (in the "if" part below) if user does not exist
        if (!user) {
            const newUser = await user_model_1.default.create({ email, name, avatar });
            (0, jwt_1.sendToken)(newUser, 200, res);
        }
        else {
            (0, jwt_1.sendToken)(user, 200, res);
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updateUserInfo = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { name } = req.body;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        //creating logic for updating name
        if (name && user) {
            user.name = name; //no checking in database for duplicate user names because two different people can have the save name
        }
        //saving new user-data in mongo db database
        await user?.save();
        //now, updating the user-info in redis cache
        await redis_1.redis.set(userId, JSON.stringify(user));
        //sending response
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updatePassword = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        //displaying appropriate error message if the user forgot to enter either of old or new password or both
        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler_1.default("Please enter old and new password", 400));
        }
        const user = await user_model_1.default.findById(req.user?._id).select("+password"); //we had written "select: false" for "password" in the const "userSchema" in "user.model.ts" and hence our password will not be selected in the const "user" of this line of code until and unless we add ".select("+password")" at the end.
        //now, we know that people who made their account via social-authentication will not have any password in their user account by default. So, if they don't have any possword to begin with, how will thy update it. So, displaying appropriate for that.
        if (user?.password === undefined) {
            return next(new ErrorHandler_1.default("Invalid user", 400));
        }
        //now we will compare the entered "old password" with the user password present in the database(in hashed form) using the function "comparePassword()" we created in "user.model.ts".
        const isPasswordMatch = await user?.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new ErrorHandler_1.default("Invalid old password", 400));
        }
        //replacing old password with new password
        user.password = newPassword;
        //saving updated password in mongo db database and redis cache
        await user.save();
        await redis_1.redis.set(req.user?._id, JSON.stringify(user));
        //sending appropriate response
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updateProfilePicture = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { avatar } = req.body;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        if (avatar && user) {
            //now, we will delete the user profile picture if it already exisits & then upload the new avatar in cloudinary and if it does not exist, we will simply upload the new avatar in cloudinary
            if (user?.avatar?.public_id) {
                await cloudinary_1.default.v2.uploader.destroy(user?.avatar?.public_id);
                const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150, //this will set the width of the avatar images that will uploaded to cloudinary
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
            else {
                const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
        }
        //saving the updtated avatar in the mongo db database and redis cache
        await user?.save();
        await redis_1.redis.set(userId, JSON.stringify(user));
        //sending appropriate response
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//OVER: 43("m": ../server.ts)
//STEP: 87
//get all users ---admin only
exports.getAllUsers = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, user_service_2.getAllUsersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//OVER: 87("m": ../services/course.service.ts)
//STEP: 96
//setting up code to update user role (---admin only)
exports.updateUserRole = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id, role } = req.body;
        (0, user_service_3.updateUserRoleService)(res, id, role);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//OVER: 96("m": ../routes/user.route.ts)
//STEP: 98
//setting up code for deleting user ---admin only
exports.deleteUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await user_model_1.default.findById(id);
        //checking if the user exists in the mongo db database
        if (!user) {
            return next(new ErrorHandler_1.default("User not found", 404));
        }
        //deleteing user from mongo db databse
        await user.deleteOne({ id });
        //deleting user from redis databse
        await redis_1.redis.del(id);
        //sending response
        res.status(200).json({
            success: true,
            message: "User Deleted Successfully"
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
//OVER: 98("m": ../routes/user.route.ts)
