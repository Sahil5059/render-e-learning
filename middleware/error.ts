//STEP: 8
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
export const ErrorMiddleware = (err:any, req:Request, res:Response, next:NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal server error';
    //setting up error for "wrong mogno db id error (named as "CastError" by default)". This error will occur when our website API is enternig wrong id.
    if(err.name === 'CastError'){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }
    //setting up error for "Duplicate key error" (statusCode for this type of error is "11000" by default)
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }
    //setting up error for "wrong jwt error (named as "JsonWebTokenError" by default)"
    if(err.name === 'JsonWebTokenError'){
        const message = `Json web token is invalid, try again`;
        err = new ErrorHandler(message, 400);
    }
    //setting up error for "token expired error (named as "TokenExpiredError" by default)"
    if(err.name === 'TokenExpiredError'){
        const message = `Json web token is expired, try again`;
        err = new ErrorHandler(message, 400);
    }
    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
    //now, time to import ErrorHandler from "middleware" and not from "utils". KEEP THAT IN MIND!!
}
//OVER: 8("m": ../app.ts)