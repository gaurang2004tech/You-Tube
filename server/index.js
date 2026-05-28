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

import fs from "fs";

dotenv.config();
const app = express();

// Ensure uploads directory exists (Render filesystem is ephemeral)
fs.mkdirSync("uploads", { recursive: true });

// Global Logger for Debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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

// Global Multer Error Handler
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "File is too large. Maximum allowed size is 200MB." });
  }
  if (err.message && err.message.startsWith("Unsupported file type")) {
    return res.status(400).json({ message: err.message });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Something went wrong." });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});

const socketToUser = new Map();
// Track active calls: userId -> partnerUserId
const userActiveCalls = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-auth", (userId) => {
    socket.join(userId);
    socketToUser.set(socket.id, userId);
    console.log(`User ${userId} joined signaling room`);
  });

  socket.on("call-user", ({ to, offer, fromName, fromId }) => {
    console.log(`Incoming call from ${fromName} to ${to}`);
    // Track the pending call direction
    userActiveCalls.set(fromId, to);
    io.to(to).emit("incoming-call", { offer, fromName, fromId });
  });

  socket.on("answer-call", ({ to, answer }) => {
    const answererId = socketToUser.get(socket.id);
    if (answererId) userActiveCalls.set(answererId, to);
    io.to(to).emit("call-answered", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", ({ to }) => {
    const userId = socketToUser.get(socket.id);
    if (userId) userActiveCalls.delete(userId);
    if (to) userActiveCalls.delete(to);
    io.to(to).emit("call-ended");
  });

  socket.on("toggle-screen-share", ({ to, isSharing }) => {
    io.to(to).emit("screen-share-toggled", { isSharing });
  });

  socket.on("disconnect", () => {
    const userId = socketToUser.get(socket.id);
    socketToUser.delete(socket.id);
    console.log(`User disconnected: ${socket.id} (${userId})`);

    // If the user was mid-call, notify the other person
    if (userId && userActiveCalls.has(userId)) {
      const partnerId = userActiveCalls.get(userId);
      userActiveCalls.delete(userId);
      if (partnerId) {
        userActiveCalls.delete(partnerId);
        io.to(partnerId).emit("call-ended");
        console.log(`Notified ${partnerId} that ${userId} disconnected mid-call`);
      }
    }
  });
});

const DBURL = process.env.DB_URL;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!DBURL) {
    console.error("WARNING: DB_URL environment variable is not defined!");
  } else {
    mongoose
      .connect(DBURL)
      .then(() => {
        console.log("Mongodb connected");
      })
      .catch((error) => {
        console.error("Mongodb connection error:", error);
      });
  }
});
