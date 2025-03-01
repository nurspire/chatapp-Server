import dotenv from "dotenv"
import { createServer } from "http"
import { parse } from "url"
import { Server } from "socket.io"
import mongoose from "mongoose"
import Message from "./models/message.js" // Add .js extension
import CallLog from "./models/callLog.js"; // Correct ✅
 // Add .js extension
import Friendship from "./models/friendship.js" // Add .js extension
import User from "./models/chatuser.js" // Add .js extension

// Initialize dotenv
dotenv.config()

// const dev = process.env.NODE_ENV !== "production"
// const app = next({ dev })
// const handle = app.getRequestHandler()

// Add your server setup and socket.io logic here

// app.prepare().then(() => {
//   const server = createServer((req, res) => {
//     const parsedUrl = parse(req.url, true)
//     handle(req, res, parsedUrl)
//   })
const server = createServer();
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  const userSocketMap = {}

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err))

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id)

    socket.on("set user", (userId) => {
      userSocketMap[userId] = socket.id
      console.log(`User connected: ${userId} -> socket id: ${socket.id}`)
    })

    socket.on("new pending request", async ({ receiverId, senderId }) => {
      console.log(`New friend request from ${senderId} to ${receiverId}`)

      const newRequest = new Friendship({
        requester_id: senderId,
        receiver_id: receiverId,
        status: "pending",
      })
      await newRequest.save()

      const sender = await User.findOne({ user_id: senderId }).select("user_id user_name picture")
      const enrichedRequest = {
        _id: newRequest._id,
        requester_id: senderId,
        receiver_id: receiverId,
        status: newRequest.status,
        sender,
      }

      const receiverSocketId = userSocketMap[receiverId]
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new pending request", enrichedRequest)
      }
    })

    socket.on("accept request", async (requestId) => {
      try {
        const request = await Friendship.findById(requestId)
        if (request) {
          request.status = "accepted"
          await request.save()

          const senderSocketId = userSocketMap[request.requester_id]
          const receiverSocketId = userSocketMap[request.receiver_id]

          if (senderSocketId) {
            io.to(senderSocketId).emit("friend request accepted", { requestId })
          }
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("friend request accepted", { requestId })
          }

          console.log(`Friend request ${requestId} accepted.`)
        }
      } catch (error) {
        console.error("Error accepting friend request:", error)
      }
    })

    socket.on("reject request", async (requestId) => {
      try {
        const request = await Friendship.findById(requestId)
        if (request) {
          request.status = "rejected"
          await request.save()

          const senderSocketId = userSocketMap[request.requester_id]
          const receiverSocketId = userSocketMap[request.receiver_id]

          if (senderSocketId) {
            io.to(senderSocketId).emit("friend request rejected", { requestId })
          }
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("friend request rejected", { requestId })
          }

          console.log(`Friend request ${requestId} rejected.`)
        }
      } catch (error) {
        console.error("Error rejecting friend request:", error)
      }
    })

    socket.on("chat message", async ({ text, sender, receiver, type, content }) => {
      const message = new Message({ text, sender, receiver, type, content });
      const savedMessage = await message.save();
    
      const formattedMessage = {
        _id: savedMessage._id,
        text: savedMessage.text,
        sender: savedMessage.sender,
        receiver: savedMessage.receiver,
        timestamp: savedMessage.timestamp,
        type: savedMessage.type,
        content: savedMessage.content,
      };
    
      [sender, receiver].forEach((userId) => {
        const socketId = userSocketMap[userId];
        if (socketId) {
          io.to(socketId).emit("chat message", formattedMessage);
        }
      });
    });

    socket.on("get chat history", async (userId, receiverId) => {
      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: receiverId },
          { sender: receiverId, receiver: userId },
        ],
      }).sort({ timestamp: 1 })

      socket.emit("chat history", messages)
    })


    socket.on("initiate call", async ({ caller, receiver, callType }) => {
      const receiverSocketId = userSocketMap[receiver]
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incoming call", { caller, callType })
      }

      const newCallLog = new CallLog({
        caller,
        receiver,
        startTime: new Date(),
        callType,
        status: "initiated",
      })
      await newCallLog.save()
    })

    socket.on("end call", async ({ caller, receiver }) => {
      const receiverSocketId = userSocketMap[receiver]
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call ended", { caller })
      }

      await CallLog.findOneAndUpdate(
        { caller, receiver, status: "initiated" },
        { status: "ended", endTime: new Date() },
      )
    })

    socket.on("offer", ({ offer, to }) => {
      const receiverSocketId = userSocketMap[to]
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("offer", offer)
      }
    })

    socket.on("answer", ({ answer, to }) => {
      const callerSocketId = userSocketMap[to]
      if (callerSocketId) {
        io.to(callerSocketId).emit("answer", answer)
      }
    })

    socket.on("ice-candidate", ({ candidate, to }) => {
      const receiverSocketId = userSocketMap[to]
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("ice-candidate", candidate)
      }
    })

    socket.on("reject call", ({ caller }) => {
      const callerSocketId = userSocketMap[caller]
      if (callerSocketId) {
        io.to(callerSocketId).emit("call rejected")
      }
    })

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)
      Object.keys(userSocketMap).forEach((userId) => {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId]
        }
      })
    })
  })

  // server.listen(3000, "0.0.0.0", () => {
  //   console.log("Server running on http://<Your-Laptop-IP>:3000")
  // })

  const PORT = process.env.PORT ; // Use Railway's assigned port
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

