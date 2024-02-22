//STEP: 71
import mongoose,{Document,Model,Schema} from "mongoose";
//creating notification interface
export interface INotification extends Document{
    title: string;
    message: string;
    status: string;
    userId: string;
}
//creating notification schema
const notificationSchema = new Schema<INotification>({
    title:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    status:{
        type: String,
        required: true,
        default: "unread" //by default, the notification will obviously be marked as unread
    },
},{timestamps: true});
//creating notification model
const NotificationModel:Model<INotification> = mongoose.model('Notification', notificationSchema);
export default NotificationModel;
//now, we will set up code for creating order
//OVER: 71("c": ../controllers.order.controller.ts & ../services/order.service.ts and "m": ../controllers.order.controller.ts)