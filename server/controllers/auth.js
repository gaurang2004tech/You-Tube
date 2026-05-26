import mongoose from "mongoose";
import nodemailer from "nodemailer";
import users from "../Modals/Auth.js";

// OTP Store Map (in-memory)
// Format: { "email_or_mobile": { otp: "1234", expiresAt: Number } }
const otpStore = new Map();

// Nodemailer setup
const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

export const login = async (req, res) => {
  const { email, name, image } = req.body;
  try {
    const existingUser = await users.findOne({ email });
    if (!existingUser) {
      const newUser = await users.create({ email, name, image });
      return res.status(201).json({ result: newUser });
    } else {
      return res.status(200).json({ result: existingUser });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User unavailable..." });
  }
  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      { $set: { channelname, description } },
      { new: true }
    );
    return res.status(201).json(updatedata);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ─── Track Download (Gold plan = unlimited, all others = 1/day) ───────────────
export const trackDownload = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ message: "User not found" });
  }
  try {
    const user = await users.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Gold plan: unlimited downloads
    if (user.plan === "gold") {
      return res.status(200).json({ allowed: true, plan: user.plan });
    }

    // Free / Bronze / Silver: 1 download per day
    const now = new Date();
    const lastDate = user.lastDownloadDate ? new Date(user.lastDownloadDate) : null;
    const isSameDay =
      lastDate &&
      lastDate.getFullYear() === now.getFullYear() &&
      lastDate.getMonth() === now.getMonth() &&
      lastDate.getDate() === now.getDate();

    if (isSameDay && user.downloadCount >= 1) {
      return res.status(200).json({ allowed: false, reason: "limit" });
    }

    const updatedCount = isSameDay ? user.downloadCount + 1 : 1;
    await users.findByIdAndUpdate(_id, {
      $set: { downloadCount: updatedCount, lastDownloadDate: now },
    });
    return res.status(200).json({ allowed: true, plan: user.plan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ─── Send OTP ────────────────────────────────────────────────────────────────
export const sendOtp = async (req, res) => {
  const { identifier, type } = req.body;
  if (!identifier || !type) {
    return res.status(400).json({ message: "Identifier and type required" });
  }

  // Generate 4 digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  otpStore.set(identifier, { otp, expiresAt });

  if (type === "email") {
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"YourTube Auth" <${process.env.NODEMAILER_USER}>`,
        to: identifier,
        subject: "Your YourTube Login OTP",
        html: `<h2>Your OTP is: ${otp}</h2><p>It expires in 5 minutes.</p>`,
      });
      return res.status(200).json({ message: "Email OTP sent successfully" });
    } catch (err) {
      console.error("Email send failed:", err);
      return res.status(500).json({ message: "Failed to send email OTP" });
    }
  } else if (type === "mobile") {
    // Mock Mobile SMS
    console.log(`\n========================================`);
    console.log(`📱 MOCK SMS OTP for ${identifier}: ${otp}`);
    console.log(`========================================\n`);
    return res.status(200).json({ message: "Mobile OTP sent successfully (check console)" });
  } else {
    return res.status(400).json({ message: "Invalid type" });
  }
};

// ─── Verify OTP ──────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  const { identifier, otp, type, region } = req.body;
  if (!identifier || !otp || !type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const storedData = otpStore.get(identifier);
  if (!storedData) {
    return res.status(400).json({ message: "No OTP requested for this identifier" });
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(identifier);
    return res.status(400).json({ message: "OTP expired" });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // OTP is correct! Clear it from memory.
  otpStore.delete(identifier);

  try {
    let user;
    if (type === "email") {
      user = await users.findOne({ email: identifier });
      if (!user) {
        user = await users.create({
          email: identifier,
          name: identifier.split("@")[0],
          region
        });
      }
    } else if (type === "mobile") {
      user = await users.findOne({ mobile: identifier });
      if (!user) {
        user = await users.create({
          mobile: identifier,
          name: "User_" + identifier.substring(identifier.length - 4),
          region
        });
      }
    }

    return res.status(200).json({ result: user });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ message: "Failed to create/login user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await users.find({}, { name: 1, email: 1, image: 1, channelname: 1 });
    return res.status(200).json(allUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
