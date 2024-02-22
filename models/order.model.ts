//STEP: 70
import mongoose,{Document,Model,Schema} from "mongoose";
//creating order interface
export interface IOrder extends Document{
    courseId: string;
    userId: string;
    payment_info: object;
}
//creating order schema
const orderSchema = new Schema<IOrder>({
    courseId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    payment_info: {
        type: Object,
        //required: true(later, after setting up front-end)
    },
},{timestamps: true});
//creating order model
const OrderModel:Model<IOrder> = mongoose.model('Order', orderSchema);
export default OrderModel;
//OVER: 70("c": ./notificationModel.ts and "m": ./notificationModel.ts)