import {Server as SocketIOServer} from "socket.io";
import http from "http";

export const initSocketServer = (server: http.Server) => {
    const io = new SocketIOServer(server);
    //4:46:25 to 4:55:10
    io.on("connection", (socket) => {
        console.log("A user connected");

        //Listening for "notification" event from the frontend
        socket.on("notification", (data) => {
            //Broadcasting the notification data to all connected clients (admin dashboard)
            io.emit("newNotification", data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
    });
}