//STEP: 75
import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders, newPayment, sendStripePublishableKey } from "../controllers/order.controller";
const orderRouter = express.Router();
orderRouter.post("/create-order", isAuthenticated, createOrder); //Don't forget to import "isAuthenticated" & "createOrder".

//STEP: 93
orderRouter.get("/get-orders", isAuthenticated, authorizeRoles("admin"), getAllOrders); //Don't forget to import "authorizeRoles()" & "getAllOrders".
orderRouter.get("/payment/stripepublishablekey", sendStripePublishableKey);
orderRouter.post("/payment", isAuthenticated, newPayment);
//OVER: 93("m": ./user.route.ts)

export default orderRouter;
//OVER: 75(../app.ts)