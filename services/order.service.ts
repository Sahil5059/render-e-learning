//STEP: 73
import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/order.model";
//creating new order
export const newOrder = CatchAsyncError(async(data:any, res:Response) => {
    const order = await OrderModel.create(data);
    //sending response
    res.status(201).json({
        success: true,
        order,
    });
});
//OVER: 73("m": ../controller/order.controller.ts)

//STEP: 90
//getting all orders
export const getAllOrdersService = async (res: Response) => {
    const orders = await OrderModel.find().sort({createdAt: -1});
    res.status(201).json({
        success: true,
        orders,
    });
}
//OVER: 90("m": ../controllers/order.controller.ts)