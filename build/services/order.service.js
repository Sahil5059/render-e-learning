"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrdersService = exports.newOrder = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const order_model_1 = __importDefault(require("../models/order.model"));
//creating new order
exports.newOrder = (0, catchAsyncErrors_1.CatchAsyncError)(async (data, res) => {
    const order = await order_model_1.default.create(data);
    //sending response
    res.status(201).json({
        success: true,
        order,
    });
});
//OVER: 73("m": ../controller/order.controller.ts)
//STEP: 90
//getting all orders
const getAllOrdersService = async (res) => {
    const orders = await order_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        orders,
    });
};
exports.getAllOrdersService = getAllOrdersService;
//OVER: 90("m": ../controllers/order.controller.ts)
