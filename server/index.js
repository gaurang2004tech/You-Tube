import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyrroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import paymentroutes from "./routes/payment.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.get("/", (req, res) => {
  res.send("You tube backend is working");
});
app.use(bodyParser.json());
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/payment", paymentroutes);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});

const socketToUser = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-auth", (userId) => {
    socket.join(userId);
    socketToUser.set(socket.id, userId);
    console.log(`User ${userId} joined signaling room`);
  });

  socket.on("call-user", ({ to, offer, fromName, fromId }) => {
    console.log(`Incoming call from ${fromName} to ${to}`);
    io.to(to).emit("incoming-call", { offer, fromName, fromId });
  });

  socket.on("answer-call", ({ to, answer }) => {
    io.to(to).emit("call-answered", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", ({ to }) => {
    io.to(to).emit("call-ended");
  });

  socket.on("toggle-screen-share", ({ to, isSharing }) => {
    io.to(to).emit("screen-share-toggled", { isSharing });
  });

  socket.on("disconnect", () => {
    const userId = socketToUser.get(socket.id);
    socketToUser.delete(socket.id);
    console.log(`User disconnected: ${socket.id} (${userId})`);
  });
});

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected");
    server.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
