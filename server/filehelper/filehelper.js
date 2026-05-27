"use strict";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "youtube_clone",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "webm", "avi", "mkv", "3gp"],
    // Optional: add a unique identifier if needed, though Cloudinary does this by default
  },
});

const filefilter = (req, file, cb) => {
  const allowed = [
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/mpeg",
    "video/avi",
    "video/x-msvideo",
    "video/3gpp",
    "video/3gpp2",
    "video/x-matroska", // mkv
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload a video file.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: filefilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB max
});
export default upload;
