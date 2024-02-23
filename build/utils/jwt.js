"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
//STEP: 22
require("dotenv").config();
const redis_1 = require("./redis");
//STEP: 23-a
//parsing environment variables to integrate with fallback values( Detailed explaination by chat-gpt: "Putting it together, the phrase suggests a process where an application reads and interprets its environment variables. If any of these variables are not set or are invalid, the application integrates them with fallback values, ensuring that there is a default option in place. This can be particularly useful for scenarios where certain configuration values are crucial for the application's operation, and providing defaults helps in handling unexpected or missing configurations gracefully.")
//add the following two lines after the "REFRESH_TOKEN" line in the ".env" file and then come back: "ACCESS_TOKEN_EXPIRE = 5" "REFRESH_TOKEN_EXPIRE = 59"
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);
//now, we shall add options for "cookies"
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true, //using this only in deploment (i think so, verify it later)
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true, //using this only in deploment (i think so, verify it later)
};
//OVER: 23-a
const sendToken = (user, statusCode, res) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    //STEP: 23-b
    //uploading user session to redis
    redis_1.redis.set(user._id, JSON.stringify(user));
    //OVER: 23-b("m": ../controllers/user.controller.ts)
    //now, the response part
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
    //now, when the user has successfully logged in, we will add the user session to our "redis"
};
exports.sendToken = sendToken;
//note that the 22nd step has 2 parts "a" and "b", read "a" first and then read "b"
//OVER: 22
