"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = void 0;
const socket_io_1 = require("socket.io");
const initSocketServer = (server) => {
    const io = new socket_io_1.Server(server);
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
};
exports.initSocketServer = initSocketServer;
