import { Server } from "socket.io";
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    }
});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

//used to store online users
const userSocketMap = {};// {userId: socketId}


io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) {
        userSocketMap[userId] = socket.id;
    }	

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Add typing event handler
    socket.on("typing", ({ receiverId, senderId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", { senderId });
        }
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, server, app}
