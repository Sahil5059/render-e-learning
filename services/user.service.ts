//STEP: 33
import { Response } from "express";
import userModel from "../models/user.model";
import { redis } from "../utils/redis";

//getting user by id
export const getUserById = async(id: string, res: Response) => {
    const userJson = await redis.get(id); //we would have done this with mongodb if we were not using redis as cache
    if(userJson){
        const user = JSON.parse(userJson);
        res.status(201).json({
            success: true,
            user,
        });
    }
}
//OVER: 33("m": ../controllers/user.controller.ts)

//STEP: 86
//getting all users
export const getAllUsersService = async (res: Response) => {
    const users = await userModel.find().sort({createdAt: -1});
    res.status(201).json({
        success: true,
        users,
    });
}
//OVER: 86("m": ../controllers/user.controller.ts)

//STEP: 95
//update user role
export const updateUserRoleService = async(res:Response, id:string, role:string) => {
    const user = await userModel.findByIdAndUpdate(id, {role}, {new:true});
    res.status(201).json({
        success: true,
        user,
    });
}
//OVER: 95("m": ../controllers/user.controller.ts)